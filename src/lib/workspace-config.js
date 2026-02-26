/**
 * Workspace configurations — single source of truth for Plano IM and Noha.
 * Shared components read these configs so both pages render identically
 * with different data, colors, labels and field mappings.
 */
import {
  PLANO_STATUS, PLANO_STATUS_COLORS, PLANO_PRIORIDADE_CONFIG, PLANO_PRIORIDADES,
  NOHA_STATUS, NOHA_STATUS_COLORS, NOHA_PRIORIDADE_CORES, NOHA_PRIORIDADES,
  DONOS_PLANO, DONOS_NOHA
} from './constants'

export const PLANO_CONFIG = {
  id: 'plano',
  accent: '#4ecdc4',
  accentRgb: '78,205,196',
  title: 'Plano Intermarine',
  subtitle: 'Gestão Estratégica',
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

export const NOHA_CONFIG = {
  id: 'noha',
  accent: '#8b5cf6',
  accentRgb: '139,92,246',
  title: 'Ações da Noha',
  subtitle: 'Gestão Operacional',
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
