-- ═══════════════════════════════════════════════════════════════
-- MIGRAÇÃO 002: Schema Unificado — Plataforma Multi-Cliente Noha
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. TABELA WORKSPACES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  accent_color TEXT NOT NULL DEFAULT '#8b5cf6',
  accent_rgb TEXT NOT NULL DEFAULT '139,92,246',
  icon TEXT DEFAULT 'briefcase',
  parent_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  statuses JSONB NOT NULL DEFAULT '["Pendente","Em Andamento","Finalizado","Em Espera"]',
  status_colors JSONB NOT NULL DEFAULT '{}',
  priorities JSONB NOT NULL DEFAULT '["Baixa","Média","Alta","Urgente"]',
  priority_colors JSONB NOT NULL DEFAULT '{}',
  item_label TEXT NOT NULL DEFAULT 'Tarefa',
  done_status TEXT NOT NULL DEFAULT 'Finalizado',
  in_progress_status TEXT NOT NULL DEFAULT 'Em Andamento',
  default_status TEXT NOT NULL DEFAULT 'Pendente',
  default_priority TEXT NOT NULL DEFAULT 'Média',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  ordem INT DEFAULT 0
);

-- ─── 2. TABELA TASKS (UNIFICADA) ──────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  frente TEXT DEFAULT '',
  descricao TEXT DEFAULT '',
  prioridade TEXT DEFAULT 'Média',
  dono TEXT DEFAULT '',
  status TEXT DEFAULT 'Pendente',
  deadline DATE,
  progresso INT DEFAULT 0,
  objetivo_intermarine TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tasks_workspace ON tasks(workspace_id);

-- ─── 3. TABELA COMMENTS (UNIFICADA) ───────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  autor TEXT DEFAULT 'Sistema',
  auto BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_task ON comments(task_id);

-- ─── 4. TABELA FRENTES (UNIFICADA) ────────────────────────────
CREATE TABLE IF NOT EXISTS frentes (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cor TEXT DEFAULT '#c8c0af',
  ordem INT DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_frentes_workspace ON frentes(workspace_id);

-- ─── 5. TABELA DONOS (DINÂMICOS POR WORKSPACE) ────────────────
CREATE TABLE IF NOT EXISTS donos (
  id BIGSERIAL PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(workspace_id, nome)
);

-- ─── 6. TABELA USER_WORKSPACE_ACCESS ──────────────────────────
CREATE TABLE IF NOT EXISTS user_workspace_access (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, workspace_id)
);

-- ─── 7. ATUALIZAR PROFILES ────────────────────────────────────
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_superadmin BOOLEAN DEFAULT false;

-- ═══════════════════════════════════════════════════════════════
-- MIGRAÇÃO DE DADOS EXISTENTES
-- ═══════════════════════════════════════════════════════════════

-- ─── 8. CRIAR WORKSPACE PAI: INTERMARINE ──────────────────────
INSERT INTO workspaces (id, name, slug, accent_color, accent_rgb, icon, parent_id, statuses, status_colors, priorities, priority_colors, item_label, done_status, in_progress_status, default_status, default_priority, ordem)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Intermarine',
  'intermarine',
  '#4ecdc4',
  '78,205,196',
  'ship',
  NULL,
  '["Pendente","Em Andamento","Finalizado","Em Espera"]',
  '{}',
  '["Baixa","Média","Alta","Urgente"]',
  '{}',
  'Tarefa',
  'Finalizado',
  'Em Andamento',
  'Pendente',
  'Média',
  1
);

-- ─── 9. SUB-WORKSPACE: Estratégia 2026 IM ─────────────────────
INSERT INTO workspaces (id, name, slug, accent_color, accent_rgb, icon, parent_id, statuses, status_colors, priorities, priority_colors, item_label, done_status, in_progress_status, default_status, default_priority, ordem)
VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'Estratégia 2026 IM',
  'intermarine-estrategia',
  '#4ecdc4',
  '78,205,196',
  'target',
  'a0000000-0000-0000-0000-000000000001',
  '["Não Iniciado","Em Andamento","Concluído","Pausado"]',
  '{"Não Iniciado":{"c":"#a0926d","bg":"rgba(160,146,109,0.08)","b":"rgba(160,146,109,0.2)"},"Em Andamento":{"c":"#4ecdc4","bg":"rgba(78,205,196,0.08)","b":"rgba(78,205,196,0.2)"},"Concluído":{"c":"#7eb89c","bg":"rgba(126,184,156,0.08)","b":"rgba(126,184,156,0.2)"},"Pausado":{"c":"#c8c0af","bg":"rgba(200,192,175,0.08)","b":"rgba(200,192,175,0.2)"}}',
  '["Quick Win","Ação Tática","Projeto Estratégico","Quick Win / Projeto Estratégico","Ação Tática / Quick Win"]',
  '{"Quick Win":"#4ecdc4","Ação Tática":"#f6a623","Projeto Estratégico":"#e74c5e","Quick Win / Projeto Estratégico":"#9b59b6","Ação Tática / Quick Win":"#3498db"}',
  'Ação',
  'Concluído',
  'Em Andamento',
  'Não Iniciado',
  'Quick Win',
  1
);

