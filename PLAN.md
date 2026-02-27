# PLANO: Transformar App em Plataforma de Gestão Multi-Cliente Noha

## Resumo
Transformar o app de 3 workspaces hardcoded (Plano/Casa/MKT) em uma plataforma de gestão de agência com workspaces dinâmicos por cliente, dashboard Noha agregado, e gestão de usuários.

---

## FASE 1: Banco de Dados Unificado (SQL no Supabase)

### Novas tabelas:

**workspaces** — Registro dinâmico de workspaces
- id (UUID), name, slug (unique), accent_color, accent_rgb, icon
- parent_id (UUID nullable → sub-workspaces)
- statuses (jsonb), status_colors (jsonb), priorities (jsonb), priority_colors (jsonb)
- item_label, done_status, in_progress_status, default_status, default_priority
- created_by, created_at, ordem

**tasks** — Tabela unificada de tarefas (substitui acoes_intermarine, tarefas_noha, tarefas_casa)
- id, workspace_id (FK), titulo, frente, descricao, prioridade, dono, status, deadline, progresso
- created_by, created_at

**comments** — Comentários unificados (substitui comentarios_acoes, comentarios_tarefas, comentarios_casa)
- id, task_id (FK), texto, autor, auto, created_at

**frentes** — Frentes unificadas (substitui frentes_intermarine, frentes_noha, frentes_casa)
- id, workspace_id (FK), nome, cor, ordem, ativo

**donos** — Donos dinâmicos por workspace
- id, workspace_id (FK), nome

**user_workspace_access** — Controle de acesso por workspace
- id, user_id (FK auth.users), workspace_id (FK → workspace pai/cliente)

**profiles update** — Adicionar campo `is_superadmin` (boolean, default false)

### Migração de dados existentes:
1. Criar workspace pai "Intermarine"
2. Criar 3 sub-workspaces: "Estratégia 2026 IM", "Casa Intermarine", "Atividades Gerais de MKT"
3. Migrar acoes_intermarine → tasks (campo `acao` → `titulo`)
4. Migrar tarefas_casa → tasks
5. Migrar tarefas_noha → tasks
6. Migrar todas as frentes_* → frentes
7. Migrar todos os comentarios_* → comments
8. Manter tabelas antigas intactas (segurança)
9. Marcar email atual como is_superadmin = true

---

## FASE 2: Hooks Genéricos (substituem useAcoes, useTarefas, useTarefasCasa, useFrentes)

**useWorkspaces()** — CRUD de workspaces
- Busca todos workspaces, agrupa por parent_id
- addWorkspace(), updateWorkspace(), deleteWorkspace()
- Realtime subscription

**useTasks(workspaceId)** — Hook genérico para qualquer workspace
- Substitui useAcoes, useTarefas, useTarefasCasa
- Busca tasks + comments por workspace_id
- CRUD + comentários + realtime
- Campo unificado: sempre `titulo`

**useAllTasks(workspaceIds)** — Para dashboard Noha
- Busca tasks de TODOS os workspaces (ou filtrados)
- Inclui workspace_id em cada task pra filtro

**useFrentesForWorkspace(workspaceId)** — Frentes de um workspace
- Substitui useFrentes hardcoded
- addFrente, refetch

**useDonos(workspaceId)** — Donos dinâmicos
- Busca da tabela donos + extrai únicos das tasks existentes
- addDono()

---

## FASE 3: Componentes Novos + Atualizados

### Novo: DonoSelect.jsx
- Mesmo padrão do FrenteSelect (select + botão "+")
- Salva novo dono na tabela `donos` do workspace

### Novo: WorkspaceWizard.jsx
- Modal multi-step para criar workspace:
  - Step 1: Nome do cliente + cor accent (paleta pré-definida)
  - Step 2: Frentes (mínimo 3 obrigatórias + botão "+" para mais)
  - Step 3: Confirmar → cria workspace + frentes no Supabase
- Também permite criar sub-workspace dentro de um cliente existente

