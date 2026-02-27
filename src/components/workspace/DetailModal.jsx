import React, { memo, useState } from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'
import FrenteSelect from './FrenteSelect'
import DonoSelect from './DonoSelect'

/**
 * DetailModal — detail view for a task.
 * Config-driven, works with unified tasks table.
 */
const DetailModal = memo(function DetailModal({
  item,
  config,
  frenteNames,
  donoNames,
  onUpdate,
  onDelete,
  onAddComment,
  onAddFrente,
  onAddDono,
  onClose,
  profileName,
  workspaceName,
}) {
  const [newComment, setNewComment] = useState('')
  if (!item) return null

  const title = item.titulo
  const comments = item.comments || []

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return
    await onAddComment(item.id, newComment.trim(), profileName || 'Anônimo')
    setNewComment('')
  }

  const handleDelete = () => {
    if (confirm(`Excluir ${config.itemLabel.toLowerCase()}?`)) {
      onDelete(item.id)
    }
  }

  const statuses = config.statuses || []
  const priorities = config.priorities || []
  const statusColors = config.statusColors || {}

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{ background: 'rgba(4,6,14,0.8)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}>
      <div
        className="glass-modal w-full sm:max-w-lg p-5 sm:p-6 max-h-[90vh] sm:max-h-[85vh] overflow-y-auto animate-scale-in rounded-t-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-black text-white pr-4">{title}</h2>
            {workspaceName && (
              <span className="text-xs font-medium" style={{ color: config.accent }}>{workspaceName}</span>
            )}
          </div>
          <button onClick={onClose}
            className="text-xl leading-none p-1 -m-1" style={{ color: 'rgba(200,192,175,0.3)' }}>×</button>
        </div>

        {item.descricao && (
          <p className="text-sm mb-4 leading-relaxed" style={{ color: 'rgba(200,192,175,0.5)' }}>{item.descricao}</p>
        )}

        {/* Fields */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="label">Status</label>
            <select value={item.status}
              onChange={e => onUpdate(item.id, { status: e.target.value })} className="input-dark text-sm">
              {statuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Prioridade</label>
            <select value={item.prioridade}
              onChange={e => onUpdate(item.id, { prioridade: e.target.value })} className="input-dark text-sm">
              {priorities.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Frente</label>
            <FrenteSelect value={item.frente}
              onChange={v => onUpdate(item.id, { frente: v })}
              frenteNames={frenteNames}
              onAddFrente={onAddFrente}
              accent={config.accent}
              accentRgb={config.accentRgb} />
          </div>
          <div>
            <label className="label">Dono</label>
            <DonoSelect value={item.dono || ''}
              onChange={v => onUpdate(item.id, { dono: v })}
              donoNames={donoNames || []}
              onAddDono={onAddDono}
              accent={config.accent}
              accentRgb={config.accentRgb} />
          </div>
          <div>
            <label className="label">Prazo</label>
            <input type="date" value={item.deadline || ''}
              onChange={e => onUpdate(item.id, { deadline: e.target.value || null })} className="input-dark text-sm" />
          </div>
          <div>
            <label className="label">Progresso</label>
            <div className="flex items-center gap-2">
              <input type="range" min="0" max="100" step="5" value={item.progresso || 0}
                onChange={e => onUpdate(item.id, { progresso: parseInt(e.target.value) })} className="flex-1" />
              <span className="text-sm font-bold w-8 text-right" style={{ color: config.accent }}>{item.progresso || 0}%</span>
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
                style={{ background: c.auto ? `rgba(${config.accentRgb},0.06)` : 'rgba(200,192,175,0.03)' }}>
                <div className="text-white/70">{c.texto}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(200,192,175,0.3)' }}>
                  {c.autor && `${c.autor} · `}
                  {new Date(c.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <div className="text-sm" style={{ color: 'rgba(200,192,175,0.2)' }}>Nenhum comentário.</div>
            )}
          </div>
          <div className="flex gap-2">
            <input value={newComment} onChange={e => setNewComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmitComment()}
              placeholder="Adicionar comentário..." className="input-dark text-sm flex-1" />
            <button onClick={handleSubmitComment}
              className="px-3 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{ background: `rgba(${config.accentRgb},0.12)`, color: config.accent }}>
              Enviar
            </button>
          </div>
        </div>

        <button onClick={handleDelete}
          className="mt-4 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm transition-all active:scale-95"
          style={{ color: 'rgba(231,76,94,0.5)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,94,0.08)'; e.currentTarget.style.color = '#e74c5e' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(231,76,94,0.5)' }}>
          <Trash2 size={14} /> Excluir {config.itemLabel.toLowerCase()}
        </button>
      </div>
    </div>
  )
})

export default DetailModal
