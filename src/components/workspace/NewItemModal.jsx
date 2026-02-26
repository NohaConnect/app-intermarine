import React, { memo, useState } from 'react'
import FrenteSelect from './FrenteSelect'
import DonoSelect from './DonoSelect'

/**
 * NewItemModal — create new task.
 * Config-driven, works with unified tasks table.
 */
const NewItemModal = memo(function NewItemModal({
  config,
  frenteNames,
  donoNames,
  onAdd,
  onAddFrente,
  onAddDono,
  onClose,
}) {
  const [form, setForm] = useState({
    titulo: '',
    frente: frenteNames[0] || '',
    descricao: '',
    prioridade: config.default_priority || 'Média',
    dono: donoNames[0] || '',
    status: config.default_status || 'Pendente',
    deadline: null,
    progresso: 0,
  })

  const handleCreate = async () => {
    if (!form.titulo?.trim()) return alert('Nome obrigatório')
    await onAdd(form)
    onClose()
  }

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))
  const statuses = config.statuses || []
  const priorities = config.priorities || []

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{ background: 'rgba(4,6,14,0.8)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}>
      <div className="glass-modal w-full sm:max-w-md p-5 sm:p-6 animate-scale-in rounded-t-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}>

        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Nov{config.item_label === 'Ação' ? 'a Ação' : 'a Tarefa'}</h2>
          <button onClick={onClose} className="text-xl p-1 -m-1" style={{ color: 'rgba(200,192,175,0.3)' }}>×</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="label">Nome *</label>
            <input value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
              placeholder="Ex: Nova atividade"
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
              <FrenteSelect value={form.frente}
                onChange={v => set('frente', v)}
                frenteNames={frenteNames}
                onAddFrente={onAddFrente}
                accent={config.accent_color}
                accentRgb={config.accent_rgb}
                className="input-dark" />
            </div>
            <div>
              <label className="label">Prioridade</label>
              <select value={form.prioridade} onChange={e => set('prioridade', e.target.value)} className="input-dark">
                {priorities.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Dono</label>
              <DonoSelect value={form.dono}
                onChange={v => set('dono', v)}
                donoNames={donoNames}
                onAddDono={onAddDono}
                accent={config.accent_color}
                accentRgb={config.accent_rgb}
                className="input-dark text-base" />
            </div>
            <div>
              <label className="label">Prazo</label>
              <input type="date" value={form.deadline || ''} onChange={e => set('deadline', e.target.value || null)} className="input-dark text-base" />
            </div>
          </div>
          <button onClick={handleCreate}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
            style={{ background: `linear-gradient(135deg, ${config.accent_color} 0%, ${config.accent_color}dd 100%)`, boxShadow: `0 4px 24px rgba(${config.accent_rgb},0.2)` }}>
            Criar {config.item_label}
          </button>
        </div>
      </div>
    </div>
  )
})

export default NewItemModal
