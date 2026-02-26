/**
 * Workspace configurations — single source of truth for all workspaces.
 * Shared components read these configs so all pages render identically
 * with different data, colors, labels and field mappings.
 */
import {
  PLANO_STATUS, PLANO_STATUS_COLORS, PLANO_PRIORIDADE_CONFIG, PLANO_PRIORIDADES,
  NOHA_STATUS, NOHA_STATUS_COLORS, NOHA_PRIORIDADE_CORES, NOHA_PRIORIDADES,
  CASA_STATUS, CASA_STATUS_COLORS, CASA_PRIORIDADE_CORES, CASA_PRIORIDADES,
  DONOS_PLANO, DONOS_NOHA, DONOS_CASA
} from './constants'

export const PLANO_CONFIG = {
  id: 'plano',
  accent: '#4ecdc4',
  accentRgb: '78,205,196',
  title: 'Estratégia 2026 IM',
  subtitle: 'Planejamento Estratégico',
  itemLabel: 'Ação',
  itemLabelPlural: 'Ações',
  titleField: 'acao',
  commentsField: 'comentarios_acoes',
  statuses: PLANO_STATUS,
  statusColors: PLANO_STATUS_COLORS,
  doneStatus: 'Concluído',
  inProgressStatus: 'Em Andamento',
  priorities: PLANO_PRIORIDADES,
  priorityConfig: PLANO_PRIORIDADE_CONFIG,
  priorityType: 'config',
  defaultPriority: 'Quick Win',
  defaultStatus: 'Não Iniciado',
  defaultDonos: DONOS_PLANO,
  kanbanGroupable: true,
  hasObjetivo: false,
  normalizeStatus: (status) => PLANO_STATUS.includes(status) ? status : PLANO_STATUS[0],
}

export const CASA_CONFIG = {
  id: 'casa',
  accent: '#d4a574',
  accentRgb: '212,165,116',
  title: 'Casa Intermarine',
  subtitle: 'Decoração & Lifestyle',
  itemLabel: 'Tarefa',
  itemLabelPlural: 'Tarefas',
  titleField: 'titulo',
  commentsField: 'comentarios_casa',
  statuses: CASA_STATUS,
  statusColors: CASA_STATUS_COLORS,
  doneStatus: 'Finalizado',
  inProgressStatus: 'Em Andamento',
  priorities: CASA_PRIORIDADES,
  priorityConfig: CASA_PRIORIDADE_CORES,
  priorityType: 'color',
  defaultPriority: 'Média',
  defaultStatus: 'Pendente',
  defaultDonos: DONOS_CASA,
  kanbanGroupable: false,
  hasObjetivo: false,
  normalizeStatus: (status) => CASA_STATUS.includes(status) ? status : CASA_STATUS[0],
}

export const NOHA_CONFIG = {
  id: 'noha',
  accent: '#8b5cf6',
  accentRgb: '139,92,246',
  title: 'Atividades Gerais de MKT',
  subtitle: 'Marketing & Operações',
  itemLabel: 'Tarefa',
  itemLabelPlural: 'Tarefas',
  titleField: 'titulo',
  commentsField: 'comentarios_tarefas',
  statuses: NOHA_STATUS,
  statusColors: NOHA_STATUS_COLORS,
  doneStatus: 'Concluído',
  inProgressStatus: 'Em Progresso',
  priorities: NOHA_PRIORIDADES,
  priorityConfig: NOHA_PRIORIDADE_CORES,
  priorityType: 'color',
  defaultPriority: 'Média',
  defaultStatus: 'A Fazer',
  defaultDonos: DONOS_NOHA,
  kanbanGroupable: false,
  hasObjetivo: true,
  normalizeStatus: (status) => NOHA_STATUS.includes(status) ? status : NOHA_STATUS[0],
}
