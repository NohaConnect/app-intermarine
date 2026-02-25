import React, { useState, useMemo } from 'react'
import { useTarefas, useFrentes, useResponsive } from '../hooks/useSupabase'
import { useAuth } from '../contexts/AuthContext'
import {
  NOHA_STATUS, NOHA_STATUS_COLORS, NOHA_PRIORIDADE_CORES,
  FRENTES_NOHA_CORES, FRENTES_IM_CORES, DONOS_NOHA,
  splitDonos, isOverdue, daysLeft, formatDate, formatDateTime
} from '../lib/constants'
import { Plus, X, Calendar, User, Target, MessageSquare, Trash2, AlertTriangle, Link2 } from 'lucide-react'

export default function NohaPage({ view }) {
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

  const frenteNames = frentesNoha.length > 0 ? frentesNoha.map(f => f.nome) : Object.keys(FRENTES_NOHA_CORES)
  const frenteCores = frentesNoha.length > 0
    ? Object.fromEntries(frentesNoha.map(f => [f.nome, f.cor]))
    : FRENTES_NOHA_CORES

  // Frentes Intermarine for objetivo connection
  const frentesIMNames = frentesIM.length > 0 ? frentesIM.map(f => f.nome) : Object.keys(FRENTES_IM_CORES)
  const frentesIMCores = frentesIM.length > 0
    ? Object.fromEntries(frentesIM.map(f => [f.nome, f.cor]))
    : FRENTES_IM_CORES

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
    return { total, byStatus, done, pct: total > 0 ? Math.round(done / total * 100) : 0 }
  }, [filtered])

  const handleUpdate = async (id, fields) => {
    const tarefa = tarefas.find(t => t.id === id)
    if (fields.status && fields.status !== tarefa?.status) {
      await addComentario(id, `⚡ ${tarefa.status} → ${fields.status}`, profile?.name || 'Sistema', true)
    }
    await updateTarefa(id, fields)
  }

  const handleAddComment = async (id) => {
    if (!newComment.trim()) return
    await addComentario(id, newComment.trim(), profile?.name || 'Anônimo')
    setNewComment('')
  }

  const handleDelete = async (id) => {
    if (confirm('Excluir esta tarefa?')) {
      await deleteTarefa(id)
      setModalId(null)
    }
  }

  const Select = ({ value, onChange, options }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
            className="text-[11px] font-semibold rounded-lg px-2.5 py-1.5 outline-none cursor-pointer transition-all"
            style={{ background: 'rgba(0,0,0,0.04)', color: '#475569', border: '1px solid rgba(0,0,0,0.06)' }}>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )

  const PriorityBadge = ({ p }) => {
    const color = NOHA_PRIORIDADE_CORES[p] || '#94a3b8'
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{ background: color + '15', color }}>
        {p}
      </span>
    )
  }

  const ProgressBar = ({ value, color = '#2563eb' }) => (
    <div className="w-full h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500"
           style={{ width: `${value}%`, background: `linear-gradient(90deg, ${color}, ${color}aa)` }} />
    </div>
  )

  // Objetivo Intermarine badge
  const ObjetivoBadge = ({ objetivo }) => {
    if (!objetivo) return null
    const cor = frentesIMCores[objetivo] || '#4da8da'
    return (
      <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
            style={{ background: cor + '12', color: cor, border: `1px solid ${cor}25` }}>
        <Link2 size={8} /> {objetivo}
      </span>
    )
  }

  // Dashboard
  const DashboardView = () => (
    <div className={`grid gap-3 ${isLandscape ? 'grid-cols-2' : isMobile ? 'grid-cols-1' : 'grid-cols-2 lg:grid-cols-3'}`}>
      <div className="glass-light p-4 col-span-full">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Progresso Geral</div>
            <div className="text-2xl font-black text-gray-800">{stats.pct}%</div>
          </div>
          <div className="flex gap-4 text-right">
            <div><div className="text-lg font-bold text-gray-800">{stats.total}</div><div className="text-[9px] text-gray-400 uppercase">Total</div></div>
            <div><div className="text-lg font-bold text-emerald-500">{stats.done}</div><div className="text-[9px] text-gray-400 uppercase">Concluídas</div></div>
          </div>
        </div>
        <ProgressBar value={stats.pct} color="#10b981" />
        <div className="flex gap-2 mt-3 flex-wrap">
          {NOHA_STATUS.map(s => (
            <div key={s} className="flex items-center gap-1.5 text-[10px]">
              <div className="w-2 h-2 rounded-full" style={{ background: NOHA_STATUS_COLORS[s]?.c }} />
              <span className="text-gray-500">{s}</span>
              <span className="font-bold text-gray-700">{stats.byStatus[s] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      {frenteNames.map(frente => {
        const items = filtered.filter(t => t.frente === frente)
        if (items.length === 0) return null
        const done = items.filter(t => t.status === 'Concluído').length
        const pct = Math.round(done / items.length * 100)
        return (
          <div key={frente} className="glass-light p-4 card-hover">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full" style={{ background: frenteCores[frente] || '#2563eb' }} />
              <span className="text-xs font-bold text-gray-800">{frente}</span>
              <span className="ml-auto text-xs font-bold" style={{ color: frenteCores[frente] || '#2563eb' }}>{pct}%</span>
            </div>
            <ProgressBar value={pct} color={frenteCores[frente] || '#2563eb'} />
            <div className="mt-3 space-y-1.5">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2 cursor-pointer hover:bg-black/[0.02] rounded-lg p-1.5 -mx-1.5 transition-all"
                     onClick={() => setModalId(item.id)}>
                  <div className="w-1 h-1 rounded-full" style={{ background: NOHA_STATUS_COLORS[item.status]?.c }} />
                  <span className="text-[11px] text-gray-600 flex-1 truncate">{item.titulo}</span>
                  <PriorityBadge p={item.prioridade} />
                  <ObjetivoBadge objetivo={item.objetivo_intermarine} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  // Kanban
  const KanbanView = () => (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
      {NOHA_STATUS.map(status => {
        const items = filtered.filter(t => t.status === status)
        return (
          <div key={status} className="min-w-[260px] max-w-[300px] flex-shrink-0">
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-2 h-2 rounded-full" style={{ background: NOHA_STATUS_COLORS[status]?.c }} />
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">{status}</span>
              <span className="text-[10px] font-bold ml-auto px-1.5 py-0.5 rounded bg-black/[0.04] text-gray-500">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="glass-light p-3 card-hover cursor-pointer"
                     onClick={() => setModalId(item.id)}>
                  <div className="text-xs font-bold text-gray-800 mb-1.5">{item.titulo}</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <PriorityBadge p={item.prioridade} />
                    <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: (frenteCores[item.frente] || '#2563eb') + '12', color: frenteCores[item.frente] || '#2563eb' }}>
                      {item.frente}
                    </span>
                    <ObjetivoBadge objetivo={item.objetivo_intermarine} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1"><User size={10} /> {item.dono}</span>
                    {item.deadline && (
                      <span className={`text-[10px] flex items-center gap-1 ${isOverdue(item.deadline) && item.status !== 'Concluído' ? 'text-red-500' : 'text-gray-400'}`}>
                        <Calendar size={10} /> {formatDate(item.deadline)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )

  // List
  const ListView = () => (
    <div className="glass-light overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <table className="w-full" style={{ minWidth: 640 }}>
        <thead>
          <tr style={{ background: 'rgba(0,0,0,0.02)' }}>
            {['Tarefa', 'Frente', 'Objetivo IM', 'Prioridade', 'Dono', 'Status'].map(h => (
              <th key={h} className="px-3 py-2.5 text-left text-[9px] font-bold text-gray-400 tracking-widest uppercase border-b border-black/[0.06]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((item, i) => (
            <tr key={item.id} className="cursor-pointer hover:bg-black/[0.02] transition-colors"
                style={{ background: i % 2 === 0 ? 'rgba(0,0,0,0.01)' : 'transparent' }}
                onClick={() => setModalId(item.id)}>
              <td className="px-3 py-2.5 border-b border-black/[0.04]">
                <div className="text-[11px] font-semibold text-gray-800">{item.titulo}</div>
              </td>
              <td className="px-3 py-2.5 border-b border-black/[0.04]">
                <span className="text-[10px] text-gray-600">{item.frente}</span>
              </td>
              <td className="px-3 py-2.5 border-b border-black/[0.04]">
                <ObjetivoBadge objetivo={item.objetivo_intermarine} />
              </td>
              <td className="px-3 py-2.5 border-b border-black/[0.04]"><PriorityBadge p={item.prioridade} /></td>
              <td className="px-3 py-2.5 border-b border-black/[0.04] text-[10px] text-gray-600">{item.dono}</td>
              <td className="px-3 py-2.5 border-b border-black/[0.04]">
                <span className="text-[10px] font-bold" style={{ color: NOHA_STATUS_COLORS[item.status]?.c }}>{item.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filtered.length === 0 && <div className="py-8 text-center text-gray-400 text-xs">Nenhuma tarefa encontrada.</div>}
    </div>
  )

  // Detail modal
  const DetailModal = () => {
    if (!modalId) return null
    const item = tarefas.find(t => t.id === modalId)
    if (!item) return null
    const comments = item.comentarios_tarefas || []

    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-fade-in"
           style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}
           onClick={() => { setModalId(null); setNewComment('') }}>
        <div className="glass-light w-full max-w-lg p-5 max-h-[85vh] overflow-y-auto animate-scale-in"
             onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-base font-black text-gray-800 pr-4">{item.titulo}</h2>
            <button onClick={() => { setModalId(null); setNewComment('') }}
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
          </div>

          {item.descricao && <p className="text-xs text-gray-500 mb-4 leading-relaxed">{item.descricao}</p>}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="label text-gray-400">Status</label>
              <select value={item.status} onChange={e => handleUpdate(item.id, { status: e.target.value })} className="input-light text-xs">
                {NOHA_STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-gray-400">Prioridade</label>
              <select value={item.prioridade} onChange={e => handleUpdate(item.id, { prioridade: e.target.value })} className="input-light text-xs">
                {['Baixa', 'Média', 'Alta', 'Urgente'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-gray-400">Frente Noha</label>
              <select value={item.frente} onChange={e => handleUpdate(item.id, { frente: e.target.value })} className="input-light text-xs">
                {frenteNames.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label text-gray-400">Dono</label>
              <input value={item.dono} onChange={e => handleUpdate(item.id, { dono: e.target.value })} className="input-light text-xs" />
            </div>
            <div>
              <label className="label text-gray-400">Prazo</label>
              <input type="date" value={item.deadline || ''} onChange={e => handleUpdate(item.id, { deadline: e.target.value || null })} className="input-light text-xs" />
            </div>
            <div>
              <label className="label text-gray-400">Progresso</label>
              <div className="flex items-center gap-2">
                <input type="range" min="0" max="100" step="5" value={item.progresso || 0}
                       onChange={e => handleUpdate(item.id, { progresso: parseInt(e.target.value) })} className="flex-1" />
                <span className="text-xs font-bold text-blue-600 w-8 text-right">{item.progresso || 0}%</span>
              </div>
            </div>

            {/* OBJETIVO INTERMARINE - key new feature */}
            <div className="col-span-2">
              <label className="label text-gray-400 flex items-center gap-1">
                <Target size={10} /> Objetivo Intermarine
              </label>
              <select value={item.objetivo_intermarine || ''}
                      onChange={e => handleUpdate(item.id, { objetivo_intermarine: e.target.value || null })}
                      className="input-light text-xs">
                <option value="">Nenhum (sem vínculo)</option>
                {frentesIMNames.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <p className="text-[9px] text-gray-400 mt-1">
                Conecta esta tarefa a uma frente estratégica do Plano Intermarine
              </p>
            </div>
          </div>

          {/* Comments */}
          <div className="border-t border-black/[0.06] pt-3">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <MessageSquare size={10} /> Comentários ({comments.length})
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
              {comments.map(c => (
                <div key={c.id} className="text-[11px] p-2 rounded-lg" style={{ background: c.auto ? 'rgba(59,130,246,0.06)' : 'rgba(0,0,0,0.02)' }}>
                  <div className="text-gray-700">{c.texto}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">
                    {c.autor && `${c.autor} · `}{new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
              {comments.length === 0 && <div className="text-[11px] text-gray-400">Nenhum comentário.</div>}
            </div>
            <div className="flex gap-2">
              <input value={newComment} onChange={e => setNewComment(e.target.value)}
                     onKeyDown={e => e.key === 'Enter' && handleAddComment(item.id)}
                     placeholder="Adicionar comentário..." className="input-light text-xs flex-1" />
              <button onClick={() => handleAddComment(item.id)}
                      className="px-3 py-2 rounded-xl bg-blue-500/10 text-blue-600 text-xs font-bold hover:bg-blue-500/20 transition-all">
                Enviar
              </button>
            </div>
          </div>

          <button onClick={() => handleDelete(item.id)}
                  className="mt-4 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-red-400 text-[11px] hover:bg-red-500/10 transition-all">
            <Trash2 size={12} /> Excluir tarefa
          </button>
        </div>
      </div>
    )
  }

  // New modal - with Objetivo Intermarine field
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
           style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)' }}
           onClick={() => setShowNew(false)}>
        <div className="glass-light w-full max-w-md p-5 animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-800">Nova Tarefa</h2>
            <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
          </div>
          <div className="space-y-3">
            <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})}
                   placeholder="Título *" className="input-light" />
            <textarea value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})}
                      rows={2} placeholder="Descrição" className="input-light resize-y" />
            <div className="grid grid-cols-2 gap-3">
              <select value={form.frente} onChange={e => setForm({...form, frente: e.target.value})} className="input-light">
                {frenteNames.map(f => <option key={f}>{f}</option>)}
              </select>
              <select value={form.prioridade} onChange={e => setForm({...form, prioridade: e.target.value})} className="input-light">
                {['Baixa', 'Média', 'Alta', 'Urgente'].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={form.dono} onChange={e => setForm({...form, dono: e.target.value})} className="input-light">
                {(allDonos.length > 0 ? allDonos : DONOS_NOHA).map(d => <option key={d}>{d}</option>)}
              </select>
              <input type="date" value={form.deadline || ''} onChange={e => setForm({...form, deadline: e.target.value || null})} className="input-light" />
            </div>

            {/* Objetivo Intermarine */}
            <div>
              <label className="label text-gray-400 flex items-center gap-1">
                <Target size={10} /> Objetivo Intermarine
              </label>
              <select value={form.objetivo_intermarine || ''}
                      onChange={e => setForm({...form, objetivo_intermarine: e.target.value || null})}
                      className="input-light">
                <option value="">Nenhum</option>
                {frentesIMNames.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>

            <button onClick={handleCreate}
                    className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 active:scale-95 transition-all">
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
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    )
  }

  const pad = isLandscape ? 'pl-20 pr-4 py-3' : isMobile ? 'px-3 py-2' : 'px-6 py-3'

  return (
    <div className="min-h-screen" style={{ color: '#1e293b' }}>
      <DetailModal />
      {showNew && <NewModal />}

      {/* Header */}
      <div className={`${pad} border-b border-black/[0.04]`}
           style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px) saturate(180%)' }}>
        <div className="flex items-center gap-3">
          <img src="/icons/logo-noha.png" alt="Noha" className="h-7" />
          <div className="w-px h-6 bg-black/[0.06]" />
          <div>
            <div className="text-xs font-bold text-blue-600 tracking-widest uppercase">Ações da Noha</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Gestão Operacional</div>
          </div>
          <button onClick={() => setShowNew(true)}
                  className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 text-[11px] font-bold hover:bg-blue-500/20 transition-all">
            <Plus size={14} /> Nova
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`${pad}`}>
        <div className="flex gap-2 items-center flex-wrap glass-light px-3 py-2">
          <span className="text-[8px] font-bold text-gray-400 tracking-widest uppercase">Filtros</span>
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
