import React, { useState, useMemo, useRef } from 'react'
import { useAcoes, useFrentes, useResponsive } from '../hooks/useSupabase'
import { useAuth } from '../contexts/AuthContext'
import {
  PLANO_STATUS, PLANO_STATUS_COLORS, PLANO_PRIORIDADE_CONFIG,
  FRENTES_IM_CORES, DONOS_PLANO, splitDonos, isOverdue, daysLeft, formatDate, formatDateTime
} from '../lib/constants'
import { Plus, X, ChevronDown, Calendar, User, Flag, Target, MessageSquare, Trash2, AlertTriangle, GripVertical } from 'lucide-react'

export default function PlanoPage({ view }) {
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

  const frenteNames = frentesIM.length > 0 ? frentesIM.map(f => f.nome) : Object.keys(FRENTES_IM_CORES)
  const frenteCores = frentesIM.length > 0
    ? Object.fromEntries(frentesIM.map(f => [f.nome, f.cor]))
    : FRENTES_IM_CORES

  // Status normalization function
  const normalizeStatus = (status) => {
    if (PLANO_STATUS.includes(status)) return status
    return PLANO_STATUS[0] || 'Não Iniciado'
  }

  // Unique donos from data
  const allDonos = useMemo(() => {
    const s = new Set()
    acoes.forEach(a => splitDonos(a.dono).forEach(d => s.add(d)))
    return Array.from(s).sort()
  }, [acoes])

  // Filtered
  const filtered = useMemo(() => acoes.filter(a => {
    if (filterFrente !== 'Todas' && a.frente !== filterFrente) return false
    if (filterDono !== 'Todos' && !splitDonos(a.dono).includes(filterDono)) return false
    if (filterPrioridade !== 'Todas' && a.prioridade !== filterPrioridade) return false
    return true
  }), [acoes, filterFrente, filterDono, filterPrioridade])

  // Stats
  const stats = useMemo(() => {
    const total = filtered.length
    const byStatus = {}
    PLANO_STATUS.forEach(s => byStatus[s] = 0)
    filtered.forEach(a => byStatus[normalizeStatus(a.status)] = (byStatus[normalizeStatus(a.status)] || 0) + 1)
    const done = byStatus['Concluído'] || 0
    const overdue = filtered.filter(a => a.status !== 'Concluído' && isOverdue(a.deadline)).length
    return { total, byStatus, done, pct: total > 0 ? Math.round(done / total * 100) : 0, overdue }
  }, [filtered])

  // Handlers
  const handleUpdate = async (id, fields) => {
    const acao = acoes.find(a => a.id === id)
    if (fields.status && fields.status !== acao?.status) {
      const now = formatDateTime(new Date())
      await addComentario(id, `⚡ ${acao.status} → ${fields.status}`, profile?.name || 'Sistema', true)
    }
    await updateAcao(id, fields)
  }

  const handleAddComment = async (id) => {
    if (!newComment.trim()) return
    await addComentario(id, newComment.trim(), profile?.name || 'Anônimo')
    setNewComment('')
  }

  const handleDelete = async (id) => {
    if (confirm('Excluir esta ação?')) {
      await deleteAcao(id)
      setModalId(null)
    }
  }

  const handleDragStart = (e, id) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, targetGroup) => {
    e.preventDefault()
    if (!draggedId) return
    const field = kanbanGroup === 'status' ? 'status' : 'frente'
    await handleUpdate(draggedId, { [field]: targetGroup })
    setDraggedId(null)
  }

  // Components
  const Select = ({ value, onChange, options, dark = true }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
            className="text-sm font-semibold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer transition-all"
            style={{
              background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
              color: dark ? '#c8d0e0' : '#475569',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
            }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  const PriorityBadge = ({ p }) => {
    const cfg = PLANO_PRIORIDADE_CONFIG[p]
    if (!cfg) return <span className="text-xs text-white/50">{p}</span>
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md"
            style={{ background: cfg.c + '15', color: cfg.c }}>
        <span>{cfg.icon}</span> {cfg.label}
      </span>
    )
  }

  const StatusBadge = ({ s }) => {
    const cfg = PLANO_STATUS_COLORS[s]
    return (
      <span className="text-xs font-bold px-2.5 py-1 rounded-md"
            style={{ background: cfg?.bg || '#333', color: cfg?.c || '#999', border: `1px solid ${cfg?.b || '#444'}` }}>
        {s}
      </span>
    )
  }

  const ProgressBar = ({ value, color = '#4ecdc4' }) => (
    <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500"
           style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
    </div>
  )

  // Dashboard view
  const DashboardView = () => (
    <div className={`grid gap-3 ${isLandscape ? 'grid-cols-2' : isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
      {/* Summary card */}
      <div className="glass-dark p-4 col-span-full border-l-4" style={{ borderLeftColor: '#4ecdc4' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-bold text-white/50 uppercase tracking-widest">Progresso Geral</div>
            <div className="text-3xl font-black text-white">{stats.pct}%</div>
          </div>
          <div className="flex gap-4 text-right">
            <div>
              <div className="text-xl font-bold text-white">{stats.total}</div>
              <div className="text-xs text-white/50 uppercase">Total</div>
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-400">{stats.done}</div>
              <div className="text-xs text-white/50 uppercase">Concluídas</div>
            </div>
            {stats.overdue > 0 && (
              <div>
                <div className="text-xl font-bold text-rose-400">{stats.overdue}</div>
                <div className="text-xs text-white/50 uppercase">Atrasadas</div>
              </div>
            )}
          </div>
        </div>
        <ProgressBar value={stats.pct} color="#4ecdc4" />
        {/* Status breakdown */}
        <div className="flex gap-3 mt-4 flex-wrap">
          {PLANO_STATUS.map(s => (
            <div key={s} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: PLANO_STATUS_COLORS[s]?.c }} />
              <span className="text-white/50">{s}</span>
              <span className="font-bold text-white/80">{stats.byStatus[s] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {/* By Frente */}
      {frenteNames.map(frente => {
        const items = filtered.filter(a => a.frente === frente)
        if (items.length === 0) return null
        const done = items.filter(a => a.status === 'Concluído').length
        const pct = Math.round(done / items.length * 100)
        return (
          <div key={frente} className="glass-dark p-4 card-hover border-l-4" style={{ borderLeftColor: frenteCores[frente] || '#4da8da' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: frenteCores[frente] || '#4da8da' }} />
              <span className="text-sm font-bold text-white/90">{frente}</span>
              <span className="ml-auto text-sm font-bold" style={{ color: frenteCores[frente] || '#4da8da' }}>{pct}%</span>
            </div>
            <ProgressBar value={pct} color={frenteCores[frente] || '#4da8da'} />
            <div className="mt-3 space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2 cursor-pointer hover:bg-white/[0.03] rounded-lg p-1.5 -mx-1.5 transition-all"
                     onClick={() => setModalId(item.id)}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: PLANO_STATUS_COLORS[normalizeStatus(item.status)]?.c }} />
                  <span className="text-sm text-white/90 flex-1 truncate">{item.acao}</span>
                  <PriorityBadge p={item.prioridade} />
                  {isOverdue(item.deadline) && item.status !== 'Concluído' && (
                    <AlertTriangle size={14} className="text-rose-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  // Kanban view
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
          return (
            <div key={group} className="min-w-[280px] max-w-[320px] flex-shrink-0">
              <div className="flex items-center gap-2 mb-3 px-2 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: getGroupColor(group) }} />
                <span className="text-sm font-bold text-white/90 uppercase tracking-wider">{group}</span>
                <span className="text-xs font-bold ml-auto px-2 py-1 rounded bg-white/[0.06] text-white/50">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, group)}>
                {items.map(item => (
                  <div key={item.id}
                       draggable
                       onDragStart={(e) => handleDragStart(e, item.id)}
                       className={`glass-dark p-3 card-hover cursor-move border-l-4 transition-all ${draggedId === item.id ? 'opacity-50 scale-95' : ''}`}
                       style={{ borderLeftColor: kanbanGroup === 'status' ? frenteCores[item.frente] || '#4da8da' : getGroupColor(group) }}
                       onClick={() => setModalId(item.id)}>
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical size={14} className="text-white/20 cursor-grab active:cursor-grabbing" />
                      <span className="text-sm font-bold text-white/90 flex-1 truncate">{item.acao}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                      <PriorityBadge p={item.prioridade} />
                      {kanbanGroup === 'status' && (
                        <span className="text-xs px-2 py-1 rounded" style={{ background: (frenteCores[item.frente] || '#4da8da') + '15', color: frenteCores[item.frente] || '#4da8da' }}>
                          {item.frente}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2 mb-2">
                      <span className="text-xs text-white/50 flex items-center gap-1">
                        <User size={12} /> {item.dono}
                      </span>
                      {item.deadline && (
                        <span className={`text-xs flex items-center gap-1 ${isOverdue(item.deadline) && item.status !== 'Concluído' ? 'text-rose-400' : 'text-white/50'}`}>
                          <Calendar size={12} /> {formatDate(item.deadline)}
                        </span>
                      )}
                    </div>
                    {item.progresso > 0 && (
                      <div className="mt-2">
                        <ProgressBar value={item.progresso} color={frenteCores[item.frente] || '#4da8da'} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // List view
  const ListView = () => (
    <div className="glass-dark overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full" style={{ minWidth: 580 }}>
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
            {['Ação', 'Frente', 'Prioridade', 'Dono', 'Status', 'Progresso'].map(h => (
              <th key={h} className="px-3 py-2.5 text-left text-xs font-bold text-white/50 tracking-widest uppercase border-b border-white/[0.06]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((item, i) => (
            <tr key={item.id} className="cursor-pointer hover:bg-white/[0.03] transition-colors"
                style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}
                onClick={() => setModalId(item.id)}>
              <td className="px-3 py-2.5 border-b border-white/[0.04]">
                <div className="text-sm font-semibold text-white/90">{item.acao}</div>
              </td>
              <td className="px-3 py-2.5 border-b border-white/[0.04]">
                <span className="text-xs px-2 py-1 rounded" style={{ background: (frenteCores[item.frente] || '#4da8da') + '15', color: frenteCores[item.frente] || '#4da8da' }}>
                  {item.frente}
                </span>
              </td>
              <td className="px-3 py-2.5 border-b border-white/[0.04]"><PriorityBadge p={item.prioridade} /></td>
              <td className="px-3 py-2.5 border-b border-white/[0.04] text-xs text-white/70">{item.dono}</td>
              <td className="px-3 py-2.5 border-b border-white/[0.04]"><StatusBadge s={normalizeStatus(item.status)} /></td>
              <td className="px-3 py-2.5 border-b border-white/[0.04] w-24">
                <ProgressBar value={item.progresso || 0} color={PLANO_STATUS_COLORS[normalizeStatus(item.status)]?.c || '#4da8da'} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && (
        <div className="py-8 text-center text-white/30 text-xs">Nenhuma ação encontrada.</div>
      )}
    </div>
  )

  // Detail modal
  const DetailModal = () => {
    if (!modalId) return null
    const item = acoes.find(a => a.id === modalId)
    if (!item) return null
    const comments = item.comentarios_acoes || []

    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fade-in"
           style={{ background: 'rgba(4,6,14,0.75)', backdropFilter: 'blur(16px)' }}
           onClick={() => { setModalId(null); setNewComment('') }}>
        <div className="glass-dark w-full max-w-lg p-5 max-h-[85vh] overflow-y-auto animate-scale-in"
             onClick={e => e.stopPropagation()}>
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-black text-white pr-4">{item.acao}</h2>
            <button onClick={() => { setModalId(null); setNewComment('') }}
                    className="text-white/30 hover:text-white/60 text-xl leading-none">×</button>
          </div>

          {item.descricao && <p className="text-sm text-white/50 mb-4 leading-relaxed">{item.descricao}</p>}

          {/* Fields */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="label text-white/30">Status</label>
              <select value={normalizeStatus(item.status)} onChange={e => handleUpdate(item.id, { status: e.target.value })}
                      className="input-dark text-sm">
                {PLANO_STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-white/30">Prioridade</label>
              <select value={item.prioridade} onChange={e => handleUpdate(item.id, { prioridade: e.target.value })}
                      className="input-dark text-sm">
                {Object.keys(PLANO_PRIORIDADE_CONFIG).map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-white/30">Frente</label>
              <select value={item.frente} onChange={e => handleUpdate(item.id, { frente: e.target.value })}
                      className="input-dark text-sm">
                {frenteNames.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-white/30">Dono</label>
              <input value={item.dono} onChange={e => handleUpdate(item.id, { dono: e.target.value })}
                     className="input-dark text-sm" />
            </div>
            <div>
              <label className="label text-white/30">Prazo</label>
              <input type="date" value={item.deadline || ''} onChange={e => handleUpdate(item.id, { deadline: e.target.value || null })}
                     className="input-dark text-sm" />
            </div>
            <div>
              <label className="label text-white/30">Progresso</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="100" step="5" value={item.progresso || 0}
                       onChange={e => handleUpdate(item.id, { progresso: parseInt(e.target.value) })}
                       className="flex-1" />
                <span className="text-sm font-bold text-cyan-400 w-8 text-right">{item.progresso || 0}%</span>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="border-t border-white/[0.06] pt-3">
            <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2 flex items-center gap-1">
              <MessageSquare size={12} /> Comentários ({comments.length})
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
              {comments.map(c => (
                <div key={c.id} className="text-sm p-2 rounded-lg" style={{ background: c.auto ? 'rgba(78,205,196,0.08)' : 'rgba(255,255,255,0.03)' }}>
                  <div className="text-white/70">{c.texto}</div>
                  <div className="text-xs text-white/50 mt-0.5">
                    {c.autor && `${c.autor} · `}{new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div className="text-sm text-white/30">Nenhum comentário.</div>}
            </div>
            <div className="flex gap-2">
              <input value={newComment} onChange={e => setNewComment(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleAddComment(item.id)}
                     placeholder="Adicionar comentário..." className="input-dark text-sm flex-1" />
              <button onClick={() => handleAddComment(item.id)}
                      className="px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 text-sm font-bold hover:bg-cyan-500/30 transition-all">
                Enviar
              </button>
            </div>
          </div>

          {/* Delete */}
          <button onClick={() => handleDelete(item.id)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-rose-400/60 text-sm hover:bg-rose-500/10 transition-all">
            <Trash2 size={14} /> Excluir ação
          </button>
        </div>
      </div>
    )
  }

  // New modal
  const NewModal = () => {
    const [form, setForm] = useState({
      acao: '', frente: frenteNames[0] || '', descricao: '',
      prioridade: 'Quick Win', dono: DONOS_PLANO[0], status: 'Não Iniciado', deadline: null, progresso: 0
    })
    const handleCreate = async () => {
      if (!form.acao.trim()) return alert('Nome obrigatório')
      await addAcao(form)
      setShowNew(false)
    }
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fade-in"
           style={{ background: 'rgba(4,6,14,0.75)', backdropFilter: 'blur(16px)' }}
           onClick={() => setShowNew(false)}>
        <div className="glass-dark w-full max-w-md p-5 animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Nova Ação</h2>
            <button onClick={() => setShowNew(false)} className="text-white/30 hover:text-white/60 text-xl">×</button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label text-white/30">Nome *</label>
              <input value={form.acao} onChange={e => setForm({...form, acao: e.target.value})} placeholder="Ex: Nova campanha" className="input-dark" />
            </div>
            <div>
              <label className="label text-white/30">Descrição</label>
              <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} rows={2} className="input-dark resize-y" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-white/30">Frente</label>
                <select value={form.frente} onChange={e => setForm({...form, frente: e.target.value})} className="input-dark">
                  {frenteNames.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-white/30">Prioridade</label>
                <select value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value})} className="input-dark">
                  {['Quick Win', 'Ação Tática', 'Projeto Estratégico'].map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label text-white/30">Dono</label>
                <input value={form.dono} onChange={e => setForm({...form, dono: e.target.value})} className="input-dark text-base" />
              </div>
              <div>
                <label className="label text-white/30">Prazo</label>
                <input type="date" value={form.deadline || ''} onChange={e => setForm({...form, deadline: e.target.value || null})} className="input-dark text-base" />
              </div>
            </div>
            <button onClick={handleCreate} className="btn-primary w-full">Criar Ação</button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    )
  }

  const pad = isLandscape ? 'pl-20 pr-4 py-3' : isMobile ? 'px-3 py-2' : 'px-6 py-3'

  return (
    <div className="min-h-screen">
      <DetailModal />
      {showNew && <NewModal />}

      {/* Header */}
      <div className={`${pad} border-b-2`}
           style={{ background: 'rgba(12,18,35,0.6)', backdropFilter: 'blur(20px) saturate(180%)', borderBottomColor: 'rgba(78, 205, 196, 0.2)' }}>
        <div className="flex items-center gap-3">
          <img src="/icons/original-icon.png" alt="Intermarine" className="h-8 rounded-lg" />
          <div className="w-px h-6 bg-white/[0.08]" />
          <div>
            <div className="text-sm font-bold text-cyan-400 tracking-widest uppercase">Plano Intermarine</div>
            <div className="text-xs text-white/50 mt-0.5">Gestão Estratégica</div>
          </div>
          <button onClick={() => setShowNew(true)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 text-cyan-400 text-sm font-bold hover:bg-cyan-500/25 transition-all">
            <Plus size={16} /> Nova
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${pad}`}>
        <div className="flex gap-2 items-center flex-wrap glass-dark px-3 py-2 rounded-lg">
          <span className="text-xs font-bold text-white/50 tracking-widest uppercase">Filtros</span>
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
