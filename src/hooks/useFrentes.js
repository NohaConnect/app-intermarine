import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * useFrentesForWorkspace(workspaceId) — frentes for a single workspace.
 * Unified replacement for the old useFrentes.
 */
export function useFrentesForWorkspace(workspaceId) {
  const [frentes, setFrentes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFrentes = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return }
    const { data, error } = await supabase
      .from('frentes')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('ativo', true)
      .order('ordem')
    if (!error) setFrentes(data || [])
    setLoading(false)
  }, [workspaceId])

  useEffect(() => { fetchFrentes() }, [fetchFrentes])

  const frenteNames = frentes.map(f => f.nome)
  const frenteCores = Object.fromEntries(frentes.map(f => [f.nome, f.cor]))

  const addFrente = useCallback(async (nome, cor = '#c8c0af') => {
    if (!workspaceId) return
    const { data: existing } = await supabase
      .from('frentes')
      .select('ordem')
      .eq('workspace_id', workspaceId)
      .order('ordem', { ascending: false })
      .limit(1)
    const nextOrdem = (existing?.[0]?.ordem || 0) + 1
    const { data, error } = await supabase
      .from('frentes')
      .insert({ workspace_id: workspaceId, nome, cor, ordem: nextOrdem, ativo: true })
      .select()
      .single()
    if (error) throw error
    await fetchFrentes()
    return data
  }, [workspaceId, fetchFrentes])

  return { frentes, frenteNames, frenteCores, loading, addFrente, refetch: fetchFrentes }
}
