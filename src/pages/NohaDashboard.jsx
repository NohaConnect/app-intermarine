import React, { useState, useMemo, useCallback } from 'react'
import { useAllTasks } from '../hooks/useTasks'
import { useFrentesForWorkspace } from '../hooks/useFrentes'
import { useDonos } from '../hooks/useDonos'
import { useAuth } from '../contexts/AuthContext'
import { useUI } from '../contexts/UIContext'
import { useResponsive } from '../hooks/useSupabase'
import { normalizeConfig } from '../lib/configAdapter'
import { splitDonos, isOverdue, daysLeft, formatDate } from '../lib/constants'

import FilterBar from '../components/workspace/FilterBar'
import DetailModal from '../components/workspace/DetailModal'
import RingChart from '../components/ui/RingChart'
import ProgressBar from '../components/ui/ProgressBar'
import { StatusBadge, FrenteBadge } from '../components/ui/Badges'

import { BarChart3, CheckCircle2, Zap, AlertTriangle, Target, Clock, Briefcase, Bell } from 'lucide-react'

// ─── Noha team members (case-insensitive match) ─────
const NOHA_TEAM = [
  'rodrigo', 'noha', 'fernando', 'vitor', 'vitor serrano',
  'rodrigo landin', 'renata', 'renata tiemi',
]

function isNohaTeamTask(task) {
  const donoStr = task?.dono
  if (!donoStr) return false
  const str = typeof donoStr === 'string' ? donoStr : String(donoStr)
  const lower = str.toLowerCase().replace(/:$/g, '').trim()
  // Check if the full dono string contains any Noha team member name
  return NOHA_TEAM.some(member => lower.includes(member))
}

/**
 * NohaDashboard — aggregated view of Noha team tasks across ALL workspaces.
 * Filters to show only tasks owned by the Noha team.
 * Provides Dashboard, Kanban, and Lista views with workspace + sub-workspace filter.
 */