-- ─── 10. SUB-WORKSPACE: Casa Intermarine ──────────────────────
INSERT INTO workspaces (id, name, slug, accent_color, accent_rgb, icon, parent_id, statuses, status_colors, priorities, priority_colors, item_label, done_status, in_progress_status, default_status, default_priority, ordem)
VALUES (
  'b0000000-0000-0000-0000-000000000002',
  'Casa Intermarine',
  'intermarine-casa',
  '#d4a574',
  '212,165,116',
  'home',
  'a0000000-0000-0000-0000-000000000001',
  '["Pendente","Em Andamento","Finalizado","Em Espera"]',
  '{"Pendente":{"c":"#a0926d","bg":"rgba(160,146,109,0.08)","b":"rgba(160,146,109,0.2)"},"Em Andamento":{"c":"#d4a574","bg":"rgba(212,165,116,0.08)","b":"rgba(212,165,116,0.2)"},"Finalizado":{"c":"#7eb89c","bg":"rgba(126,184,156,0.08)","b":"rgba(126,184,156,0.2)"},"Em Espera":{"c":"#c8c0af","bg":"rgba(200,192,175,0.08)","b":"rgba(200,192,175,0.2)"}}',
  '["Baixa","Média","Alta","Urgente"]',
  '{"Baixa":"#7eb89c","Média":"#d4a574","Alta":"#e6a847","Urgente":"#e74c5e"}',
  'Tarefa',
  'Finalizado',
  'Em Andamento',
  'Pendente',
  'Média',
  2
);

-- ─── 11. SUB-WORKSPACE: Atividades Gerais de MKT ──────────────
INSERT INTO workspaces (id, name, slug, accent_color, accent_rgb, icon, parent_id, statuses, status_colors, priorities, priority_colors, item_label, done_status, in_progress_status, default_status, default_priority, ordem)
VALUES (
  'b0000000-0000-0000-0000-000000000003',
  'Atividades Gerais de MKT',
  'intermarine-mkt',
  '#8b5cf6',
  '139,92,246',
  'megaphone',
  'a0000000-0000-0000-0000-000000000001',
  '["A Fazer","Em Progresso","Em Revisão","Concluído"]',
  '{"A Fazer":{"c":"#a0926d","bg":"rgba(160,146,109,0.08)","b":"rgba(160,146,109,0.2)"},"Em Progresso":{"c":"#8b5cf6","bg":"rgba(139,92,246,0.08)","b":"rgba(139,92,246,0.2)"},"Em Revisão":{"c":"#f6a623","bg":"rgba(246,166,35,0.08)","b":"rgba(246,166,35,0.2)"},"Concluído":{"c":"#7eb89c","bg":"rgba(126,184,156,0.08)","b":"rgba(126,184,156,0.2)"}}',
  '["Baixa","Média","Alta","Urgente"]',
  '{"Baixa":"#7eb89c","Média":"#8b5cf6","Alta":"#e6a847","Urgente":"#e74c5e"}',
  'Tarefa',
  'Concluído',
  'Em Progresso',
  'A Fazer',
  'Média',
  3
);

-- ─── 12. MIGRAR TASKS ─────────────────────────────────────────

-- Estratégia 2026 (acoes_intermarine → tasks)
INSERT INTO tasks (workspace_id, titulo, frente, descricao, prioridade, dono, status, deadline, progresso, created_by, created_at)
SELECT
  'b0000000-0000-0000-0000-000000000001',
  acao,
  COALESCE(frente, ''),
  COALESCE(descricao, ''),
  COALESCE(prioridade, 'Quick Win'),
  COALESCE(dono, ''),
  COALESCE(status, 'Não Iniciado'),
  deadline,
  COALESCE(progresso, 0),
  created_by,
  COALESCE(created_at, now())
FROM acoes_intermarine;

-- Casa Intermarine (tarefas_casa → tasks)
INSERT INTO tasks (workspace_id, titulo, frente, descricao, prioridade, dono, status, deadline, progresso, created_at)
SELECT
  'b0000000-0000-0000-0000-000000000002',
  titulo,
  COALESCE(frente, ''),
  COALESCE(descricao, ''),
  COALESCE(prioridade, 'Média'),
  COALESCE(dono, ''),
  COALESCE(status, 'Pendente'),
  deadline,
  COALESCE(progresso, 0),
  COALESCE(created_at, now())
FROM tarefas_casa;

