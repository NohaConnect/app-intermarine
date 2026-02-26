import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

// Hook para ações do plano Intermarine
export function useAcoes() {
  const [acoes, setAcoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAcoes = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('acoes_intermarine')
        .select('*, comentarios_acoes(*)')
        .order('id')
      if (error) throw error
      setAcoes(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAcoes() }, [fetchAcoes])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('acoes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'acoes_intermarine' }, () => fetchAcoes())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comentarios_acoes' }, () => fetchAcoes())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchAcoes])

  const updateAcao = async (id, updates) => {
    const { error } = await supabase.from('acoes_intermarine').update(updates).eq('id', id)
    if (error) throw error
    setAcoes(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const addAcao = async (acao) => {
    const { data, error } = await supabase.from('acoes_intermarine').insert(acao).select().single()
    if (error) throw error
    setAcoes(prev => [...prev, { ...data, comentarios_acoes: [] }])
    return data
  }

  const deleteAcao = async (id) => {
    const { error } = await supabase.from('acoes_intermarine').delete().eq('id', id)
    if (error) throw error
    setAcoes(prev => prev.filter(a => a.id !== id))
  }

  const addComentario = async (acaoId, texto, autor, auto = false) => {
    const { data, error } = await supabase
      .from('comentarios_acoes')
      .insert({ acao_id: acaoId, texto, autor, auto })
      .select()
      .single()
    if (error) throw error
    setAcoes(prev => prev.map(a =>
      a.id === acaoId
        ? { ...a, comentarios_acoes: [...(a.comentarios_acoes || []), data] }
        : a
    ))
  }

  return { acoes, loading, error, updateAcao, addAcao, deleteAcao, addComentario, refetch: fetchAcoes }
}

// Hook para tarefas Noha
export function useTarefas() {
  const [tarefas, setTarefas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTarefas = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tarefas_noha')
        .select('*, comentarios_tarefas(*)')
        .order('id')
      if (error) throw error
      setTarefas(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTarefas() }, [fetchTarefas])

  useEffect(() => {
    const channel = supabase
      .channel('tarefas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas_noha' }, () => fetchTarefas())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comentarios_tarefas' }, () => fetchTarefas())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchTarefas])

  const updateTarefa = async (id, updates) => {
    const { error } = await supabase.from('tarefas_noha').update(updates).eq('id', id)
    if (error) throw error
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const addTarefa = async (tarefa) => {
    const { data, error } = await supabase.from('tarefas_noha').insert(tarefa).select().single()
    if (error) throw error
    setTarefas(prev => [...prev, { ...data, comentarios_tarefas: [] }])
    return data
  }

  const deleteTarefa = async (id) => {
    const { error } = await supabase.from('tarefas_noha').delete().eq('id', id)
    if (error) throw error
    setTarefas(prev => prev.filter(t => t.id !== id))
  }

  const addComentario = async (tarefaId, texto, autor, auto = false) => {
    const { data, error } = await supabase
      .from('comentarios_tarefas')
      .insert({ tarefa_id: tarefaId, texto, autor, auto })
      .select()
      .single()
    if (error) throw error
    setTarefas(prev => prev.map(t =>
      t.id === tarefaId
        ? { ...t, comentarios_tarefas: [...(t.comentarios_tarefas || []), data] }
        : t
    ))
  }

  return { tarefas, loading, error, updateTarefa, addTarefa, deleteTarefa, addComentario, refetch: fetchTarefas }
}

// Hook para tarefas Casa Intermarine
export function useTarefasCasa() {
  const [tarefas, setTarefas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTarefas = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tarefas_casa')
        .select('*, comentarios_casa(*)')
        .order('id')
      if (error) throw error
      setTarefas(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchTarefas() }, [fetchTarefas])

  useEffect(() => {
    const channel = supabase
      .channel('casa-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tarefas_casa' }, () => fetchTarefas())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comentarios_casa' }, () => fetchTarefas())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [fetchTarefas])

  const updateTarefa = async (id, updates) => {
    const { error } = await supabase.from('tarefas_casa').update(updates).eq('id', id)
    if (error) throw error
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const addTarefa = async (tarefa) => {
    const { data, error } = await supabase.from('tarefas_casa').insert(tarefa).select().single()
    if (error) throw error
    setTarefas(prev => [...prev, { ...data, comentarios_casa: [] }])
    return data
  }

  const deleteTarefa = async (id) => {
    const { error } = await supabase.from('tarefas_casa').delete().eq('id', id)
    if (error) throw error
    setTarefas(prev => prev.filter(t => t.id !== id))
  }

  const addComentario = async (tarefaId, texto, autor, auto = false) => {
    const { data, error } = await supabase
      .from('comentarios_casa')
      .insert({ tarefa_id: tarefaId, texto, autor, auto })
      .select()
      .single()
    if (error) throw error
    setTarefas(prev => prev.map(t =>
      t.id === tarefaId
        ? { ...t, comentarios_casa: [...(t.comentarios_casa || []), data] }
        : t
    ))
  }

  return { tarefas, loading, error, updateTarefa, addTarefa, deleteTarefa, addComentario, refetch: fetchTarefas }
}

// Hook para frentes
export function useFrentes() {
  const [frentesIM, setFrentesIM] = useState([])
  const [frentesNoha, setFrentesNoha] = useState([])
  const [frentesCasa, setFrentesCasa] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const [r1, r2, r3] = await Promise.all([
        supabase.from('frentes_intermarine').select('*').eq('ativo', true).order('ordem'),
        supabase.from('frentes_noha').select('*').eq('ativo', true).order('ordem'),
        supabase.from('frentes_casa').select('*').eq('ativo', true).order('ordem')
      ])
      setFrentesIM(r1.data || [])
      setFrentesNoha(r2.data || [])
      setFrentesCasa(r3.data || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { frentesIM, frentesNoha, frentesCasa, loading }
}

// Hook para responsividade
export function useResponsive() {
  const [state, setState] = useState(() => ({
    isMobile: window.innerWidth < 768,
    isLandscape: window.innerWidth > window.innerHeight && window.innerHeight < 500,
    width: window.innerWidth,
    height: window.innerHeight
  }))

  useEffect(() => {
    const handler = () => setState({
      isMobile: window.innerWidth < 768,
      isLandscape: window.innerWidth > window.innerHeight && window.innerHeight < 500,
      width: window.innerWidth,
      height: window.innerHeight
    })
    window.addEventListener('resize', handler)
    window.addEventListener('orientationchange', handler)
    return () => {
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  }, [])

  return state
}
