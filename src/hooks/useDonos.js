import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useDonos(workspaceId) — dynamic owners per workspace.
 * Also extracts unique owners from existing tasks.
 */
export function useDonos(workspaceId) {
  const [donos, setDonos] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDonos = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return }
    const { data, error } = await supabase
      .from('donos')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('nome')
    if (!error) setDonos(data || [])
    setLoading(false)
  }, [workspaceId])

  useEffect(() => { fetchDonos() }, [fetchDonos])

  const donoNames = donos.map(d => d.nome)

  const addDono = useCallback(async (nome) => {
    if (!workspaceId || !nome.trim()) return
    // Check if already exists
    if (donos.some(d => d.nome === nome.trim())) return
    const { data, error } = await supabase
      .from('donos')
      .insert({ workspace_id: workspaceId, nome: nome.trim() })
      .select()
      .single()
    if (error) {
      // Duplicate — ignore
      if (error.code === '23505') return
      throw error
    }
    setDonos(prev => [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome)))
    return data
  }, [workspaceId, donos])

  return { donos, donoNames, loading, addDono, refetch: fetchDonos }
}
