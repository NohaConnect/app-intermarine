import React, { useState, useMemo, useCallback } from 'react'
import { useAcoes, useFrentes, useResponsive } from '../hooks/useSupabase'
import { useAuth } from '../contexts/AuthContext'
import { useUI } from '../contexts/UIContext'
import { PLANO_CONFIG } from '../lib/workspace-config'
import { FRENTES_IM_CORES, DONOS_PLANO, splitDonos } from '../lib/constants'

import PageHeader from '../components/workspace/PageHeader'
import FilterBar from '../components/workspace/FilterBar'
import DashboardView from '../components/workspace/DashboardView'
import KanbanBoard from '../components/workspace/KanbanBoard'
import ListView from '../components/workspace/ListView'
import DetailModal from '../components/workspace/DetailModal'
import NewItemModal from '../components/workspace/NewItemModal'

const config = PLANO_CONFIG

export default function PlanoPage({ view = 'dashboard' }) {
  const { acoes, loading, updateAcao, addAcao, deleteAcao, addComentario } = useAcoes()
  const { frentesIM, addFrente } = useFrentes()
  const { profile } = useAuth()
  const { addToast } = useUI()
  const { isMobile, isLandscape } = useResponsive()

  // ─── Local UI State ────────────────────────────
  const [modalId, setModalId] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [kanbanGroup, setKanbanGroup] = useState('status')
  const [filters, setFiltersState] = useState({ frente: 'Todas', prioridade: 'Todas', dono: 'Todos' })

  const setFilter = useCallback((key, val) => {
    setFiltersState(prev => ({ ...prev, [key]: val }))
  }, [])

  // ─── Derived Data ──────────────────────────────
  const frenteNames = frentesIM.length > 0 ? frentesIM.map(f => f.nome) : Object.keys(FRENTES_IM_CORES)
  const frenteCores = frentesIM.length > 0 ? Object.fromEntries(frentesIM.map(f => [f.nome, f.cor])) : FRENTES_IM_CORES

  const allDonos = useMemo(() => {
    const s = new Set()
    acoes.forEach(a => splitDonos(a.dono).forEach(d => s.add(d)))
    return Array.from(s).sort()
  }, [acoes])

  const filtered = useMemo(() => acoes.filter(a => {
    if (filters.frente !== 'Todas' && a.frente !== filters.frente) return false
    if (filters.dono !== 'Todos' && !splitDonos(a.dono).includes(filters.dono)) return false
    if (filters.prioridade !== 'Todas' && a.prioridade !== filters.prioridade) return false
    return true
  }), [acoes, filters])

  const stats = useMemo(() => {
    const total = filtered.length
    const byStatus = {}
    config.statuses.forEach(s => byStatus[s] = 0)
    filtered.forEach(a => {
      const ns = config.normalizeStatus(a.status)
      byStatus[ns] = (byStatus[ns] || 0) + 1
    })
    const done = byStatus[config.doneStatus] || 0
    const overdue = filtered.filter(a => a.status !== config.doneStatus && a.deadline && new Date(a.deadline + 'T23:59:59') < new Date()).length
    const inProgress = byStatus[config.inProgressStatus] || 0
    return { total, byStatus, done, pct: total > 0 ? Math.round(done / total * 100) : 0, overdue, inProgress }
  }, [filtered])

  // ─── Handlers ──────────────────────────────────
  const handleUpdate = useCallback(async (id, fields) => {
    const acao = acoes.find(a => a.id === id)
    if (fields.status && fields.status !== acao?.status) {
      await addComentario(id, `⚡ ${acao.status} → ${fields.status}`, profile?.name || 'Sistema', true)
      addToast(`Status: ${fields.status}`)
    }
    await updateAcao(id, fields)
  }, [acoes, addComentario, updateAcao, profile, addToast])

  const handleKanbanMove = useCallback(async (itemId, targetGroup) => {
    const field = kanbanGroup === 'status' ? 'status' : 'frente'
    await handleUpdate(itemId, { [field]: targetGroup })
  }, [kanbanGroup, handleUpdate])

  const handleDelete = useCallback(async (id) => {
    await deleteAcao(id)
    setModalId(null)
    addToast('Ação excluída')
  }, [deleteAcao, addToast])

  const handleAdd = useCallback(async (data) => {
    await addAcao(data)
    addToast('Ação criada!')
  }, [addAcao, addToast])

  const handleAddFrente = useCallback(async (nome) => {
    await addFrente('plano', nome)
    addToast(`Frente "${nome}" criada!`)
  }, [addFrente, addToast])

  // ─── Kanban helpers ────────────────────────────
  const kanbanGroups = kanbanGroup === 'status' ? config.statuses : frenteNames
  const getGroupKey = useCallback((item) => {
    return kanbanGroup === 'status' ? config.normalizeStatus(item.status) : item.frente
  }, [kanbanGroup])
  const getGroupColor = useCallback((g) => {
    return kanbanGroup === 'status' ? config.statusColors[g]?.c : frenteCores[g]
  }, [kanbanGroup, frenteCores])
  const getBorderColor = useCallback((item) => {
    return kanbanGroup === 'status' ? frenteCores[item.frente] || '#4da8da' : frenteCores[item.frente]
  }, [kanbanGroup, frenteCores])

  // ─── Loading ───────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: `rgba(${config.accentRgb},0.15)`, borderTopColor: config.accent }} />
      </div>
    )
  }

  const modalItem = modalId ? acoes.find(a => a.id === modalId) : null
  const pad = isMobile ? 'px-3 py-2' : 'px-6 py-3'

  return (
    <div className="min-h-screen">
      {modalItem && (
        <DetailModal item={modalItem} config={config} frenteNames={frenteNames}
          onUpdate={handleUpdate} onDelete={handleDelete} onAddComment={addComentario}
          onAddFrente={handleAddFrente}
          onClose={() => setModalId(null)} profileName={profile?.name} />
      )}
      {showNew && (
        <NewItemModal config={config} frenteNames={frenteNames}
          allDonos={allDonos.length > 0 ? allDonos : DONOS_PLANO}
          onAdd={handleAdd} onAddFrente={handleAddFrente} onClose={() => setShowNew(false)} />
      )}

      <PageHeader config={config} onNew={() => setShowNew(true)} isMobile={isMobile} />

      <div className={pad}>
        <FilterBar filters={filters} setFilter={setFilter} isMobile={isMobile}
          frenteOptions={['Todas', ...frenteNames]}
          priorityOptions={['Todas', 'Quick Win', 'Ação Tática', 'Projeto Estratégico']}
          donoOptions={['Todos', ...(allDonos.length > 0 ? allDonos : DONOS_PLANO)]}
          showKanbanGroup={view === 'kanban'} kanbanGroup={kanbanGroup} setKanbanGroup={setKanbanGroup} />
      </div>

      <div className={`${pad} pb-24`}>
        {view === 'dashboard' && (
          <DashboardView items={filtered} stats={stats} config={config}
            frenteNames={frenteNames} frenteCores={frenteCores}
            onItemClick={setModalId} isMobile={isMobile} isLandscape={isLandscape} />
        )}
        {view === 'kanban' && (
          <KanbanBoard items={filtered} config={config} groups={kanbanGroups}
            getGroupKey={getGroupKey} getGroupColor={getGroupColor} getBorderColor={getBorderColor}
            frenteNames={frenteNames} frenteCores={frenteCores}
            showFrente={kanbanGroup === 'status'}
            onMove={handleKanbanMove} onItemClick={setModalId} />
        )}
        {view === 'list' && (
          <ListView items={filtered} config={config}
            frenteCores={frenteCores} onItemClick={setModalId} isMobile={isMobile} />
        )}
      </div>
    </div>
  )
}
