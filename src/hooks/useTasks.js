import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useTasks(workspaceId) — unified task hook for any single workspace.
 * Replaces useAcoes, useTarefas, useTarefasCasa.
 */
export function useTasks(workspaceId) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return }
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*, comments(*)')
        .eq('workspace_id', workspaceId)
        .order('id')
      if (err) throw err
      setTasks(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [workspaceId])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // Realtime
  useEffect(() => {
    if (!workspaceId) return
    const channel = supabase
      .channel(`tasks-${workspaceId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `workspace_id=eq.${workspaceId}` }, () => fetchTasks())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchTasks())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [workspaceId, fetchTasks])

  const updateTask = useCallback(async (id, updates) => {
    const { error: err } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    if (err) throw err
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const addTask = useCallback(async (task) => {
    const { data, error: err } = await supabase
      .from('tasks')
      .insert({ ...task, workspace_id: workspaceId })
      .select()
      .single()
    if (err) throw err
    setTasks(prev => [...prev, { ...data, comments: [] }])
    return data
  }, [workspaceId])

  const deleteTask = useCallback(async (id) => {
    const { error: err } = await supabase.from('tasks').delete().eq('id', id)
    if (err) throw err
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  const addComment = useCallback(async (taskId, texto, autor, auto = false) => {
    const { data, error: err } = await supabase
      .from('comments')
      .insert({ task_id: taskId, texto, autor, auto })
      .select()
      .single()
    if (err) throw err
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, comments: [...(t.comments || []), data] }
        : t
    ))
  }, [])

  return { tasks, loading, error, updateTask, addTask, deleteTask, addComment, refetch: fetchTasks }
}

/**
 * useAllTasks(workspaceIds) — fetches tasks from multiple workspaces (for Noha dashboard).
 */
export function useAllTasks(workspaceIds) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    if (!workspaceIds || workspaceIds.length === 0) { setLoading(false); return }
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tasks')
        .select('*, comments(*)')
        .in('workspace_id', workspaceIds)
        .order('id')
      if (error) throw error
      setTasks(data || [])
    } catch (e) {
      console.error('useAllTasks error:', e)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(workspaceIds)])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Realtime on tasks table (any change)
  useEffect(() => {
    const channel = supabase
      .channel('all-tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => fetchAll())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchAll])

  const updateTask = useCallback(async (id, updates) => {
    const { error } = await supabase.from('tasks').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [])

  const addComment = useCallback(async (taskId, texto, autor, auto = false) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({ task_id: taskId, texto, autor, auto })
      .select()
      .single()
    if (error) throw error
    setTasks(prev => prev.map(t =>
      t.id === taskId
        ? { ...t, comments: [...(t.comments || []), data] }
        : t
    ))
  }, [])

  const deleteTask = useCallback(async (id) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  return { tasks, loading, updateTask, addComment, deleteTask, refetch: fetchAll }
}
