import React, { memo, useState, useRef, useEffect } from 'react'
import { Plus, Check, X } from 'lucide-react'

/**
 * DonoSelect — select with inline "add new dono" button.
 * Same pattern as FrenteSelect.
 */
const DonoSelect = memo(function DonoSelect({
  value,
  onChange,
  donoNames,
  onAddDono,
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
    if (donoNames.includes(trimmed)) {
      onChange(trimmed)
      setAdding(false)
      setNewName('')
      return
    }
    try {
      setSaving(true)
      await onAddDono(trimmed)
      onChange(trimmed)
      setAdding(false)
      setNewName('')
    } catch (e) {
      alert('Erro ao adicionar responsável: ' + e.message)
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
          placeholder="Nome do responsável..."
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
      {donoNames.length > 0 ? (
        <select value={value} onChange={e => onChange(e.target.value)} className={`${className} flex-1`}>
          {donoNames.map(d => <option key={d}>{d}</option>)}
        </select>
      ) : (
        <input value={value || ''} onChange={e => onChange(e.target.value)}
          placeholder="Responsável..." className={`${className} flex-1`} />
      )}
      {onAddDono && (
        <button onClick={() => setAdding(true)}
          className="p-1.5 rounded-lg transition-all active:scale-90 shrink-0"
          style={{ background: `rgba(${accentRgb},0.08)`, color: accent }}
          title="Adicionar responsável">
          <Plus size={14} />
        </button>
      )}
    </div>
  )
})

export default DonoSelect
