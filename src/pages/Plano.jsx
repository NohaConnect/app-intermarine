import React, { useState, useMemo, useRef } from 'react'
import { useAcoes, useFrentes, useResponsive } from '../hooks/useSupabase'
import { useAuth } from '../contexts/AuthContext'
import {
  PLANO_STATUS, PLANO_STATUS_COLORS, PLANO_PRIORIDADE_CONFIG,
  FRENTES_IM_CORES, DONOS_PLANO, splitDonos, isOverdue, daysLeft, formatDate, formatDateTime
} from '../lib/constants'
import {
  Plus, X, ChevronDown, Calendar, User, Flag, Target, MessageSquare,
  Trash2, AlertTriangle, GripVertical, LayoutDashboard, Columns3, List,
  TrendingUp, Clock, CheckCircle2, Zap
} from 'lucide-react'

// SVG Ring Chart component
const RingChart = ({ value, size = 120, stroke = 8, color = '#4ecdc4' }) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} className="ring-chart">
      <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke}
        stroke="rgba(200,192,175,0.06)" />
      <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke}
        stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
    </svg>
  )
}

export default function PlanoPage({ view = 'dashboard' }) {
  const { acoes, loading, updateAcao, addAcao, deleteAcao, addComentario } = useAcoes()
  const { frentesIM } = useFrentes()
  const { profile } = useAuth()
  const { isMobile, isLandscape } = useResponsive()
  const [filterFrente, setFilterFrente] = useState('Todas')
  const [filterPrioridade, setFilterPrioridade] = useState('Todas')
  const [filterDono, setFilterDono] = useState('Todos')
  const [modalId, setModalId] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [kanbanGroup, setKanbanGroup] = useState('status')
  const [draggedId, setDraggedId] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOverGroup, setDragOverGroup] = useState(null)
  const dragRef = useRef(false)

  const frenteNames = frentesIM.length > 0 ? frentesIM.map(f => f.nome) : Object.keys(FRENTES_IM_CORES)
  const frenteCores = frentesIM.length > 0 ? Object.fromEntries(frentesIM.map(f => [f.nome, f.cor])) : FRENTES_IM_CORES

  const normalizeStatus = (status) => PLANO_STATUS.includes(status) ? status : PLANO_STATUS[0]

  const allDonos = useMemo(() => {
    const s = new Set()
    acoes.forEach(a => splitDonos(a.dono).forEach(d => s.add(d)))
    return Array.from(s).sort()
  }, [acoes])

  const filtered = useMemo(() => acoes.filter(a => {
    if (filterFrente !== 'Todas' && a.frente !== filterFrente) return false
    if (filterDono !== 'Todos' && !splitDonos(a.dono).includes(filterDono)) return false
    if (filterPrioridade !== 'Todas' && a.prioridade !== filterPrioridade) return false
    return true
  }), [acoes, filterFrente, filterDono, filterPrioridade])

  const stats = useMemo(() => {
    const total = filtered.length
    const byStatus = {}
    PLANO_STATUS.forEach(s => byStatus[s] = 0)
    filtered.forEach(a => byStatus[normalizeStatus(a.status)] = (byStatus[normalizeStatus(a.status)] || 0) + 1)
    const done = byStatus['Concluído'] || 0
    const overdue = filtered.filter(a => a.status !== 'Concluído' && isOverdue(a.deadline)).length
    const inProgress = byStatus['Em Andamento'] || 0
    return { total, byStatus, done, pct: total > 0 ? Math.round(done / total * 100) : 0, overdue, inProgress }
  }, [filtered])

  // Handlers
  const handleUpdate = async (id, fields) => {
    const acao = acoes.find(a => a.id === id)
    if (fields.status && fields.status !== acao?.status) {
      await addComentario(id, `\u26A1 ${acao.status} \u2192 ${fields.status}`, profile?.name || 'Sistema', true)
    }
    await updateAcao(id, fields)
  }
  const handleAddComment = async (id) => {
    if (!newComment.trim()) return
    await addComentario(id, newComment.trim(), profile?.name || 'Anônimo')
    setNewComment('')
  }
  const handleDelete = async (id) => {
    if (confirm('Excluir esta ação?')) { await deleteAcao(id); setModalId(null) }
  }
  const handleDragStart = (e, id) => {
    setDraggedId(id)
    setIsDragging(true)
    dragRef.current = true
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id.toString())
    // Make ghost semi-transparent
    if (e.target) {
      setTimeout(() => { e.target.style.opacity = '0.4' }, 0)
    }
  }
  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1'
    setDraggedId(null)
    setIsDragging(false)
    setDragOverGroup(null)
    // Prevent click from firing after drag
    setTimeout(() => { dragRef.current = false }, 200)
  }
  const handleDragOver = (e, group) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (group !== undefined) setDragOverGroup(group)
  }
  const handleDragLeave = (e) => {
    // Only reset if leaving the column container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverGroup(null)
    }
  }
  const handleDrop = async (e, targetGroup) => {
    e.preventDefault()
    setDragOverGroup(null)
    if (!draggedId) return
    const field = kanbanGroup === 'status' ? 'status' : 'frente'
    const currentItem = acoes.find(a => a.id === draggedId)
    const currentValue = field === 'status' ? normalizeStatus(currentItem?.[field]) : currentItem?.[field]
    if (currentValue !== targetGroup) {
      await handleUpdate(draggedId, { [field]: targetGroup })
    }
    setDraggedId(null)
    setIsDragging(false)
  }
  const handleCardClick = (id) => {
    if (dragRef.current) return // Prevent click after drag
    setModalId(id)
  }

  // Shared Components
  const Select = ({ value, onChange, options }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className="select-dark">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  const PriorityBadge = ({ p }) => {
    const cfg = PLANO_PRIORIDADE_CONFIG[p]
    if (!cfg) return <span className="text-xs" style={{ color: 'rgba(200,192,175,0.4)' }}>{p}</span>
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md"
        style={{ background: cfg.c + '12', color: cfg.c }}>
        <span>{cfg.icon}</span> {cfg.label}
      </span>
    )
  }

  const StatusBadge = ({ s }) => {
    const cfg = PLANO_STATUS_COLORS[s]
    return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-md"
        style={{ background: cfg?.bg, color: cfg?.c, border: `1px solid ${cfg?.b}` }}>
        {s}
      </span>
    )
  }

  const ProgressBar = ({ value, color = '#4ecdc4', slim = false }) => (
    <div className={slim ? 'progress-bar-sm' : 'progress-bar'}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }} />
    </div>
  )

  // ===== DASHBOARD VIEW =====
  const DashboardView = () => (
    <div className="space-y-4">
      {/* Hero Progress Row */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
        {/* Ring Chart Card */}
        <div className={`glass-card p-5 flex items-center gap-6 ${isMobile ? '' : 'col-span-5'}`}>
          <div className="relative flex-shrink-0">
            <RingChart value={stats.pct} size={isMobile ? 100 : 120} color="#4ecdc4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{stats.pct}%</div>
                <div className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(200,192,175,0.4)' }}>Concluído</div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(200,192,175,0.4)' }}>
                Progresso Geral
              </div>
              <div className="text-xs mt-1" style={{ color: 'rgba(200,192,175,0.3)' }}>Plano Intermarine</div>
            </div>
            <div className="space-y-1.5">
              {PLANO_STATUS.map(s => (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PLANO_STATUS_COLORS[s]?.c }} />
                  <span style={{ color: 'rgba(200,192,175,0.5)' }} className="flex-1">{s}</span>
                  <span className="font-bold text-white/80">{stats.byStatus[s] || 0}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stat Cards */}
        <div className={`grid grid-cols-2 gap-3 ${isMobile ? '' : 'col-span-4'}`}>
          <div className="glass-card p-4 border-l-4 flex flex-col justify-center" style={{ borderLeftColor: '#4ecdc4' }}>
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 size={14} style={{ color: '#4ecdc4' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(200,192,175,0.4)' }}>Concluídas</span>
            </div>
            <div className="text-2xl font-black text-white">{stats.done}</div>
          </div>
          <div className="glass-card p-4 border-l-4 flex flex-col justify-center" style={{ borderLeftColor: '#4da8da' }}>
            <div className="flex items-center gap-2 mb-1">
              <Zap size={14} style={{ color: '#4da8da' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(200,192,175,0.4)' }}>Em Andamento</span>
            </div>
            <div className="text-2xl font-black text-white">{stats.inProgress}</div>
          </div>
          <div className="glass-card p-4 border-l-4 flex flex-col justify-center" style={{ borderLeftColor: '#e74c5e' }}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} style={{ color: '#e74c5e' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(200,192,175,0.4)' }}>Atrasadas</span>
            </div>
            <div className="text-2xl font-black" style={{ color: stats.overdue > 0 ? '#e74c5e' : 'white' }}>{stats.overdue}</div>
          </div>
          <div className="glass-card p-4 border-l-4 flex flex-col justify-center" style={{ borderLeftColor: '#c8c0af' }}>
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} style={{ color: '#c8c0af' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(200,192,175,0.4)' }}>Total</span>
            </div>
            <div className="text-2xl font-black text-white">{stats.total}</div>
          </div>
        </div>

        {/* Overdue Alerts */}
        <div className={`glass-card p-4 ${isMobile ? '' : 'col-span-3'}`}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(200,192,175,0.4)' }}>
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              Próximos Prazos
            </div>
          </div>
          <div className="space-y-2 max-h-[180px] overflow-y-auto">
            {filtered
              .filter(a => a.deadline && a.status !== 'Concluído')
              .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
              .slice(0, 6)
              .map(item => {
                const dl = daysLeft(item.deadline)
                const isLate = dl !== null && dl < 0
                return (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all"
                    style={{ background: isLate ? 'rgba(231,76,94,0.06)' : 'transparent' }}
                    onClick={() => setModalId(item.id)}>
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: isLate ? '#e74c5e' : dl <= 3 ? '#c8c0af' : '#4ecdc4' }} />
                    <span className="text-xs text-white/70 flex-1 truncate">{item.acao}</span>
                    <span className="text-[10px] font-bold flex-shrink-0"
                      style={{ color: isLate ? '#e74c5e' : dl <= 3 ? '#c8c0af' : 'rgba(200,192,175,0.4)' }}>
                      {isLate ? `${Math.abs(dl)}d atrás` : dl === 0 ? 'Hoje' : `${dl}d`}
                    </span>
                  </div>
                )
              })}
            {filtered.filter(a => a.deadline && a.status !== 'Concluído').length === 0 && (
              <div className="text-xs py-4 text-center" style={{ color: 'rgba(200,192,175,0.2)' }}>Nenhum prazo pendente</div>
            )}
          </div>
        </div>
      </div>

      {/* Progress by Frente */}
      <div className={`grid gap-3 ${isLandscape ? 'grid-cols-2' : isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
        {frenteNames.map(frente => {
          const items = filtered.filter(a => a.frente === frente)
          if (items.length === 0) return null
          const done = items.filter(a => a.status === 'Concluído').length
          const pct = Math.round(done / items.length * 100)
          const cor = frenteCores[frente] || '#4da8da'
          return (
            <div key={frente} className="glass-card p-4 card-hover border-l-4" style={{ borderLeftColor: cor }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: cor }} />
                <span className="text-sm font-bold text-white/90 flex-1">{frente}</span>
                <span className="text-sm font-bold" style={{ color: cor }}>{pct}%</span>
              </div>
              <ProgressBar value={pct} color={cor} />
              <div className="mt-3 space-y-1.5">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 cursor-pointer rounded-lg p-1.5 -mx-1.5 transition-all"
                    style={{ ':hover': { background: 'rgba(200,192,175,0.03)' } }}
                    onClick={() => setModalId(item.id)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,192,175,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: PLANO_STATUS_COLORS[normalizeStatus(item.status)]?.c }} />
                    <span className="text-sm text-white/70 flex-1 truncate">{item.acao}</span>
                    <PriorityBadge p={item.prioridade} />
                    {isOverdue(item.deadline) && item.status !== 'Concluído' && (
                      <AlertTriangle size={12} className="flex-shrink-0" style={{ color: '#e74c5e' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  // ===== KANBAN VIEW =====
  const KanbanView = () => {
    const groups = kanbanGroup === 'status' ? PLANO_STATUS : frenteNames
    const getGroupItems = g => kanbanGroup === 'status'
      ? filtered.filter(a => normalizeStatus(a.status) === g)
      : filtered.filter(a => a.frente === g)
    const getGroupColor = g => kanbanGroup === 'status'
      ? PLANO_STATUS_COLORS[g]?.c
      : frenteCores[g]

    return (
      <div className="flex gap-3 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
        {groups.map(group => {
          const items = getGroupItems(group)
          if (items.length === 0 && kanbanGroup !== 'status') return null
          const isOver = dragOverGroup === group
          return (
            <div key={group} className="min-w-[280px] max-w-[320px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 px-2 py-2 rounded-lg"
                style={{ background: 'rgba(200,192,175,0.03)' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: getGroupColor(group) }} />
                <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{group}</span>
                <span className="text-xs font-bold ml-auto px-2 py-0.5 rounded"
                  style={{ background: 'rgba(200,192,175,0.06)', color: 'rgba(200,192,175,0.4)' }}>
                  {items.length}
                </span>
              </div>
              <div className="space-y-2.5 min-h-[60px] rounded-xl p-1 transition-all duration-200"
                style={{
                  background: isOver ? 'rgba(78,205,196,0.06)' : 'transparent',
                  border: isOver ? '2px dashed rgba(78,205,196,0.3)' : '2px dashed transparent'
                }}
                onDragOver={(e) => handleDragOver(e, group)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, group)}>
                {items.map(item => (
                  <div key={item.id} draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragEnd={handleDragEnd}
                    className={`glass-card p-3 card-hover cursor-grab active:cursor-grabbing border-l-4 transition-all ${draggedId === item.id ? 'opacity-30 scale-95' : ''}`}
                    style={{ borderLeftColor: kanbanGroup === 'status' ? frenteCores[item.frente] || '#4da8da' : getGroupColor(group) }}
                    onClick={() => handleCardClick(item.id)}>
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical size={14} className="flex-shrink-0" style={{ color: 'rgba(200,192,175,0.15)' }} />
                      <span className="text-sm font-bold text-white/90 flex-1 truncate">{item.acao}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <PriorityBadge p={item.prioridade} />
                      {kanbanGroup === 'status' && (
                        <span className="text-xs px-1.5 py-0.5 rounded"
                          style={{ background: (frenteCores[item.frente] || '#4da8da') + '12', color: frenteCores[item.frente] || '#4da8da' }}>
                          {item.frente}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(200,192,175,0.4)' }}>
                        <User size={11} /> {item.dono}
                      </span>
                      {item.deadline && (
                        <span className="text-xs flex items-center gap-1"
                          style={{ color: isOverdue(item.deadline) && item.status !== 'Concluído' ? '#e74c5e' : 'rgba(200,192,175,0.4)' }}>
                          <Calendar size={11} /> {formatDate(item.deadline)}
                        </span>
                      )}
                    </div>
                    {item.progresso > 0 && (
                      <div className="mt-2.5">
                        <ProgressBar value={item.progresso} color={frenteCores[item.frente] || '#4ecdc4'} slim />
                      </div>
                    )}
                  </div>
                ))}
                {items.length === 0 && (
                  <div className="text-center py-6 text-xs" style={{ color: 'rgba(200,192,175,0.2)' }}>
                    Arraste cards aqui
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ===== LIST VIEW =====
  const ListView = () => (
    <div className="glass-card overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full" style={{ minWidth: 580 }}>
        <thead>
          <tr style={{ background: 'rgba(200,192,175,0.02)' }}>
            {['Ação', 'Frente', 'Prioridade', 'Dono', 'Status', 'Progresso'].map(h => (
              <th key={h} className="px-3 py-2.5 text-left text-xs font-bold tracking-widest uppercase"
                style={{ color: 'rgba(200,192,175,0.3)', borderBottom: '1px solid rgba(200,192,175,0.06)' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((item, i) => (
            <tr key={item.id} className="cursor-pointer transition-colors"
              style={{ background: i % 2 === 0 ? 'rgba(200,192,175,0.01)' : 'transparent' }}
              onClick={() => setModalId(item.id)}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,192,175,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'rgba(200,192,175,0.01)' : 'transparent'}>
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <div className="text-sm font-semibold text-white/90">{item.acao}</div>
              </td>
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <span className="text-xs px-2 py-0.5 rounded"
                  style={{ background: (frenteCores[item.frente] || '#4da8da') + '12', color: frenteCores[item.frente] || '#4da8da' }}>
                  {item.frente}
                </span>
              </td>
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <PriorityBadge p={item.prioridade} />
              </td>
              <td className="px-3 py-2.5 text-xs" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)', color: 'rgba(200,192,175,0.5)' }}>
                {item.dono}
              </td>
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <StatusBadge s={normalizeStatus(item.status)} />
              </td>
              <td className="px-3 py-2.5 w-24" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <ProgressBar value={item.progresso || 0} color={PLANO_STATUS_COLORS[normalizeStatus(item.status)]?.c || '#4ecdc4'} slim />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div className="py-8 text-center text-xs" style={{ color: 'rgba(200,192,175,0.2)' }}>Nenhuma ação encontrada.</div>
      )}
    </div>
  )

  // ===== DETAIL MODAL =====
  const DetailModal = () => {
    if (!modalId) return null
    const item = acoes.find(a => a.id === modalId)
    if (!item) return null
    const comments = item.comentarios_acoes || []

    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fade-in"
        style={{ background: 'rgba(4,6,14,0.8)', backdropFilter: 'blur(20px)' }}
        onClick={() => { setModalId(null); setNewComment('') }}>
        <div className="glass-modal w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto animate-scale-in"
          onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-black text-white pr-4">{item.acao}</h2>
            <button onClick={() => { setModalId(null); setNewComment('') }}
              className="text-xl leading-none" style={{ color: 'rgba(200,192,175,0.3)' }}>×</button>
          </div>
          {item.descricao && <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(200,192,175,0.5)' }}>{item.descricao}</p>}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="label">Status</label>
              <select value={normalizeStatus(item.status)}
                onChange={e => handleUpdate(item.id, { status: e.target.value })} className="input-dark text-sm">
                {PLANO_STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Prioridade</label>
              <select value={item.prioridade}
                onChange={e => handleUpdate(item.id, { prioridade: e.target.value })} className="input-dark text-sm">
                {Object.keys(PLANO_PRIORIDADE_CONFIG).map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Frente</label>
              <select value={item.frente}
                onChange={e => handleUpdate(item.id, { frente: e.target.value })} className="input-dark text-sm">
                {frenteNames.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Dono</label>
              <input value={item.dono} onChange={e => handleUpdate(item.id, { dono: e.target.value })} className="input-dark text-sm" />
            </div>
            <div>
              <label className="label">Prazo</label>
              <input type="date" value={item.deadline || ''}
                onChange={e => handleUpdate(item.id, { deadline: e.target.value || null })} className="input-dark text-sm" />
            </div>
            <div>
              <label className="label">Progresso</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="100" step="5" value={item.progresso || 0}
                  onChange={e => handleUpdate(item.id, { progresso: parseInt(e.target.value) })} className="flex-1" />
                <span className="text-sm font-bold w-8 text-right" style={{ color: '#4ecdc4' }}>{item.progresso || 0}%</span>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div style={{ borderTop: '1px solid rgba(200,192,175,0.06)' }} className="pt-3">
            <div className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1"
              style={{ color: 'rgba(200,192,175,0.3)' }}>
              <MessageSquare size={11} /> Comentários ({comments.length})
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
              {comments.map(c => (
                <div key={c.id} className="text-sm p-2 rounded-lg"
                  style={{ background: c.auto ? 'rgba(78,205,196,0.06)' : 'rgba(200,192,175,0.03)' }}>
                  <div className="text-white/70">{c.texto}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'rgba(200,192,175,0.3)' }}>
                    {c.autor && `${c.autor} \u00B7 `}{new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div className="text-sm" style={{ color: 'rgba(200,192,175,0.2)' }}>Nenhum comentário.</div>}
            </div>
            <div className="flex gap-2">
              <input value={newComment} onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment(item.id)}
                placeholder="Adicionar comentário..." className="input-dark text-sm flex-1" />
              <button onClick={() => handleAddComment(item.id)}
                className="px-3 py-2 rounded-xl text-sm font-bold transition-all"
                style={{ background: 'rgba(78,205,196,0.12)', color: '#4ecdc4' }}>
                Enviar
              </button>
            </div>
          </div>

          <button onClick={() => handleDelete(item.id)}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm transition-all"
            style={{ color: 'rgba(231,76,94,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,94,0.08)'; e.currentTarget.style.color = '#e74c5e' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(231,76,94,0.5)' }}>
            <Trash2 size={14} /> Excluir ação
          </button>
        </div>
      </div>
    )
  }

  // ===== NEW MODAL =====
  const NewModal = () => {
    const [form, setForm] = useState({
      acao: '', frente: frenteNames[0] || '', descricao: '',
      prioridade: 'Quick Win', dono: DONOS_PLANO[0], status: 'Não Iniciado',
      deadline: null, progresso: 0
    })
    const handleCreate = async () => {
      if (!form.acao.trim()) return alert('Nome obrigatório')
      await addAcao(form)
      setShowNew(false)
    }
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fade-in"
        style={{ background: 'rgba(4,6,14,0.8)', backdropFilter: 'blur(20px)' }}
        onClick={() => setShowNew(false)}>
        <div className="glass-modal w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Nova Ação</h2>
            <button onClick={() => setShowNew(false)} className="text-xl" style={{ color: 'rgba(200,192,175,0.3)' }}>×</button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">Nome *</label>
              <input value={form.acao} onChange={e => setForm({...form, acao: e.target.value})} placeholder="Ex: Nova campanha" className="input-dark" />
            </div>
            <div>
              <label className="label">Descrição</label>
              <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} rows={2} className="input-dark resize-y" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Frente</label>
                <select value={form.frente} onChange={e => setForm({...form, frente: e.target.value})} className="input-dark">{frenteNames.map(f => <option key={f}>{f}</option>)}</select>
              </div>
              <div>
                <label className="label">Prioridade</label>
                <select value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value})} className="input-dark">
                  {['Quick Win', 'Ação Tática', 'Projeto Estratégico'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Dono</label>
                <input value={form.dono} onChange={e => setForm({...form, dono: e.target.value})} className="input-dark text-base" />
              </div>
              <div>
                <label className="label">Prazo</label>
                <input type="date" value={form.deadline || ''} onChange={e => setForm({...form, deadline: e.target.value || null})} className="input-dark text-base" />
              </div>
            </div>
            <button onClick={handleCreate} className="btn-primary w-full">Criar Ação</button>
          </div>
        </div>
      </div>
    )
  }

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(78,205,196,0.15)', borderTopColor: '#4ecdc4' }} />
      </div>
    )
  }

  const pad = isLandscape ? 'pl-20 pr-4 py-3' : isMobile ? 'px-3 py-2' : 'px-6 py-3'

  return (
    <div className="min-h-screen">
      <DetailModal />
      {showNew && <NewModal />}

      {/* Page Header */}
      <div className={`${pad} border-b`}
        style={{ background: 'rgba(10,14,26,0.5)', backdropFilter: 'blur(20px)', borderBottomColor: 'rgba(78,205,196,0.1)' }}>
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-bold tracking-widest uppercase" style={{ color: '#4ecdc4' }}>
              Plano Intermarine
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(200,192,175,0.3)' }}>Gestão Estratégica</div>
          </div>

          <button onClick={() => setShowNew(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(78,205,196,0.12)', color: '#4ecdc4' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(78,205,196,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(78,205,196,0.12)'}>
            <Plus size={16} /> Nova
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${pad}`}>
        <div className="flex gap-2 items-center flex-wrap glass-card px-3 py-2">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(200,192,175,0.3)' }}>Filtros</span>
          <Select value={filterFrente} onChange={setFilterFrente} options={['Todas', ...frenteNames]} />
          <Select value={filterPrioridade} onChange={setFilterPrioridade} options={['Todas', 'Quick Win', 'Ação Tática', 'Projeto Estratégico']} />
          <Select value={filterDono} onChange={setFilterDono} options={['Todos', ...(allDonos.length > 0 ? allDonos : DONOS_PLANO)]} />
          {view === 'kanban' && (
            <Select value={kanbanGroup} onChange={setKanbanGroup} options={['status', 'frente']} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className={`${pad} ${isLandscape ? 'pb-4' : 'pb-24'}`}>
        {view === 'dashboard' && <DashboardView />}
        {view === 'kanban' && <KanbanView />}
        {view === 'list' && <ListView />}
      </div>
    </div>
  )
}
