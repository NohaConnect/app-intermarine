/**
 * configAdapter — transforms a DB workspace record into the config format
 * that all shared components expect (camelCase, helper functions, etc.)
 *
 * This is the bridge between the new dynamic DB schema and the existing
 * component API that used hardcoded configs.
 */

export function normalizeConfig(ws) {
  if (!ws) return null

  const statuses = ws.statuses || []
  const statusColors = ws.status_colors || {}
  const priorities = ws.priorities || []
  const priorityColors = ws.priority_colors || {}

  // Determine priority type: 'config' if values are objects (with icon/label/c), 'color' if strings
  const firstPriorityVal = Object.values(priorityColors)[0]
  const priorityType = (firstPriorityVal && typeof firstPriorityVal === 'object' && firstPriorityVal.c)
    ? 'config' : 'color'

  return {
    // Identity
    id: ws.id,
    slug: ws.slug,

    // Display
    title: ws.name,
    subtitle: '', // not used in new system
    accent: ws.accent_color,
    accentRgb: ws.accent_rgb,
    icon: ws.icon,

    // Task configuration
    itemLabel: ws.item_label || 'Tarefa',
    titleField: 'titulo', // always unified now
    commentsField: 'comments', // always unified now

    // Statuses
    statuses,
    statusColors,
    doneStatus: ws.done_status,
    inProgressStatus: ws.in_progress_status,
    defaultStatus: ws.default_status,

    // Priorities
    priorities,
    priorityConfig: priorityColors,
    priorityType,
    defaultPriority: ws.default_priority,

    // Features
    hasObjetivo: false, // deprecated — unified system doesn't use this
    kanbanGroupable: false,

    // Defaults
    defaultDonos: [],

    // Helper
    normalizeStatus: (status) => statuses.includes(status) ? status : statuses[0] || status,

    // Raw DB record
    _raw: ws,
  }
}

/**
 * Pre-defined accent colors for workspace creation wizard
 */
export const ACCENT_PALETTE = [
  { color: '#4ecdc4', rgb: '78,205,196', name: 'Teal' },
  { color: '#8b5cf6', rgb: '139,92,246', name: 'Violeta' },
  { color: '#d4a574', rgb: '212,165,116', name: 'Cobre' },
  { color: '#e74c5e', rgb: '231,76,94', name: 'Coral' },
  { color: '#3498db', rgb: '52,152,219', name: 'Azul' },
  { color: '#f6a623', rgb: '246,166,35', name: 'Âmbar' },
  { color: '#2ecc71', rgb: '46,204,113', name: 'Verde' },
  { color: '#e91e8c', rgb: '233,30,140', name: 'Rosa' },
  { color: '#1abc9c', rgb: '26,188,156', name: 'Turquesa' },
  { color: '#9b59b6', rgb: '155,89,182', name: 'Roxo' },
]

/**
 * Default statuses and colors for new workspaces
 */
export const DEFAULT_STATUSES = ['Pendente', 'Em Andamento', 'Finalizado', 'Em Espera']
export const DEFAULT_STATUS_COLORS = {
  'Pendente':      { c: '#a0926d', bg: 'rgba(160,146,109,0.08)', b: 'rgba(160,146,109,0.2)' },
  'Em Andamento':  { c: '#4ecdc4', bg: 'rgba(78,205,196,0.08)', b: 'rgba(78,205,196,0.2)' },
  'Finalizado':    { c: '#7eb89c', bg: 'rgba(126,184,156,0.08)', b: 'rgba(126,184,156,0.2)' },
  'Em Espera':     { c: '#c8c0af', bg: 'rgba(200,192,175,0.08)', b: 'rgba(200,192,175,0.2)' },
}
export const DEFAULT_PRIORITIES = ['Baixa', 'Média', 'Alta', 'Urgente']
export const DEFAULT_PRIORITY_COLORS = {
  'Baixa': '#7eb89c',
  'Média': '#4ecdc4',
  'Alta': '#e6a847',
  'Urgente': '#e74c5e',
}
