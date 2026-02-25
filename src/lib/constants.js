// Status do Plano Intermarine
export const PLANO_STATUS = ['Não Iniciado', 'Em Andamento', 'Concluído', 'Pausado']
export const PLANO_STATUS_COLORS = {
  'Não Iniciado': { c: '#6b7fa0', bg: 'rgba(107,127,160,0.08)', b: 'rgba(107,127,160,0.18)' },
  'Em Andamento': { c: '#4da8da', bg: 'rgba(77,168,218,0.1)', b: 'rgba(77,168,218,0.22)' },
  'Concluído': { c: '#4ecdc4', bg: 'rgba(78,205,196,0.1)', b: 'rgba(78,205,196,0.22)' },
  'Pausado': { c: '#c4a35a', bg: 'rgba(196,163,90,0.1)', b: 'rgba(196,163,90,0.22)' }
}

// Prioridades do Plano
export const PLANO_PRIORIDADES = ['Quick Win', 'Ação Tática', 'Projeto Estratégico', 'Quick Win / Projeto Estratégico', 'Ação Tática / Quick Win']
export const PLANO_PRIORIDADE_CONFIG = {
  'Quick Win': { c: '#4ecdc4', label: 'Quick Win', icon: '⚡' },
  'Ação Tática': { c: '#818cf8', label: 'Ação Tática', icon: '🎯' },
  'Projeto Estratégico': { c: '#c4a35a', label: 'Estratégico', icon: '🚀' },
  'Quick Win / Projeto Estratégico': { c: '#4da8da', label: 'QW / Estratégico', icon: '⚡🚀' },
  'Ação Tática / Quick Win': { c: '#818cf8', label: 'Tática / QW', icon: '🎯⚡' }
}

// Frentes Intermarine (fallback - real data comes from DB)
export const FRENTES_IM_DEFAULT = [
  'Marketing Barcos', 'Novos Clientes', 'Preparação Vendedores', 'Brokers',
  'Marinheiros', 'Parcerias', 'Credibilidade Intermarine', 'Aproximação com Clientes',
  'Marketing & Comercial', 'Oceane'
]
export const FRENTES_IM_CORES = {
  'Marketing Barcos': '#4da8da', 'Novos Clientes': '#818cf8',
  'Preparação Vendedores': '#c4a35a', 'Brokers': '#4ecdc4',
  'Marinheiros': '#3d7cf5', 'Parcerias': '#e056a0',
  'Credibilidade Intermarine': '#f0a35e', 'Aproximação com Clientes': '#e74c5e',
  'Marketing & Comercial': '#4ecdc4', 'Oceane': '#6366f1'
}

// Donos padrão do Plano
export const DONOS_PLANO = ['Noha', 'Bruno', 'Felipe Antunes', 'Comercial / Marketing', 'A definir']

// Status Noha
export const NOHA_STATUS = ['A Fazer', 'Em Progresso', 'Em Revisão', 'Concluído']
export const NOHA_STATUS_COLORS = {
  'A Fazer': { c: '#64748b', bg: 'rgba(148,163,184,0.06)', b: 'rgba(148,163,184,0.15)' },
  'Em Progresso': { c: '#2563eb', bg: 'rgba(59,130,246,0.08)', b: 'rgba(59,130,246,0.2)' },
  'Em Revisão': { c: '#d97706', bg: 'rgba(245,158,11,0.08)', b: 'rgba(245,158,11,0.2)' },
  'Concluído': { c: '#10b981', bg: 'rgba(16,185,129,0.08)', b: 'rgba(16,185,129,0.2)' }
}

// Prioridades Noha
export const NOHA_PRIORIDADES = ['Baixa', 'Média', 'Alta', 'Urgente']
export const NOHA_PRIORIDADE_CORES = {
  'Baixa': '#94a3b8', 'Média': '#3b82f6', 'Alta': '#f59e0b', 'Urgente': '#ef4444'
}

// Frentes Noha (fallback)
export const FRENTES_NOHA_DEFAULT = ['IA para 3D', 'Campanhas', 'Gestão Estratégica', 'Anúncios', 'Oceane', 'Imprensa']
export const FRENTES_NOHA_CORES = {
  'IA para 3D': '#8b5cf6', 'Campanhas': '#2563eb', 'Gestão Estratégica': '#059669',
  'Anúncios': '#d97706', 'Oceane': '#6366f1', 'Imprensa': '#ec4899'
}

// Donos Noha (fallback)
export const DONOS_NOHA = ['Rodrigo', 'Fernando']

// Helper: split donos string
export function splitDonos(str) {
  if (!str) return []
  return str.split(/[\/,&]+/).map(s => s.trim()).filter(Boolean)
}

// Helper: is overdue
export function isOverdue(deadline) {
  if (!deadline) return false
  const d = new Date(deadline + 'T23:59:59')
  return d < new Date()
}

// Helper: days left
export function daysLeft(deadline) {
  if (!deadline) return null
  const d = new Date(deadline + 'T23:59:59')
  const diff = Math.ceil((d - new Date()) / 86400000)
  return diff
}

// Helper: format date pt-BR
export function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function formatDateTime(date) {
  return new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}
