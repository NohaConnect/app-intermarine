import React, { useState, useMemo, useCallback } from 'react'
import { useTarefas, useFrentes, useResponsive } from '../hooks/useSupabase'
import { useAuth } from '../contexts/AuthContext'
import { useUI } from '../contexts/UIContext'
import { NOHA_CONFIG } from '../lib/workspace-config'
import { FRENTES_NOHA_CORES, FRENTES_IM_CORES, DONOS_NOHA, splitDonos } from '../lib/constants'

import PageHeader from '../components/workspace/PageHeader'
import FilterBar from '../components/workspace/FilterBar'
import DashboardView from '../components/workspace/DashboardView'
import KanbanBoard from '../components/workspace/KanbanBoard'
import ListView from '../components/workspace/ListView'
import DetailModal from '../components/workspace/DetailModal'
import NewItemModal from '../components/workspace/NewItemModal'

const config = NOHA_CONFIG

export default function NohaPage({ view = 'dashboard' }) {
  const { tarefas, loading, updateTarefa, addTarefa, deleteTarefa, addComentario } = useTarefas()
  const { frentesNoha, frentesIM } = useFrentes()
  const { profile } = useAuth()
  const { addToast } = useUI()
  const { isMobile, isLandscape } = useResponsive()

  // ─── Local UI State ────────────────────────────
  const [modalId, setModalId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [filters, setFiltersState] = useState({ frente: 'Todas', prioridade: 'Todas', dono: 'Todos' })

  const setFilter = useCallback((key, val) => {
    setFiltersState(prev => ({ ...prev, [key]: val }))
  }, [])

  // ─── Derived Data ──────────────────────────────
  const frenteNames = frentesNoha.length > 0 ? frentesNoha.map(f => f.nome) : Object.keys(FRENTES_NOHA_CORES)
  const frenteCores = frentesNoha.length > 0 ? Object.fromEntries(frentesNoha.map(f => [f.nome, f.cor])) : FRENTES_NOHA_CORES
  const frentesIMNames = frentesIM.length > 0 ? frentesIM.map(f => f.nome) : Object.keys(FRENTES_IM_CORES)
  const frentesIMCores = frentesIM.length > 0 ? Object.fromEntries(frentesIM.map(f => [f.nome, f.cor])) : FRENTES_IM_CORES

  const allDonos = useMemo(() => {
    const s = new Set()
    tarefas.forEach(t => splitDonos(t.dono).forEach(d => s.add(d)))
    return Array.from(s).sort()
  }, [tarefas])

  const filtered = useMemo(() => tarefas.filter(t => {
    if (filters.frente !== 'Todas' && t.frente !== filters.frente) return false
    if (filters.dono !== 'Todos' && !splitDonos(t.dono).includes(filters.dono)) return false
    if (filters.prioridade !== 'Todas' && t.prioridade !== filters.prioridade) return false
    return true
  }), [tarefas, filters])

  const stats = useMemo(() => {
    const total = filtered.length
    const byStatus = {}
    config.statuses.forEach(s => byStatus[s] = 0)
    filtered.forEach(t => { byStatus[t.status] = (byStatus[t.status] || 0) + 1 })
    const done = byStatus[config.doneStatus] || 0
    const overdue = filtered.filter(t => t.status !== config.doneStatus && t.deadline && new Date(t.deadline + 'T23:59:59') < new Date()).length
    const inProgress = byStatus[config.inProgressStatus] || 0
    return { total, byStatus, done, pct: total > 0 ? Math.round(done / total * 100) : 0, overdue, inProgress }
  }, [filtered])

  // ─── Handlers ──────────────────────────────────
  const handleUpdate = useCallback(async (id, fields) => {
    const tarefa = tarefas.find(t => t.id === id)
    if (fields.status && fields.status !== tarefa?.status) {
      await addComentario(id, `⚡ ${tarefa.status} → ${fields.status}`, profile?.name || 'Sistema', true)
      addToast(`Status: ${fields.status}`)
    }
    await updateTarefa(id, fields)
  }, [tarefas, addComentario, updateTarefa, profile, addToast])

  const handleKanbanMove = useCallback(async (itemId, targetGroup) => {
    await handleUpdate(itemId, { status: targetGroup })
  }, [handleUpdate])

  const handleDelete = useCallback(async (id) => {
    await deleteTarefa(id)
    setModalId(null)
    addToast('Tarefa excluída')
  }, [deleteTarefa, addToast])

  const handleAdd = useCallback(async (data) => {
    await addTarefa(data)
    addToast('Tarefa criada!')
  }, [addTarefa, addToast])

  // ─── Kanban helpers ────────────────────────────
  const getGroupKey = useCallback((item) => item.status, [])
  const getGroupColor = useCallback((g) => config.statusColors[g]?.c, [])
  const getBorderColor = useCallback((item) => frenteCores[item.frente] || config.accent, [frenteCores])

  // ─── Loading ───────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: `rgba(${config.accentRgb},0.15)`, borderTopColor: config.accent }} />
      </div>
    )
  }

  const modalItem = modalId ? tarefas.find(t => t.id === modalId) : null
  const pad = isMobile ? 'px-3 py-2' : 'px-6 py-3'

  return (
    <div className="min-h-screen">
      {modalItem && (
        <DetailModal item={modalItem} config={config} frenteNames={frenteNames}
          frentesIMNames={frentesIMNames} frentesIMCores={frentesIMCores}
          onUpdate={handleUpdate} onDelete={handleDelete} onAddComment={addComentario}
          onClose={() => setModalId(null)} profileName={profile?.name} />
      )}
      {showNew && (
        <NewItemModal config={config} frenteNames={frenteNames}
          allDonos={allDonos.length > 0 ? allDonos : DONOS_NOHA}
          frentesIMNames={frentesIMNames}
          onAdd={handleAdd} onClose={() => setShowNew(false)} />
      )}

      <PageHeader config={config} onNew={() => setShowNew(true)} isMobile={isMobile} />

      <div className={pad}>
        <FilterBar filters={filters} setFilter={setFilter} isMobile={isMobile}
          frenteOptions={['Todas', ...frenteNames]}
          priorityOptions={['Todas', 'Baixa', 'Média', 'Alta', 'Urgente']}
          donoOptions={['Todos', ...(allDonos.length > 0 ? allDonos : DONOS_NOHA)]} />
      </div>

      <div className={`${pad} pb-24`}>
        {view === 'dashboard' && (
          <DashboardView items={filtered} stats={stats} config={config}
            frenteNames={frenteNames} frenteCores={frenteCores} frentesIMCores={frentesIMCores}
            onItemClick={setModalId} isMobile={isMobile} isLandscape={isLandscape} />
        )}
        {view === 'kanban' && (
          <KanbanBoard items={filtered} config={config} groups={config.statuses}
            getGroupKey={getGroupKey} getGroupColor={getGroupColor} getBorderColor={getBorderColor}
            frenteNames={frenteNames} frenteCores={frenteCores} frentesIMCores={frentesIMCores}
            showFrente={true}
            onMove={handleKanbanMove} onItemClick={setModalId} />
        )}
        {view === 'list' && (
          <ListView items={filtered} config={config}
            frenteCores={frenteCores} frentesIMCores={frentesIMCores}
            onItemClick={setModalId} isMobile={isMobile} />
        )}
      </div>
    </div>
  )
}
