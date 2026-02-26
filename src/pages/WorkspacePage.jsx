import React, { useState, useMemo, useCallback } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useFrentesForWorkspace } from '../hooks/useFrentes'
import { useDonos } from '../hooks/useDonos'
import { useAuth } from '../contexts/AuthContext'
import { useUI } from '../contexts/UIContext'
import { useResponsive } from '../hooks/useSupabase'
import { normalizeConfig } from '../lib/configAdapter'
import { splitDonos, isOverdue, daysLeft, formatDate } from '../lib/constants'

import PageHeader from '../components/workspace/PageHeader'
import FilterBar from '../components/workspace/FilterBar'
import DashboardView from '../components/workspace/DashboardView'
import KanbanBoard from '../components/workspace/KanbanBoard'
import ListView from '../components/workspace/ListView'
import DetailModal from '../components/workspace/DetailModal'
import NewItemModal from '../components/workspace/NewItemModal'

/**
 * WorkspacePage — generic page for ANY workspace.
 * Replaces Plano.jsx, Casa.jsx, and the old Noha.jsx (per-workspace).
 * Driven entirely by the workspace config from DB.
 */
export default function WorkspacePage({ workspace, view = 'dashboard' }) {
  const config = useMemo(() => normalizeConfig(workspace), [workspace])

  const { tasks, loading, updateTask, addTask, deleteTask, addComment } = useTasks(workspace?.id)
  const { frenteNames, frenteCores, addFrente } = useFrentesForWorkspace(workspace?.id)
  const { donoNames, addDono } = useDonos(workspace?.id)
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
  const allDonos = useMemo(() => {
    const s = new Set(donoNames)
    tasks.forEach(t => splitDonos(t.dono).forEach(d => { if (d) s.add(d) }))
    return Array.from(s).sort()
  }, [tasks, donoNames])

  const filtered = useMemo(() => tasks.filter(t => {
    if (filters.frente !== 'Todas' && t.frente !== filters.frente) return false
    if (filters.dono !== 'Todos' && !splitDonos(t.dono).includes(filters.dono)) return false
    if (filters.prioridade !== 'Todas' && t.prioridade !== filters.prioridade) return false
    return true
  }), [tasks, filters])

  const stats = useMemo(() => {
    if (!config) return { total: 0, byStatus: {}, done: 0, pct: 0, overdue: 0, inProgress: 0 }
    const total = filtered.length
    const byStatus = {}
    config.statuses.forEach(s => byStatus[s] = 0)
    filtered.forEach(t => {
      const ns = config.normalizeStatus(t.status)
      byStatus[ns] = (byStatus[ns] || 0) + 1
    })
    const done = byStatus[config.doneStatus] || 0
    const overdue = filtered.filter(t => t.status !== config.doneStatus && t.deadline && new Date(t.deadline + 'T23:59:59') < new Date()).length
    const inProgress = byStatus[config.inProgressStatus] || 0
    return { total, byStatus, done, pct: total > 0 ? Math.round(done / total * 100) : 0, overdue, inProgress }
  }, [filtered, config])

  // ─── Handlers ──────────────────────────────────
  const handleUpdate = useCallback(async (id, fields) => {
    const task = tasks.find(t => t.id === id)
    if (fields.status && fields.status !== task?.status) {
      await addComment(id, `⚡ ${task.status} → ${fields.status}`, profile?.name || 'Sistema', true)
      addToast(`Status: ${fields.status}`)
    }
    await updateTask(id, fields)
  }, [tasks, addComment, updateTask, profile, addToast])

  const handleKanbanMove = useCallback(async (itemId, targetGroup) => {
    await handleUpdate(itemId, { status: targetGroup })
  }, [handleUpdate])

  const handleDelete = useCallback(async (id) => {
    await deleteTask(id)
    setModalId(null)
    addToast(`${config.itemLabel} excluíd${config.itemLabel === 'Ação' ? 'a' : 'a'}`)
  }, [deleteTask, addToast, config])

  const handleAdd = useCallback(async (data) => {
    await addTask(data)
    addToast(`${config.itemLabel} criad${config.itemLabel === 'Ação' ? 'a' : 'a'}!`)
  }, [addTask, addToast, config])

  const handleAddFrente = useCallback(async (nome) => {
    await addFrente(nome)
    addToast(`Frente "${nome}" criada!`)
  }, [addFrente, addToast])

  const handleAddDono = useCallback(async (nome) => {
    await addDono(nome)
    addToast(`Responsável "${nome}" adicionado!`)
  }, [addDono, addToast])

  // ─── Kanban helpers ────────────────────────────
  const getGroupKey = useCallback((item) => config.normalizeStatus(item.status), [config])
  const getGroupColor = useCallback((g) => config.statusColors[g]?.c, [config])
  const getBorderColor = useCallback((item) => frenteCores[item.frente] || config.accent, [frenteCores, config])

  // ─── Loading ───────────────────────────────────
  if (!config || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(200,192,175,0.15)', borderTopColor: config?.accent || '#c8c0af' }} />
      </div>
    )
  }

  const modalItem = modalId ? tasks.find(t => t.id === modalId) : null
  const pad = isMobile ? 'px-3 py-2' : 'px-6 py-3'

  return (
    <div className="min-h-screen">
      {modalItem && (
        <DetailModal item={modalItem} config={config} frenteNames={frenteNames}
          donoNames={allDonos}
          onUpdate={handleUpdate} onDelete={handleDelete} onAddComment={addComment}
          onAddFrente={handleAddFrente} onAddDono={handleAddDono}
          onClose={() => setModalId(null)} profileName={profile?.name} />
      )}
      {showNew && (
        <NewItemModal config={config} frenteNames={frenteNames}
          donoNames={allDonos}
          onAdd={handleAdd} onAddFrente={handleAddFrente} onAddDono={handleAddDono}
          onClose={() => setShowNew(false)} />
      )}

      <PageHeader config={config} onNew={() => setShowNew(true)} isMobile={isMobile} />

      <div className={pad}>
        <FilterBar filters={filters} setFilter={setFilter} isMobile={isMobile}
          frenteOptions={['Todas', ...frenteNames]}
          priorityOptions={['Todas', ...config.priorities]}
          donoOptions={['Todos', ...allDonos]} />
      </div>

      <div className={`${pad} pb-24`}>
        {view === 'dashboard' && (
          <DashboardView items={filtered} stats={stats} config={config}
            frenteNames={frenteNames} frenteCores={frenteCores}
            onItemClick={setModalId} isMobile={isMobile} isLandscape={isLandscape} />
        )}
        {view === 'kanban' && (
          <KanbanBoard items={filtered} config={config} groups={config.statuses}
            getGroupKey={getGroupKey} getGroupColor={getGroupColor} getBorderColor={getBorderColor}
            frenteNames={frenteNames} frenteCores={frenteCores}
            showFrente={true}
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
