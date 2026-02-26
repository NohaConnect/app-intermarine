import React, { memo, useState } from 'react'
import { Target } from 'lucide-react'

/**
 * NewItemModal — create new action/task.
 * Config-driven for both Plano and Noha.
 */
const NewItemModal = memo(function NewItemModal({
  config,
  frenteNames,
  allDonos,
  frentesIMNames,
  onAdd,
  onClose,
}) {
  const [form, setForm] = useState({
    [config.titleField]: '',
    frente: frenteNames[0] || '',
    descricao: '',
    prioridade: config.defaultPriority,
    dono: allDonos[0] || config.defaultDonos[0] || '',
    status: config.defaultStatus,
    deadline: null,
    progresso: 0,
    ...(config.hasObjetivo ? { objetivo_intermarine: null } : {}),
  })

  const handleCreate = async () => {
    if (!form[config.titleField]?.trim()) return alert('Nome obrigatório')
    await onAdd(form)
    onClose()
  }

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{ background: 'rgba(4,6,14,0.8)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}>
      <div className="glass-modal w-full sm:max-w-md p-5 sm:p-6 animate-scale-in rounded-t-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}>

        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Nov{config.id === 'noha' ? 'a Tarefa' : 'a Ação'}</h2>
          <button onClick={onClose} className="text-xl p-1 -m-1" style={{ color: 'rgba(200,192,175,0.3)' }}>×</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Nome *</label>
            <input value={form[config.titleField]}
              onChange={e => set(config.titleField, e.target.value)}
              placeholder={`Ex: ${config.id === 'plano' ? 'Nova campanha' : 'Preparar conteúdo'}`}
              className="input-dark" />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea value={form.descricao} onChange={e => set('descricao', e.target.value)}
              rows={2} className="input-dark resize-y" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Frente</label>
              <select value={form.frente} onChange={e => set('frente', e.target.value)} className="input-dark">
                {frenteNames.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Prioridade</label>
              <select value={form.prioridade} onChange={e => set('prioridade', e.target.value)} className="input-dark">
                {(config.priorities || Object.keys(config.priorityConfig)).map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Dono</label>
              <input value={form.dono} onChange={e => set('dono', e.target.value)} className="input-dark text-base" />
            </div>
            <div>
              <label className="label">Prazo</label>
              <input type="date" value={form.deadline || ''} onChange={e => set('deadline', e.target.value || null)} className="input-dark text-base" />
            </div>
          </div>
          {config.hasObjetivo && (
            <div>
              <label className="label flex items-center gap-1"><Target size={10} /> Objetivo Intermarine</label>
              <select value={form.objetivo_intermarine || ''}
                onChange={e => set('objetivo_intermarine', e.target.value || null)} className="input-dark">
                <option value="">Nenhum</option>
                {(frentesIMNames || []).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          )}
          <button onClick={handleCreate}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${config.accent} 0%, ${config.accent}dd 100%)`, boxShadow: `0 4px 24px rgba(${config.accentRgb},0.2)` }}>
            Criar {config.itemLabel}
          </button>
        </div>
      </div>
    </div>
  )
})

export default NewItemModal
