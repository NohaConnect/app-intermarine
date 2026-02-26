import React, { memo } from 'react'
import { Link2 } from 'lucide-react'

/**
 * PriorityBadge — renders differently based on workspace config:
 * - 'config' type (Plano): icon + short label from PLANO_PRIORIDADE_CONFIG
 * - 'color' type (Noha):  simple colored text badge
 */
export const PriorityBadge = memo(function PriorityBadge({ priority, config }) {
  if (config.priorityType === 'config') {
    const cfg = config.priorityConfig[priority]
    if (!cfg) return <span className="text-xs" style={{ color: 'rgba(200,192,175,0.4)' }}>{priority}</span>
    return (
      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md"
        style={{ background: cfg.c + '12', color: cfg.c }}>
        <span>{cfg.icon}</span> {cfg.label}
      </span>
    )
  }
  // color type
  const color = config.priorityConfig[priority] || '#75777b'
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-md"
      style={{ background: color + '12', color }}>{priority}</span>
  )
})

/**
 * StatusBadge — pill with color from workspace statusColors
 */
export const StatusBadge = memo(function StatusBadge({ status, config }) {
  const cfg = config.statusColors[status]
  return (
    <span className="text-xs font-bold px-2.5 py-1 rounded-md"
      style={{ background: cfg?.bg, color: cfg?.c, border: `1px solid ${cfg?.b}` }}>
      {status}
    </span>
  )
})

/**
 * ObjetivoBadge — shows link to Intermarine strategic objective (Noha only)
 */
export const ObjetivoBadge = memo(function ObjetivoBadge({ objetivo, frentesIMCores }) {
  if (!objetivo) return null
  const cor = frentesIMCores?.[objetivo] || '#4da8da'
  return (
    <span className="inline-flex items-center gap-1 text-xs font-bold px-1.5 py-0.5 rounded-md"
      style={{ background: cor + '10', color: cor, border: `1px solid ${cor}20` }}>
      <Link2 size={8} /> {objetivo}
    </span>
  )
})

/**
 * FrenteBadge — colored label for frente
 */
export const FrenteBadge = memo(function FrenteBadge({ frente, frenteCores }) {
  const cor = frenteCores?.[frente] || '#4da8da'
  return (
    <span className="text-xs px-1.5 py-0.5 rounded"
      style={{ background: cor + '12', color: cor }}>
      {frente}
    </span>
  )
})