### Novo: WorkspacePage.jsx (genérico)
- Substitui Plano.jsx, Casa.jsx, Noha.jsx (as 3 viram 1)
- Recebe workspace config do banco, não mais hardcoded
- Usa useTasks(workspaceId) + useFrentesForWorkspace + useDonos
- Mesmo layout: PageHeader, FilterBar, Dashboard/Kanban/Lista, modais

### Novo: NohaDashboard.jsx
- Dashboard agregado com TODAS as tasks de TODOS os workspaces
- Filtro adicional: por workspace/cliente
- 3 views: Dashboard (métricas globais), Kanban, Lista
- Cada card mostra de qual workspace/cliente veio

### Atualizado: Nav.jsx → WorkspaceNav.jsx
- Tabs dinâmicas carregadas do banco
- Primeiro: "Noha" (dashboard global, ícone especial)
- Depois: cada cliente como tab (workspaces sem parent_id)
- Último: "+" para criar novo workspace + "Config"
- Quando cliente tem sub-workspaces: tabs secundárias abaixo (como ViewSwitcher)
- Quando cliente é simples: vai direto pro workspace

### Atualizado: App.jsx
- Routing dinâmico baseado em workspaces do banco
- Se workspace selecionado tem sub-workspaces → mostra SubWorkspaceTabs
- Se é simples → mostra WorkspacePage direto
- Se é 'noha' → mostra NohaDashboard

### Atualizado: DetailModal.jsx + NewItemModal.jsx
- Dono: trocar input por DonoSelect (com botão "+")
- Tudo resto se mantém igual

### Atualizado: Settings.jsx
- Adicionar seção "Gerenciar Usuários" (só superadmin vê)
- Criar login (email + senha + nome)
- Atribuir workspace(s) que o usuário pode acessar
- Listar usuários existentes

### Atualizado: AuthContext.jsx
- Carregar profile.is_superadmin do banco
- Carregar user_workspace_access para saber quais workspaces o user vê
- Superadmin vê tudo, user normal vê só seus workspaces atribuídos

---

## FASE 4: Preservar dados Intermarine

- Os 3 sub-workspaces de Intermarine são criados com as MESMAS configs de hoje:
  - Estratégia 2026: accent #4ecdc4, statuses ['Não Iniciado','Em Andamento','Concluído','Pausado'], prioridades especiais
  - Casa: accent #d4a574, statuses ['Pendente','Em Andamento','Finalizado','Em Espera']
  - MKT: accent #8b5cf6, statuses ['A Fazer','Em Progresso','Em Revisão','Concluído']
- Donos existentes migrados para tabela donos
- Todas as tasks, comments, frentes migradas com IDs preservados

---

## Ordem de execução (otimizada):

1. **SQL**: Criar tabelas novas + migrar dados (user roda no Supabase)
2. **Hooks**: useWorkspaces, useTasks, useFrentesForWorkspace, useDonos, useAllTasks
3. **DonoSelect**: Componente reutilizável
4. **WorkspacePage**: Página genérica (substitui as 3)
5. **WorkspaceNav**: Nav dinâmica
6. **App.jsx**: Routing dinâmico + sub-workspace tabs
7. **NohaDashboard**: Dashboard agregado
8. **WorkspaceWizard**: Criar novos workspaces
9. **Settings + Auth**: User management + acesso por workspace
10. **Teste + commit**

---

## Arquivos que serão REMOVIDOS após migração:
- src/pages/Plano.jsx (substituído por WorkspacePage genérico)
- src/pages/Casa.jsx
- src/pages/Noha.jsx (substituído por NohaDashboard)
- src/lib/workspace-config.js (configs vêm do banco)
- src/lib/constants.js (simplificado — só helpers ficam)

## Arquivos NOVOS:
- src/hooks/useWorkspaces.js
- src/hooks/useTasks.js
- src/hooks/useDonos.js
- src/components/workspace/DonoSelect.jsx
- src/components/workspace/WorkspaceWizard.jsx
- src/components/WorkspaceNav.jsx
- src/pages/WorkspacePage.jsx
- src/pages/NohaDashboard.jsx
