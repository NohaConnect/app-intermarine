import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useWorkspaces — fetches all workspaces, groups by parent.
 * Returns: { workspaces, parents, children(parentId), addWorkspace, loading }
 */
export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('ordem')
    if (!error) setWorkspaces(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('workspaces-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workspaces' }, () => fetchAll())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchAll])

  // Parent workspaces (no parent_id = top-level clients)
  const parents = workspaces.filter(w => !w.parent_id)

  // Get children of a parent
  const children = useCallback((parentId) => {
    return workspaces.filter(w => w.parent_id === parentId).sort((a, b) => a.ordem - b.ordem)
  }, [workspaces])

  // Get single workspace by id
  const getWorkspace = useCallback((id) => {
    return workspaces.find(w => w.id === id) || null
  }, [workspaces])

  // Create workspace
  const addWorkspace = useCallback(async (ws) => {
    const { data, error } = await supabase
      .from('workspaces')
      .insert(ws)
      .select()
      .single()
    if (error) throw error
    await fetchAll()
    return data
  }, [fetchAll])

  // Update workspace
  const updateWorkspace = useCallback(async (id, updates) => {
    const { error } = await supabase.from('workspaces').update(updates).eq('id', id)
    if (error) throw error
    await fetchAll()
  }, [fetchAll])

  // Delete workspace (cascades tasks, frentes, etc)
  const deleteWorkspace = useCallback(async (id) => {
    const { error } = await supabase.from('workspaces').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }, [fetchAll])

  return {
    workspaces,
    parents,
    children,
    getWorkspace,
    addWorkspace,
    updateWorkspace,
    deleteWorkspace,
    loading,
    refetch: fetchAll,
  }
}
