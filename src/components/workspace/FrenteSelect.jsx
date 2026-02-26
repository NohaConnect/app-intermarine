import React, { memo, useState, useRef, useEffect } from 'react'
import { Plus, Check, X } from 'lucide-react'

/**
 * FrenteSelect — select with inline "add new frente" button.
 * Works in both DetailModal (immediate update) and NewItemModal (form state).
 */
const FrenteSelect = memo(function FrenteSelect({
  value,
  onChange,
  frenteNames,
  onAddFrente,      // async (nome) => void — adds to DB
  accent = '#c8c0af',
  accentRgb = '200,192,175',
  className = 'input-dark text-sm',
}) {
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    if (adding && inputRef.current) inputRef.current.focus()
  }, [adding])

  const handleAdd = async () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    if (frenteNames.includes(trimmed)) {
      onChange(trimmed)
      setAdding(false)
      setNewName('')
      return
    }
    try {
      setSaving(true)
      await onAddFrente(trimmed)
      onChange(trimmed)
      setAdding(false)
      setNewName('')
    } catch (e) {
      alert('Erro ao criar frente: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  if (adding) {
    return (
      <div className="flex gap-1.5 items-center">
        <input
          ref={inputRef}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAdd()
            if (e.key === 'Escape') { setAdding(false); setNewName('') }
          }}
          placeholder="Nome da frente..."
          className={`${className} flex-1`}
          disabled={saving}
        />
        <button onClick={handleAdd} disabled={saving || !newName.trim()}
          className="p-1.5 rounded-lg transition-all active:scale-90"
          style={{ background: `rgba(${accentRgb},0.15)`, color: accent, opacity: saving || !newName.trim() ? 0.4 : 1 }}>
          <Check size={14} />
        </button>
        <button onClick={() => { setAdding(false); setNewName('') }}
          className="p-1.5 rounded-lg transition-all active:scale-90"
          style={{ color: 'rgba(200,192,175,0.4)' }}>
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-1.5 items-center">
      <select value={value} onChange={e => onChange(e.target.value)} className={`${className} flex-1`}>
        {frenteNames.map(f => <option key={f}>{f}</option>)}
      </select>
      {onAddFrente && (
        <button onClick={() => setAdding(true)}
          className="p-1.5 rounded-lg transition-all active:scale-90 shrink-0"
          style={{ background: `rgba(${accentRgb},0.08)`, color: accent }}
          title="Adicionar nova frente">
          <Plus size={14} />
        </button>
      )}
    </div>
  )
})

export default FrenteSelect