export default function NohaDashboard({ workspaces, view = 'dashboard' }) {
  const { profile } = useAuth()
  const { addToast } = useUI()
  const { isMobile, isLandscape } = useResponsive()

  // Get all non-parent workspace IDs (sub-workspaces + standalone workspaces)
  const leafWorkspaces = useMemo(() => {
    const hasChildren = new Set(workspaces.filter(w => w.parent_id).map(w => w.parent_id))
    return workspaces.filter(w => {
      if (w.parent_id) return true
      if (!hasChildren.has(w.id)) return true
      return false
    })
  }, [workspaces])

  const leafIds = useMemo(() => leafWorkspaces.map(w => w.id), [leafWorkspaces])
  const wsMap = useMemo(() => Object.fromEntries(workspaces.map(w => [w.id, w])), [workspaces])

  const { tasks: allTasks, loading, updateTask, addComment, deleteTask } = useAllTasks(leafIds)

  // ─── Pre-filter: only Noha team tasks ──────────
  const nohaTeamTasks = useMemo(() => allTasks.filter(isNohaTeamTask), [allTasks])

  // ─── Filters ─────────────────────────────────
  const [wsFilter, setWsFilter] = useState('Todos')
  const [subWsFilter, setSubWsFilter] = useState('Todos')
  const [filters, setFiltersState] = useState({ frente: 'Todas', prioridade: 'Todas', dono: 'Todos' })
  const setFilter = useCallback((key, val) => setFiltersState(prev => ({ ...prev, [key]: val })), [])

  // Build workspace display names (parent > child)
  const wsDisplayName = useCallback((wsId) => {
    const ws = wsMap[wsId]
    if (!ws) return 'Desconhecido'
    if (ws.parent_id) {
      const parent = wsMap[ws.parent_id]
      return parent ? `${parent.name} › ${ws.name}` : ws.name
    }
    return ws.name
  }, [wsMap])

  // Sub-workspaces for the selected parent filter
  const subWorkspacesForFilter = useMemo(() => {
    if (wsFilter === 'Todos') return []
    return workspaces.filter(w => w.parent_id === wsFilter).sort((a, b) => (a.ordem || 0) - (b.ordem || 0))
  }, [wsFilter, workspaces])

  // ─── Derived Data ──────────────────────────────
  const filtered = useMemo(() => nohaTeamTasks.filter(t => {
    if (wsFilter !== 'Todos') {
      const ws = wsMap[t.workspace_id]
      if (!ws) return false
      // Check sub-workspace filter first
      if (subWsFilter !== 'Todos') {
        if (t.workspace_id !== subWsFilter) return false
      } else {
        // Check parent filter
        if (t.workspace_id !== wsFilter && ws.parent_id !== wsFilter) return false
      }
    }
    if (filters.frente !== 'Todas' && t.frente !== filters.frente) return false
    if (filters.dono !== 'Todos' && !splitDonos(t.dono).includes(filters.dono)) return false
    if (filters.prioridade !== 'Todas' && t.prioridade !== filters.prioridade) return false
    return true
  }), [nohaTeamTasks, wsFilter, subWsFilter, filters, wsMap])

  const allDonos = useMemo(() => {
    const s = new Set()
    nohaTeamTasks.forEach(t => splitDonos(t.dono).forEach(d => { if (d) s.add(d) }))
    return Array.from(s).sort()
  }, [nohaTeamTasks])

  const allFrentes = useMemo(() => {
    const s = new Set()
    nohaTeamTasks.forEach(t => { if (t.frente) s.add(t.frente) })
    return Array.from(s).sort()
  }, [nohaTeamTasks])

  // Stats
  const stats = useMemo(() => {
    const total = filtered.length
    const done = filtered.filter(t => {
      const ws = wsMap[t.workspace_id]
      return ws && t.status === ws.done_status
    }).length
    const overdue = filtered.filter(t => {
      const ws = wsMap[t.workspace_id]
      return ws && t.status !== ws.done_status && t.deadline && new Date(t.deadline + 'T23:59:59') < new Date()
    }).length
    const inProgress = filtered.filter(t => {
      const ws = wsMap[t.workspace_id]
      return ws && t.status === ws.in_progress_status
    }).length
    return { total, done, pct: total > 0 ? Math.round(done / total * 100) : 0, overdue, inProgress }
  }, [filtered, wsMap])

  // Group by workspace for dashboard
  const byWorkspace = useMemo(() => {
    const map = {}
    filtered.forEach(t => {
      if (!map[t.workspace_id]) map[t.workspace_id] = []
      map[t.workspace_id].push(t)
    })
    return map
  }, [filtered])

  // ─── Attention tasks: due within 14 days (all workspaces, not done) ───
  const attentionTasks = useMemo(() => {
    const now = new Date()
    const in14 = new Date()
    in14.setDate(in14.getDate() + 14)
    return nohaTeamTasks
      .filter(t => {
        if (!t.deadline) return false
        const ws = wsMap[t.workspace_id]
        if (!ws) return false
        if (t.status === ws.done_status) return false
        const d = new Date(t.deadline + 'T23:59:59')
        return d >= now && d <= in14
      })
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
  }, [nohaTeamTasks, wsMap])

  // ─── Modal state ────────────────────────────────
  const [modalId, setModalId] = useState(null)
  const modalItem = modalId ? allTasks.find(t => t.id === modalId) : null
  const modalConfig = modalItem ? normalizeConfig(wsMap[modalItem.workspace_id]) : null

  const handleUpdate = useCallback(async (id, fields) => {
    const task = allTasks.find(t => t.id === id)
    if (fields.status && fields.status !== task?.status) {
      await addComment(id, `⚡ ${task.status} → ${fields.status}`, profile?.name || 'Sistema', true)
      addToast(`Status: ${fields.status}`)
    }
    await updateTask(id, fields)
  }, [allTasks, addComment, updateTask, profile, addToast])

  const handleDelete = useCallback(async (id) => {
    await deleteTask(id)
    setModalId(null)
    addToast('Tarefa excluída')
  }, [deleteTask, addToast])

  // ─── Workspace filter options ──────────────────
  const parentWorkspaces = useMemo(() => workspaces.filter(w => !w.parent_id), [workspaces])

  // Handle parent workspace filter change
  const handleWsFilterChange = useCallback((val) => {
    setWsFilter(val)
    setSubWsFilter('Todos') // reset sub when parent changes
  }, [])

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(200,192,175,0.15)', borderTopColor: '#c8c0af' }} />
      </div>
    )
  }

  const pad = isMobile ? 'px-3 py-2' : 'px-6 py-3'

  return (
    <div className="min-h-screen">
      {/* Detail Modal */}
      {modalItem && modalConfig && (
        <DetailModal item={modalItem} config={modalConfig}
          frenteNames={allFrentes} donoNames={allDonos}
          onUpdate={handleUpdate} onDelete={handleDelete} onAddComment={addComment}
          onClose={() => setModalId(null)} profileName={profile?.name}
          workspaceName={wsDisplayName(modalItem.workspace_id)} />
      )}

      {/* Header */}
      <div className={`${pad} border-b`}
        style={{ background: 'rgba(10,14,26,0.5)', backdropFilter: 'blur(20px)', borderBottomColor: 'rgba(200,192,175,0.1)' }}>
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-bold tracking-widest uppercase flex items-center gap-2"
              style={{ color: '#c8c0af' }}>
              <BarChart3 size={16} /> Noha | Gestão
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(200,192,175,0.3)' }}>
              {stats.total} tarefas em {Object.keys(byWorkspace).length} workspaces
            </div>
          </div>
        </div>
      </div>

      {/* Workspace filter + standard filters */}
      <div className={pad}>
        <div className="glass-card p-2 sm:p-3 flex gap-2 items-center flex-wrap">
          <span className="text-xs font-bold tracking-widest uppercase flex items-center gap-1.5"
            style={{ color: 'rgba(200,192,175,0.3)' }}>
            <Briefcase size={11} /> Cliente
          </span>
          <select value={wsFilter} onChange={e => handleWsFilterChange(e.target.value)} className="select-dark">
            <option value="Todos">Todos</option>
            {parentWorkspaces.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {/* Sub-workspace filter — only shows when a parent with children is selected */}
          {subWorkspacesForFilter.length > 0 && (
            <select value={subWsFilter} onChange={e => setSubWsFilter(e.target.value)} className="select-dark">
              <option value="Todos">Todas áreas</option>
              {subWorkspacesForFilter.map(sw => (
                <option key={sw.id} value={sw.id}>{sw.name}</option>
              ))}
            </select>
          )}
          <select value={filters.frente} onChange={e => setFilter('frente', e.target.value)} className="select-dark">
            <option>Todas</option>
            {allFrentes.map(f => <option key={f}>{f}</option>)}
          </select>
          <select value={filters.prioridade} onChange={e => setFilter('prioridade', e.target.value)} className="select-dark">
            <option>Todas</option>
            {['Baixa', 'Média', 'Alta', 'Urgente'].map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={filters.dono} onChange={e => setFilter('dono', e.target.value)} className="select-dark">
            <option>Todos</option>
            {allDonos.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className={`${pad} pb-24`}>
        {view === 'dashboard' && (
          <div className="space-y-4">
            {/* Global Stats */}
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-2' : 'grid-cols-5'}`}>
              <div className="glass-card p-4 flex items-center gap-4 col-span-2 sm:col-span-1">
                <RingChart value={stats.pct} size={isMobile ? 70 : 80} color="#c8c0af" />
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(200,192,175,0.4)' }}>Geral</div>
                  <div className="text-lg font-black text-white">{stats.pct}%</div>
                </div>
              </div>
              {[
                { label: 'Concluídas', value: stats.done, color: '#4ecdc4', icon: CheckCircle2 },
                { label: 'Em Andamento', value: stats.inProgress, color: '#4da8da', icon: Zap },
                { label: 'Atrasadas', value: stats.overdue, color: '#e74c5e', icon: AlertTriangle },
                { label: 'Total', value: stats.total, color: '#c8c0af', icon: Target },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="glass-card p-3 border-l-4" style={{ borderLeftColor: color }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={13} style={{ color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'rgba(200,192,175,0.4)' }}>{label}</span>
                  </div>
                  <div className="text-xl font-black" style={{ color: value > 0 && label === 'Atrasadas' ? '#e74c5e' : 'white' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Atividades para atenção — next 14 days */}
            {attentionTasks.length > 0 && (
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Bell size={15} style={{ color: '#e6a847' }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#e6a847' }}>
                    Atividades para atenção
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(230,168,71,0.12)', color: '#e6a847' }}>
                    {attentionTasks.length}
                  </span>
                </div>
                <div className="max-h-[300px] overflow-y-auto space-y-1 pr-1">
                  {attentionTasks.map(t => {
                    const ws = wsMap[t.workspace_id]
                    const dl = daysLeft(t.deadline)
                    const urgent = dl <= 3
                    return (
                      <div key={t.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                        onClick={() => setModalId(t.id)}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,192,175,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ws?.accent_color || '#c8c0af' }} />
                        <span className="text-xs text-white/80 flex-1 truncate">{t.titulo}</span>
                        <span className="text-[10px] flex-shrink-0" style={{ color: 'rgba(200,192,175,0.4)' }}>
                          {t.dono ? splitDonos(t.dono)[0] : '—'}
                        </span>
                        <span className="text-[10px] font-semibold flex-shrink-0" style={{ color: urgent ? '#e6a847' : 'rgba(200,192,175,0.3)' }}>
                          {urgent ? '⚠️ ' : ''}{formatDate(t.deadline)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Per-workspace breakdown */}
            <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
              {Object.entries(byWorkspace).map(([wsId, wsTasks]) => {
                const ws = wsMap[wsId]
                if (!ws) return null
                const done = wsTasks.filter(t => t.status === ws.done_status).length
                const pct = wsTasks.length > 0 ? Math.round(done / wsTasks.length * 100) : 0
                return (
                  <div key={wsId} className="glass-card p-4 border-l-4 card-hover" style={{ borderLeftColor: ws.accent_color }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: ws.accent_color }} />
                      <span className="text-sm font-bold text-white/90 flex-1 truncate">{wsDisplayName(wsId)}</span>
                      <span className="text-sm font-bold" style={{ color: ws.accent_color }}>{pct}%</span>
                    </div>
                    <ProgressBar value={pct} color={ws.accent_color} />
                    <div className="mt-2 flex items-center gap-3 text-xs" style={{ color: 'rgba(200,192,175,0.4)' }}>
                      <span>{wsTasks.length} tarefas</span>
                      <span>{done} concluídas</span>
                      <span>{wsTasks.filter(t => t.status !== ws.done_status && t.deadline && new Date(t.deadline + 'T23:59:59') < new Date()).length} atrasadas</span>
                    </div>
                    {/* Task list (top 5) */}
                    <div className="mt-3 space-y-1">
                      {wsTasks.filter(t => t.status !== ws.done_status).slice(0, 5).map(t => (
                        <div key={t.id} className="flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all active:scale-[0.98]"
                          onClick={() => setModalId(t.id)}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,192,175,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: (ws.status_colors || {})[t.status]?.c || ws.accent_color }} />
                          <span className="text-xs text-white/70 flex-1 truncate">{t.titulo}</span>
                          {t.deadline && (
                            <span className="text-[10px]" style={{ color: isOverdue(t.deadline) ? '#e74c5e' : daysLeft(t.deadline) <= 3 ? '#e6a847' : 'rgba(200,192,175,0.3)' }}>
                              {daysLeft(t.deadline) >= 0 && daysLeft(t.deadline) <= 3 ? '⚠️ ' : ''}{formatDate(t.deadline)}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {view === 'kanban' && (
          <div className="space-y-2">
            <p className="text-xs mb-4" style={{ color: 'rgba(200,192,175,0.4)' }}>
              Visão global por status — tarefas da equipe Noha
            </p>
            <div className="flex gap-3 overflow-x-auto pb-4">
              {['Pendente', 'Em Andamento', 'Finalizado', 'Em Espera', 'Não Iniciado', 'A Fazer', 'Em Progresso', 'Em Revisão', 'Concluído', 'Pausado'].map(status => {
                const statusTasks = filtered.filter(t => t.status === status)
                if (statusTasks.length === 0) return null
                return (
                  <div key={status} className="min-w-[260px] max-w-[320px] flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3 px-2 py-2 rounded-lg" style={{ background: 'rgba(200,192,175,0.03)' }}>
                      <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{status}</span>
                      <span className="text-xs font-bold ml-auto px-2 py-0.5 rounded" style={{ background: 'rgba(200,192,175,0.06)', color: 'rgba(200,192,175,0.4)' }}>{statusTasks.length}</span>
                    </div>
                    <div className="space-y-2.5">
                      {statusTasks.map(t => {
                        const ws = wsMap[t.workspace_id]
                        return (
                          <div key={t.id} className="glass-card p-3 border-l-4 card-hover cursor-pointer active:scale-[0.98]"
                            style={{ borderLeftColor: ws?.accent_color || '#c8c0af' }}
                            onClick={() => setModalId(t.id)}>
                            <div className="text-sm font-bold text-white/90 truncate mb-1">{t.titulo}</div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${ws?.accent_color || '#c8c0af'}12`, color: ws?.accent_color || '#c8c0af' }}>
                                {wsDisplayName(t.workspace_id)}
                              </span>
                              {t.dono && <span className="text-[10px]" style={{ color: 'rgba(200,192,175,0.4)' }}>{t.dono}</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {view === 'list' && (
          <div className="glass-card overflow-x-auto">
            <table className="w-full" style={{ minWidth: 680 }}>
              <thead>
                <tr style={{ background: 'rgba(200,192,175,0.02)' }}>
                  {['Tarefa', 'Workspace', 'Frente', 'Dono', 'Status', 'Progresso'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-bold tracking-widest uppercase"
                      style={{ color: 'rgba(200,192,175,0.3)', borderBottom: '1px solid rgba(200,192,175,0.06)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const ws = wsMap[t.workspace_id]
                  const sc = (ws?.status_colors || {})[t.status]
                  return (
                    <tr key={t.id} className="cursor-pointer transition-colors"
                      style={{ background: i % 2 === 0 ? 'rgba(200,192,175,0.01)' : 'transparent' }}
                      onClick={() => setModalId(t.id)}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,192,175,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(200,192,175,0.01)' : 'transparent'}>
                      <td className="px-3 py-2.5 text-sm font-semibold text-white/90" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>{t.titulo}</td>
                      <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${ws?.accent_color || '#c8c0af'}12`, color: ws?.accent_color }}>{wsDisplayName(t.workspace_id)}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)', color: 'rgba(200,192,175,0.5)' }}>{t.frente}</td>
                      <td className="px-3 py-2.5 text-xs" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)', color: 'rgba(200,192,175,0.5)' }}>{t.dono}</td>
                      <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md" style={{ background: sc?.bg, color: sc?.c }}>{t.status}</span>
                      </td>
                      <td className="px-3 py-2.5 w-24" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                        <ProgressBar value={t.progresso || 0} color={ws?.accent_color || '#c8c0af'} slim />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-8 text-center text-xs" style={{ color: 'rgba(200,192,175,0.2)' }}>Nenhuma tarefa encontrada.</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
