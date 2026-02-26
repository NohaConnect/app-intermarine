import React, { useState, useMemo, useRef } from 'react'
import { useTarefas, useFrentes, useResponsive } from '../hooks/useSupabase'
import { useAuth } from '../contexts/AuthContext'
import {
  NOHA_STATUS, NOHA_STATUS_COLORS, NOHA_PRIORIDADE_CORES, FRENTES_NOHA_CORES, FRENTES_IM_CORES,
  DONOS_NOHA, splitDonos, isOverdue, daysLeft, formatDate, formatDateTime
} from '../lib/constants'
import {
  Plus, X, Calendar, User, Target, MessageSquare, Trash2, AlertTriangle,
  Link2, GripVertical, Clock, CheckCircle2, AlertCircle,
  LayoutDashboard, Columns3, List, Zap
} from 'lucide-react'

// SVG Ring Chart
const RingChart = ({ value, size = 120, stroke = 8, color = '#8b5cf6' }) => {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} className="ring-chart">
      <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} stroke="rgba(200,192,175,0.06)" />
      <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke}
        stroke={color} strokeDasharray={circ} strokeDashoffset={offset} />
    </svg>
  )
}

export default function NohaPage({ view = 'dashboard' }) {
  const { tarefas, loading, updateTarefa, addTarefa, deleteTarefa, addComentario } = useTarefas()
  const { frentesNoha, frentesIM } = useFrentes()
  const { profile } = useAuth()
  const { isMobile, isLandscape } = useResponsive()
  const [filterFrente, setFilterFrente] = useState('Todas')
  const [filterDono, setFilterDono] = useState('Todos')
  const [filterPrioridade, setFilterPrioridade] = useState('Todas')
  const [modalId, setModalId] = useState(null)
  const [newComment, setNewComment] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [draggedId, setDraggedId] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOverStatus, setDragOverStatus] = useState(null)
  const dragRef = useRef(false)

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
    if (filterFrente !== 'Todas' && t.frente !== filterFrente) return false
    if (filterDono !== 'Todos' && !splitDonos(t.dono).includes(filterDono)) return false
    if (filterPrioridade !== 'Todas' && t.prioridade !== filterPrioridade) return false
    return true
  }), [tarefas, filterFrente, filterDono, filterPrioridade])

  const stats = useMemo(() => {
    const total = filtered.length
    const byStatus = {}
    NOHA_STATUS.forEach(s => byStatus[s] = 0)
    filtered.forEach(t => byStatus[t.status] = (byStatus[t.status] || 0) + 1)
    const done = byStatus['Concluído'] || 0
    const overdue = filtered.filter(t => t.status !== 'Concluído' && isOverdue(t.deadline)).length
    const inProgress = byStatus['Em Progresso'] || 0
    return { total, byStatus, done, pct: total > 0 ? Math.round(done / total * 100) : 0, overdue, inProgress }
  }, [filtered])

  const handleUpdate = async (id, fields) => {
    const tarefa = tarefas.find(t => t.id === id)
    if (fields.status && fields.status !== tarefa?.status) {
      await addComentario(id, `\u26A1 ${tarefa.status} \u2192 ${fields.status}`, profile?.name || 'Sistema', true)
    }
    await updateTarefa(id, fields)
  }
  const handleAddComment = async (id) => {
    if (!newComment.trim()) return
    await addComentario(id, newComment.trim(), profile?.name || 'Anônimo')
    setNewComment('')
  }
  const handleDelete = async (id) => {
    if (confirm('Excluir esta tarefa?')) { await deleteTarefa(id); setModalId(null) }
  }
  const handleDragStart = (e, id) => {
    setDraggedId(id)
    setIsDragging(true)
    dragRef.current = true
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id.toString())
    if (e.target) {
      setTimeout(() => { e.target.style.opacity = '0.4' }, 0)
    }
  }
  const handleDragEnd = (e) => {
    if (e.target) e.target.style.opacity = '1'
    setDraggedId(null)
    setIsDragging(false)
    setDragOverStatus(null)
    setTimeout(() => { dragRef.current = false }, 200)
  }
  const handleDragOver = (e, status) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (status !== undefined) setDragOverStatus(status)
  }
  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverStatus(null)
    }
  }
  const handleDrop = async (e, targetStatus) => {
    e.preventDefault()
    setDragOverStatus(null)
    if (!draggedId) return
    const currentItem = tarefas.find(t => t.id === draggedId)
    if (currentItem?.status !== targetStatus) {
      await handleUpdate(draggedId, { status: targetStatus })
    }
    setDraggedId(null)
    setIsDragging(false)
  }
  const handleCardClick = (id) => {
    if (dragRef.current) return
    setModalId(id)
  }

  // Shared Components
  const Select = ({ value, onChange, options }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className="select-dark">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  const PriorityBadge = ({ p }) => {
    const color = NOHA_PRIORIDADE_CORES[p] || '#75777b'
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-md"
        style={{ background: color + '12', color }}>{p}</span>
    )
  }

  const ProgressBar = ({ value, color = '#8b5cf6', slim = false }) => (
    <div className={slim ? 'progress-bar-sm' : 'progress-bar'}>
      <div className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }} />
    </div>
  )

  const ObjetivoBadge = ({ objetivo }) => {
    if (!objetivo) return null
    const cor = frentesIMCores[objetivo] || '#4da8da'
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded-md"
        style={{ background: cor + '10', color: cor, border: `1px solid ${cor}20` }}>
        <Link2 size={8} /> {objetivo}
      </span>
    )
  }

  // ===== DASHBOARD VIEW =====
  const DashboardView = () => (
    <div className="space-y-4">
      {/* Hero Progress Row */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-12'}`}>
        {/* Ring Chart Card */}
        <div className={`glass-card p-5 flex items-center gap-6 ${isMobile ? '' : 'col-span-5'}`}>
          <div className="relative flex-shrink-0">
            <RingChart value={stats.pct} size={isMobile ? 100 : 120} color="#8b5cf6" />
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
              <div className="text-xs mt-1" style={{ color: 'rgba(200,192,175,0.3)' }}>Tarefas Noha</div>
            </div>
            <div className="space-y-1.5">
              {NOHA_STATUS.map(s => (
                <div key={s} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: NOHA_STATUS_COLORS[s]?.c }} />
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
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(200,192,175,0.4)' }}>Em Progresso</span>
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
          <div className="glass-card p-4 border-l-4 flex flex-col justify-center" style={{ borderLeftColor: '#8b5cf6' }}>
            <div className="flex items-center gap-2 mb-1">
              <Target size={14} style={{ color: '#8b5cf6' }} />
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'rgba(200,192,175,0.4)' }}>Total</span>
            </div>
            <div className="text-2xl font-black text-white">{stats.total}</div>
          </div>
        </div>

        {/* Deadlines */}
        <div className={`glass-card p-4 ${isMobile ? '' : 'col-span-3'}`}>
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(200,192,175,0.4)' }}>
            <div className="flex items-center gap-1.5"><Clock size={12} /> Próximos Prazos</div>
          </div>
          <div className="space-y-2 max-h-[180px] overflow-y-auto">
            {filtered
              .filter(t => t.deadline && t.status !== 'Concluído')
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
                      style={{ background: isLate ? '#e74c5e' : dl <= 3 ? '#c8c0af' : '#8b5cf6' }} />
                    <span className="text-xs text-white/70 flex-1 truncate">{item.titulo}</span>
                    <span className="text-[10px] font-bold flex-shrink-0"
                      style={{ color: isLate ? '#e74c5e' : dl <= 3 ? '#c8c0af' : 'rgba(200,192,175,0.4)' }}>
                      {isLate ? `${Math.abs(dl)}d atrás` : dl === 0 ? 'Hoje' : `${dl}d`}
                    </span>
                  </div>
                )
              })}
            {filtered.filter(t => t.deadline && t.status !== 'Concluído').length === 0 && (
              <div className="text-xs py-4 text-center" style={{ color: 'rgba(200,192,175,0.2)' }}>Nenhum prazo pendente</div>
            )}
          </div>
        </div>
      </div>

      {/* Progress by Frente */}
      <div className={`grid gap-3 ${isLandscape ? 'grid-cols-2' : isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
        {frenteNames.map(frente => {
          const items = filtered.filter(t => t.frente === frente)
          if (items.length === 0) return null
          const done = items.filter(t => t.status === 'Concluído').length
          const pct = Math.round(done / items.length * 100)
          const cor = frenteCores[frente] || '#8b5cf6'
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
                    onClick={() => setModalId(item.id)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(200,192,175,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: NOHA_STATUS_COLORS[item.status]?.c }} />
                    <span className="text-sm text-white/70 flex-1 truncate">{item.titulo}</span>
                    <PriorityBadge p={item.prioridade} />
                    <ObjetivoBadge objetivo={item.objetivo_intermarine} />
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
  const KanbanView = () => (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
      {NOHA_STATUS.map(status => {
        const items = filtered.filter(t => t.status === status)
        const isOver = dragOverStatus === status
        return (
          <div key={status} className="min-w-[280px] max-w-[320px] flex-shrink-0">
            <div className="flex items-center gap-2 mb-3 px-2 py-2 rounded-lg"
              style={{ background: 'rgba(200,192,175,0.03)' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: NOHA_STATUS_COLORS[status]?.c }} />
              <span className="text-xs font-bold text-white/70 uppercase tracking-wider">{status}</span>
              <span className="text-xs font-bold ml-auto px-2 py-0.5 rounded"
                style={{ background: 'rgba(200,192,175,0.06)', color: 'rgba(200,192,175,0.4)' }}>
                {items.length}
              </span>
            </div>
            <div className="space-y-2.5 min-h-[60px] rounded-xl p-1 transition-all duration-200"
              style={{
                background: isOver ? 'rgba(139,92,246,0.06)' : 'transparent',
                border: isOver ? '2px dashed rgba(139,92,246,0.3)' : '2px dashed transparent'
              }}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}>
              {items.map(item => (
                <div key={item.id} draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onDragEnd={handleDragEnd}
                  className={`glass-card p-3 card-hover cursor-grab active:cursor-grabbing border-l-4 transition-all ${draggedId === item.id ? 'opacity-30 scale-95' : ''}`}
                  style={{ borderLeftColor: frenteCores[item.frente] || '#8b5cf6' }}
                  onClick={() => handleCardClick(item.id)}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <GripVertical size={14} className="flex-shrink-0" style={{ color: 'rgba(200,192,175,0.15)' }} />
                    <span className="text-sm font-bold text-white/90 flex-1 truncate">{item.titulo}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-2 ml-6">
                    <PriorityBadge p={item.prioridade} />
                    <span className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: (frenteCores[item.frente] || '#8b5cf6') + '12', color: frenteCores[item.frente] || '#8b5cf6' }}>
                      {item.frente}
                    </span>
                    <ObjetivoBadge objetivo={item.objetivo_intermarine} />
                  </div>
                  <div className="flex items-center justify-between mt-2 ml-6">
                    <span className="text-xs flex items-center gap-1" style={{ color: 'rgba(200,192,175,0.4)' }}>
                      <User size={10} /> {item.dono}
                    </span>
                    {item.deadline && (
                      <span className="text-xs flex items-center gap-1"
                        style={{ color: isOverdue(item.deadline) && item.status !== 'Concluído' ? '#e74c5e' : 'rgba(200,192,175,0.4)' }}>
                        <Calendar size={10} /> {formatDate(item.deadline)}
                      </span>
                    )}
                  </div>
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

  // ===== LIST VIEW =====
  const ListView = () => (
    <div className="glass-card overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full" style={{ minWidth: 640 }}>
        <thead>
          <tr style={{ background: 'rgba(200,192,175,0.02)' }}>
            {['Tarefa', 'Frente', 'Objetivo IM', 'Prioridade', 'Dono', 'Status'].map(h => (
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
                <div className="text-sm font-semibold text-white/90">{item.titulo}</div>
              </td>
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <span className="text-xs" style={{ color: frenteCores[item.frente] || '#8b5cf6' }}>{item.frente}</span>
              </td>
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <ObjetivoBadge objetivo={item.objetivo_intermarine} />
              </td>
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <PriorityBadge p={item.prioridade} />
              </td>
              <td className="px-3 py-2.5 text-xs" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)', color: 'rgba(200,192,175,0.5)' }}>
                {item.dono}
              </td>
              <td className="px-3 py-2.5" style={{ borderBottom: '1px solid rgba(200,192,175,0.04)' }}>
                <span className="text-xs font-bold" style={{ color: NOHA_STATUS_COLORS[item.status]?.c }}>{item.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div className="py-8 text-center text-xs" style={{ color: 'rgba(200,192,175,0.2)' }}>Nenhuma tarefa encontrada.</div>
      )}
    </div>
  )

  // ===== DETAIL MODAL =====
  const DetailModal = () => {
    if (!modalId) return null
    const item = tarefas.find(t => t.id === modalId)
    if (!item) return null
    const comments = item.comentarios_tarefas || []

    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fade-in"
        style={{ background: 'rgba(4,6,14,0.8)', backdropFilter: 'blur(20px)' }}
        onClick={() => { setModalId(null); setNewComment('') }}>
        <div className="glass-modal w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto animate-scale-in"
          onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-black text-white pr-4">{item.titulo}</h2>
            <button onClick={() => { setModalId(null); setNewComment('') }}
              className="text-xl leading-none" style={{ color: 'rgba(200,192,175,0.3)' }}>×</button>
          </div>
          {item.descricao && <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(200,192,175,0.5)' }}>{item.descricao}</p>}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="label">Status</label>
              <select value={item.status}
                onChange={e => handleUpdate(item.id, { status: e.target.value })} className="input-dark text-sm">
                {NOHA_STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Prioridade</label>
              <select value={item.prioridade}
                onChange={e => handleUpdate(item.id, { prioridade: e.target.value })} className="input-dark text-sm">
                {['Baixa', 'Média', 'Alta', 'Urgente'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Frente Noha</label>
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
                <span className="text-sm font-bold w-8 text-right" style={{ color: '#8b5cf6' }}>{item.progresso || 0}%</span>
              </div>
            </div>
            {/* Objetivo Intermarine */}
            <div className="col-span-2">
              <label className="label flex items-center gap-1">
                <Target size={10} /> Objetivo Intermarine
              </label>
              <select value={item.objetivo_intermarine || ''}
                onChange={e => handleUpdate(item.id, { objetivo_intermarine: e.target.value || null })} className="input-dark text-sm">
                <option value="">Nenhum (sem vínculo)</option>
                {frentesIMNames.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
              <p className="text-xs mt-1" style={{ color: 'rgba(200,192,175,0.25)' }}>
                Conecta esta tarefa a uma frente estratégica do Plano Intermarine
              </p>
            </div>
          </div>

          {/* Comments */}
          <div style={{ borderTop: '1px solid rgba(200,192,175,0.06)' }} className="pt-3">
            <div className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1"
              style={{ color: 'rgba(200,192,175,0.3)' }}>
              <MessageSquare size={10} /> Comentários ({comments.length})
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
              {comments.map(c => (
                <div key={c.id} className="text-sm p-2 rounded-lg"
                  style={{ background: c.auto ? 'rgba(139,92,246,0.06)' : 'rgba(200,192,175,0.03)' }}>
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
                style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}>
                Enviar
              </button>
            </div>
          </div>

          <button onClick={() => handleDelete(item.id)}
            className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm transition-all"
            style={{ color: 'rgba(231,76,94,0.5)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,94,0.08)'; e.currentTarget.style.color = '#e74c5e' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(231,76,94,0.5)' }}>
            <Trash2 size={12} /> Excluir tarefa
          </button>
        </div>
      </div>
    )
  }

  // ===== NEW MODAL =====
  const NewModal = () => {
    const [form, setForm] = useState({
      titulo: '', frente: frenteNames[0] || '', descricao: '',
      prioridade: 'Média', dono: DONOS_NOHA[0] || '', status: 'A Fazer',
      deadline: null, progresso: 0, objetivo_intermarine: null
    })
    const handleCreate = async () => {
      if (!form.titulo.trim()) return alert('Título obrigatório')
      await addTarefa(form)
      setShowNew(false)
    }
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fade-in"
        style={{ background: 'rgba(4,6,14,0.8)', backdropFilter: 'blur(20px)' }}
        onClick={() => setShowNew(false)}>
        <div className="glass-modal w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Nova Tarefa</h2>
            <button onClick={() => setShowNew(false)} className="text-xl" style={{ color: 'rgba(200,192,175,0.3)' }}>×</button>
          </div>
          <div className="space-y-3">
            <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})}
              placeholder="Título *" className="input-dark" />
            <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})}
              rows={2} placeholder="Descrição" className="input-dark resize-y" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.frente} onChange={e => setForm({...form, frente: e.target.value})} className="input-dark">
                {frenteNames.map(f => <option key={f}>{f}</option>)}
              </select>
              <select value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value})} className="input-dark">
                {['Baixa', 'Média', 'Alta', 'Urgente'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={form.dono} onChange={e => setForm({...form, dono: e.target.value})} className="input-dark">
                {(allDonos.length > 0 ? allDonos : DONOS_NOHA).map(d => <option key={d}>{d}</option>)}
              </select>
              <input type="date" value={form.deadline || ''}
                onChange={e => setForm({...form, deadline: e.target.value || null})} className="input-dark" />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Target size={10} /> Objetivo Intermarine</label>
              <select value={form.objetivo_intermarine || ''}
                onChange={e => setForm({...form, objetivo_intermarine: e.target.value || null})} className="input-dark">
                <option value="">Nenhum</option>
                {frentesIMNames.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <button onClick={handleCreate}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', boxShadow: '0 4px 24px rgba(139,92,246,0.2)' }}>
              Criar Tarefa
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(139,92,246,0.15)', borderTopColor: '#8b5cf6' }} />
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
        style={{ background: 'rgba(10,14,26,0.5)', backdropFilter: 'blur(20px)', borderBottomColor: 'rgba(139,92,246,0.1)' }}>
        <div className="flex items-center gap-3">
          <div>
            <div className="text-sm font-bold tracking-widest uppercase" style={{ color: '#8b5cf6' }}>
              Ações da Noha
            </div>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(200,192,175,0.3)' }}>Gestão Operacional</div>
          </div>

          <button onClick={() => setShowNew(true)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'rgba(139,92,246,0.12)', color: '#8b5cf6' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.12)'}>
            <Plus size={16} /> Nova
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${pad}`}>
        <div className="flex gap-2 items-center flex-wrap glass-card px-3 py-2">
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(200,192,175,0.3)' }}>Filtros</span>
          <Select value={filterFrente} onChange={setFilterFrente} options={['Todas', ...frenteNames]} />
          <Select value={filterPrioridade} onChange={setFilterPrioridade} options={['Todas', 'Baixa', 'Média', 'Alta', 'Urgente']} />
          <Select value={filterDono} onChange={setFilterDono} options={['Todos', ...(allDonos.length > 0 ? allDonos : DONOS_NOHA)]} />
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