-- MKT / Noha (tarefas_noha → tasks)
INSERT INTO tasks (workspace_id, titulo, frente, descricao, prioridade, dono, status, deadline, progresso, objetivo_intermarine, created_by, created_at)
SELECT
  'b0000000-0000-0000-0000-000000000003',
  titulo,
  COALESCE(frente, ''),
  COALESCE(descricao, ''),
  COALESCE(prioridade, 'Média'),
  COALESCE(dono, ''),
  COALESCE(status, 'A Fazer'),
  deadline,
  COALESCE(progresso, 0),
  objetivo_intermarine,
  created_by,
  COALESCE(created_at, now())
FROM tarefas_noha;

-- ─── 13. MIGRAR COMMENTS ──────────────────────────────────────

-- Para mapear IDs antigos → novos, usamos a ordem de inserção.
-- Estratégia: comments de acoes_intermarine
INSERT INTO comments (task_id, texto, autor, auto, created_at)
SELECT
  t.id,
  c.texto,
  COALESCE(c.autor, 'Sistema'),
  COALESCE(c.auto, false),
  COALESCE(c.created_at, now())
FROM comentarios_acoes c
JOIN acoes_intermarine a ON c.acao_id = a.id
JOIN tasks t ON t.titulo = a.acao AND t.workspace_id = 'b0000000-0000-0000-0000-000000000001';

-- Casa comments
INSERT INTO comments (task_id, texto, autor, auto, created_at)
SELECT
  t.id,
  c.texto,
  COALESCE(c.autor, 'Sistema'),
  COALESCE(c.auto, false),
  COALESCE(c.created_at, now())
FROM comentarios_casa c
JOIN tarefas_casa tc ON c.tarefa_id = tc.id
JOIN tasks t ON t.titulo = tc.titulo AND t.workspace_id = 'b0000000-0000-0000-0000-000000000002';

-- MKT comments
INSERT INTO comments (task_id, texto, autor, auto, created_at)
SELECT
  t.id,
  c.texto,
  COALESCE(c.autor, 'Sistema'),
  COALESCE(c.auto, false),
  COALESCE(c.created_at, now())
FROM comentarios_tarefas c
JOIN tarefas_noha tn ON c.tarefa_id = tn.id
JOIN tasks t ON t.titulo = tn.titulo AND t.workspace_id = 'b0000000-0000-0000-0000-000000000003';

-- ─── 14. MIGRAR FRENTES ───────────────────────────────────────

INSERT INTO frentes (workspace_id, nome, cor, ordem, ativo)
SELECT 'b0000000-0000-0000-0000-000000000001', nome, cor, ordem, ativo
FROM frentes_intermarine;

INSERT INTO frentes (workspace_id, nome, cor, ordem, ativo)
SELECT 'b0000000-0000-0000-0000-000000000002', nome, cor, ordem, ativo
FROM frentes_casa;

INSERT INTO frentes (workspace_id, nome, cor, ordem, ativo)
SELECT 'b0000000-0000-0000-0000-000000000003', nome, cor, ordem, ativo
FROM frentes_noha;

-- ─── 15. MIGRAR DONOS ─────────────────────────────────────────

-- Estratégia donos
INSERT INTO donos (workspace_id, nome) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Noha'),
  ('b0000000-0000-0000-0000-000000000001', 'Bruno'),
  ('b0000000-0000-0000-0000-000000000001', 'Felipe Antunes'),
  ('b0000000-0000-0000-0000-000000000001', 'Comercial / Marketing'),
  ('b0000000-0000-0000-0000-000000000001', 'A definir')
ON CONFLICT DO NOTHING;

-- Casa donos
INSERT INTO donos (workspace_id, nome) VALUES
  ('b0000000-0000-0000-0000-000000000002', 'Rodrigo'),
  ('b0000000-0000-0000-0000-000000000002', 'Equipe Casa')
ON CONFLICT DO NOTHING;

-- MKT donos
INSERT INTO donos (workspace_id, nome) VALUES
  ('b0000000-0000-0000-0000-000000000003', 'Rodrigo'),
  ('b0000000-0000-0000-0000-000000000003', 'Fernando')
ON CONFLICT DO NOTHING;

-- ─── 16. MARCAR SUPERADMIN ────────────────────────────────────

UPDATE profiles SET is_superadmin = true WHERE email = 'contato@nohaoficial.com.br';

-- ─── 17. RLS POLICIES ─────────────────────────────────────────

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE frentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE donos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workspace_access ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "workspaces_all" ON workspaces FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "tasks_all" ON tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "comments_all" ON comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "frentes_all" ON frentes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "donos_all" ON donos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "access_all" ON user_workspace_access FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Anon policies (for anon key usage)
CREATE POLICY "workspaces_anon" ON workspaces FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "tasks_anon" ON tasks FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "comments_anon" ON comments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "frentes_anon" ON frentes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "donos_anon" ON donos FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "access_anon" ON user_workspace_access FOR ALL TO anon USING (true) WITH CHECK (true);

-- ─── 18. REALTIME ─────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE workspaces;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE frentes;
ALTER PUBLICATION supabase_realtime ADD TABLE donos;
