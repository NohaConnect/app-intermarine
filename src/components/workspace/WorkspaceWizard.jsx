import React, { memo, useState } from 'react'
import { Plus, X, Check, ChevronRight, Palette } from 'lucide-react'
import { ACCENT_PALETTE, DEFAULT_STATUSES, DEFAULT_STATUS_COLORS, DEFAULT_PRIORITIES, DEFAULT_PRIORITY_COLORS } from '../../lib/configAdapter'

/**
 * WorkspaceWizard — multi-step form to create a new workspace.
 * Step 1: Name + accent color
 * Step 2: Frentes (min 3 required, + button for more)
 * Step 3: Confirm → creates workspace + frentes
 */
const WorkspaceWizard = memo(function WorkspaceWizard({
  onClose,
  onCreateWorkspace,  // async (workspace, frentes[]) => void
  parentWorkspace,    // if creating sub-workspace
}) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step 1: Name + Color
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState(ACCENT_PALETTE[0])

  // Step 2: Frentes
  const [frentes, setFrentes] = useState(['', '', ''])
  const [newFrente, setNewFrente] = useState('')

  const addFrenteField = () => {
    if (newFrente.trim()) {
      setFrentes(prev => [...prev, newFrente.trim()])
      setNewFrente('')
    } else {
      setFrentes(prev => [...prev, ''])
    }
  }

  const removeFrente = (idx) => {
    if (frentes.length <= 3) return // min 3
    setFrentes(prev => prev.filter((_, i) => i !== idx))
  }

  const updateFrente = (idx, val) => {
    setFrentes(prev => prev.map((f, i) => i === idx ? val : f))
  }

  const validFrentes = frentes.filter(f => f.trim())
  const canProceedStep1 = name.trim().length >= 2
  const canProceedStep2 = validFrentes.length >= 3

  const handleCreate = async () => {
    try {
      setSaving(true)
      await onCreateWorkspace(
        {
          name: name.trim(),
          slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
          accent_color: selectedColor.color,
          accent_rgb: selectedColor.rgb,
          icon: 'briefcase',
          parent_id: parentWorkspace?.id || null,
          statuses: DEFAULT_STATUSES,
          status_colors: { ...DEFAULT_STATUS_COLORS, 'Em Andamento': { ...DEFAULT_STATUS_COLORS['Em Andamento'], c: selectedColor.color } },
          priorities: DEFAULT_PRIORITIES,
          priority_colors: { ...DEFAULT_PRIORITY_COLORS, 'Média': selectedColor.color },
          item_label: 'Tarefa',
          done_status: 'Finalizado',
          in_progress_status: 'Em Andamento',
          default_status: 'Pendente',
          default_priority: 'Média',
          ordem: 99,
        },
        validFrentes
      )
      onClose()
    } catch (e) {
      alert('Erro ao criar workspace: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      style={{ background: 'rgba(4,6,14,0.85)', backdropFilter: 'blur(20px)' }}
      onClick={onClose}>
      <div className="glass-modal w-full sm:max-w-md p-5 sm:p-6 animate-scale-in rounded-t-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-bold text-white">
              {parentWorkspace ? `Novo sub-workspace — ${parentWorkspace.name}` : 'Novo Workspace'}
            </h2>
            <div className="text-xs mt-0.5" style={{ color: 'rgba(200,192,175,0.3)' }}>
              Passo {step} de 3
            </div>
          </div>
          <button onClick={onClose} className="text-xl p-1 -m-1" style={{ color: 'rgba(200,192,175,0.3)' }}>×</button>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full mb-5" style={{ background: 'rgba(200,192,175,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%`, background: selectedColor.color }} />
        </div>

        {/* ─── STEP 1: Name + Color ─── */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="label">Nome do cliente / workspace *</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Ex: Intermarine, Agência XYZ..."
                className="input-dark" autoFocus />
            </div>
            <div>
              <label className="label flex items-center gap-1"><Palette size={11} /> Cor do workspace</label>
              <div className="flex gap-2 flex-wrap mt-2">
                {ACCENT_PALETTE.map(c => (
                  <button key={c.color} onClick={() => setSelectedColor(c)}
                    className="w-8 h-8 rounded-lg transition-all active:scale-90 flex items-center justify-center"
                    style={{
                      background: c.color,
                      boxShadow: selectedColor.color === c.color ? `0 0 0 2px rgba(10,14,26,1), 0 0 0 4px ${c.color}` : 'none',
                      transform: selectedColor.color === c.color ? 'scale(1.1)' : 'scale(1)'
                    }}>
                    {selectedColor.color === c.color && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!canProceedStep1}
              className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: canProceedStep1 ? `linear-gradient(135deg, ${selectedColor.color} 0%, ${selectedColor.color}dd 100%)` : 'rgba(200,192,175,0.06)',
                color: canProceedStep1 ? 'white' : 'rgba(200,192,175,0.3)',
                opacity: canProceedStep1 ? 1 : 0.5,
              }}>
              Próximo <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* ─── STEP 2: Frentes ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="label">Frentes (mínimo 3) *</label>
              <p className="text-xs mb-3" style={{ color: 'rgba(200,192,175,0.3)' }}>
                Defina as categorias de trabalho para esse workspace
              </p>
              <div className="space-y-2">
                {frentes.map((f, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input value={f} onChange={e => updateFrente(idx, e.target.value)}
                      placeholder={`Frente ${idx + 1}${idx < 3 ? ' *' : ''}`}
                      className="input-dark flex-1" />
                    {frentes.length > 3 && (
                      <button onClick={() => removeFrente(idx)}
                        className="p-1.5 rounded-lg transition-all active:scale-90"
                        style={{ color: 'rgba(200,192,175,0.3)' }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button onClick={addFrenteField}
                className="mt-2 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all active:scale-95"
                style={{ color: selectedColor.color, background: `rgba(${selectedColor.rgb},0.08)` }}>
                <Plus size={13} /> Adicionar frente
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: 'rgba(200,192,175,0.06)', color: 'rgba(200,192,175,0.5)' }}>
                Voltar
              </button>
              <button onClick={() => setStep(3)} disabled={!canProceedStep2}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{
                  background: canProceedStep2 ? `linear-gradient(135deg, ${selectedColor.color} 0%, ${selectedColor.color}dd 100%)` : 'rgba(200,192,175,0.06)',
                  opacity: canProceedStep2 ? 1 : 0.5,
                }}>
                Próximo <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Confirm ─── */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="glass-card p-4 border-l-4" style={{ borderLeftColor: selectedColor.color }}>
              <div className="text-sm font-bold text-white mb-1">{name}</div>
              {parentWorkspace && (
                <div className="text-xs mb-2" style={{ color: 'rgba(200,192,175,0.4)' }}>
                  Sub-workspace de {parentWorkspace.name}
                </div>
              )}
              <div className="flex gap-2 flex-wrap mt-2">
                {validFrentes.map(f => (
                  <span key={f} className="text-xs px-2 py-1 rounded"
                    style={{ background: `rgba(${selectedColor.rgb},0.12)`, color: selectedColor.color }}>
                    {f}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"
                style={{ background: 'rgba(200,192,175,0.06)', color: 'rgba(200,192,175,0.5)' }}>
                Voltar
              </button>
              <button onClick={handleCreate} disabled={saving}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                style={{ background: `linear-gradient(135deg, ${selectedColor.color} 0%, ${selectedColor.color}dd 100%)`, opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Criando...' : 'Criar Workspace'} <Check size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
})

export default WorkspaceWizard
