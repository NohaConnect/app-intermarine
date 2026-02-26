// Status do Plano Intermarine
export const PLANO_STATUS = ['Não Iniciado', 'Em Andamento', 'Concluído', 'Pausado']

export const PLANO_STATUS_COLORS = {
  'Não Iniciado': { c: '#75777b', bg: 'rgba(117,119,123,0.10)', b: 'rgba(117,119,123,0.20)' },
  'Em Andamento': { c: '#4da8da', bg: 'rgba(77,168,218,0.10)', b: 'rgba(77,168,218,0.22)' },
  'Concluído':    { c: '#4ecdc4', bg: 'rgba(78,205,196,0.10)', b: 'rgba(78,205,196,0.22)' },
  'Pausado':      { c: '#c8c0af', bg: 'rgba(200,192,175,0.10)', b: 'rgba(200,192,175,0.22)' }
}

// Prioridades do Plano
export const PLANO_PRIORIDADES = ['Quick Win', 'Ação Tática', 'Projeto Estratégico', 'Quick Win / Projeto Estratégico', 'Ação Tática / Quick Win']

export const PLANO_PRIORIDADE_CONFIG = {
  'Quick Win':                        { c: '#4ecdc4', label: 'Quick Win',        icon: '\u26A1' },
  'Ação Tática':                      { c: '#8b5cf6', label: 'Ação Tática',      icon: '\uD83C\uDFAF' },
  'Projeto Estratégico':              { c: '#c8c0af', label: 'Estratégico',      icon: '\uD83D\uDE80' },
  'Quick Win / Projeto Estratégico':  { c: '#4da8da', label: 'QW / Estratégico', icon: '\u26A1\uD83D\uDE80' },
  'Ação Tática / Quick Win':          { c: '#8b5cf6', label: 'Tática / QW',      icon: '\uD83C\uDFAF\u26A1' }
}

// Frentes Intermarine (fallback - real data comes from DB)
export const FRENTES_IM_DEFAULT = [
  'Marketing Barcos', 'Novos Clientes', 'Preparação Vendedores', 'Brokers',
  'Marinheiros', 'Parcerias', 'Credibilidade Intermarine', 'Aproximação com Clientes',
  'Marketing & Comercial', 'Oceane'
]

export const FRENTES_IM_CORES = {
  'Marketing Barcos': '#4da8da',
  'Novos Clientes': '#8b5cf6',
  'Preparação Vendedores': '#c8c0af',
  'Brokers': '#4ecdc4',
  'Marinheiros': '#3d7cf5',
  'Parcerias': '#e056a0',
  'Credibilidade Intermarine': '#f0a35e',
  'Aproximação com Clientes': '#e74c5e',
  'Marketing & Comercial': '#4ecdc4',
  'Oceane': '#6366f1'
}

// Donos padrão do Plano
export const DONOS_PLANO = ['Noha', 'Bruno', 'Felipe Antunes', 'Comercial / Marketing', 'A definir']

// Status Noha
export const NOHA_STATUS = ['A Fazer', 'Em Progresso', 'Em Revisão', 'Concluído']

export const NOHA_STATUS_COLORS = {
  'A Fazer':      { c: '#75777b', bg: 'rgba(117,119,123,0.10)', b: 'rgba(117,119,123,0.20)' },
  'Em Progresso': { c: '#4da8da', bg: 'rgba(77,168,218,0.10)', b: 'rgba(77,168,218,0.20)' },
  'Em Revisão':   { c: '#c8c0af', bg: 'rgba(200,192,175,0.10)', b: 'rgba(200,192,175,0.20)' },
  'Concluído':    { c: '#4ecdc4', bg: 'rgba(78,205,196,0.10)', b: 'rgba(78,205,196,0.20)' }
}

// Prioridades Noha
export const NOHA_PRIORIDADES = ['Baixa', 'Média', 'Alta', 'Urgente']

export const NOHA_PRIORIDADE_CORES = {
  'Baixa':   '#75777b',
  'Média':   '#4da8da',
  'Alta':    '#c8c0af',
  'Urgente': '#e74c5e'
}

// Frentes Noha (fallback)
export const FRENTES_NOHA_DEFAULT = ['IA para 3D', 'Campanhas', 'Gestão Estratégica', 'Anúncios', 'Oceane', 'Imprensa']

export const FRENTES_NOHA_CORES = {
  'IA para 3D': '#8b5cf6',
  'Campanhas': '#4da8da',
  'Gestão Estratégica': '#4ecdc4',
  'Anúncios': '#c8c0af',
  'Oceane': '#6366f1',
  'Imprensa': '#e056a0'
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
