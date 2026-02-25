-- ============================================
-- INTERMARINE & NOHA - Database Schema
-- Rode este SQL no Supabase SQL Editor
-- ============================================

-- 1. Tabela de perfis (vinculada ao auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Frentes do Plano Intermarine (objetivos/temáticas)
CREATE TABLE IF NOT EXISTS frentes_intermarine (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  cor TEXT NOT NULL DEFAULT '#4da8da',
  ordem INT DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir frentes padrão
INSERT INTO frentes_intermarine (nome, cor, ordem) VALUES
  ('Marketing Barcos', '#4da8da', 1),
  ('Novos Clientes', '#818cf8', 2),
  ('Preparação Vendedores', '#c4a35a', 3),
  ('Brokers', '#4ecdc4', 4),
  ('Marinheiros', '#3d7cf5', 5),
  ('Parcerias', '#e056a0', 6),
  ('Credibilidade Intermarine', '#f0a35e', 7),
  ('Aproximação com Clientes', '#e74c5e', 8),
  ('Marketing & Comercial', '#4ecdc4', 9),
  ('Oceane', '#6366f1', 10)
ON CONFLICT (nome) DO NOTHING;

-- 3. Ações do Plano Intermarine
CREATE TABLE IF NOT EXISTS acoes_intermarine (
  id SERIAL PRIMARY KEY,
  acao TEXT NOT NULL,
  frente TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  prioridade TEXT NOT NULL DEFAULT 'Quick Win' CHECK (prioridade IN ('Quick Win', 'Ação Tática', 'Projeto Estratégico', 'Quick Win / Projeto Estratégico', 'Ação Tática / Quick Win')),
  dono TEXT NOT NULL DEFAULT 'A definir',
  status TEXT NOT NULL DEFAULT 'Não Iniciado' CHECK (status IN ('Não Iniciado', 'Em Andamento', 'Concluído', 'Pausado')),
  deadline DATE,
  progresso INT DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Comentários das ações Intermarine
CREATE TABLE IF NOT EXISTS comentarios_acoes (
  id SERIAL PRIMARY KEY,
  acao_id INT NOT NULL REFERENCES acoes_intermarine(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  autor TEXT,
  auto BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Frentes da Noha
CREATE TABLE IF NOT EXISTS frentes_noha (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  cor TEXT NOT NULL DEFAULT '#2563eb',
  ordem INT DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO frentes_noha (nome, cor, ordem) VALUES
  ('IA para 3D', '#8b5cf6', 1),
  ('Campanhas', '#2563eb', 2),
  ('Gestão Estratégica', '#059669', 3),
  ('Anúncios', '#d97706', 4),
  ('Oceane', '#6366f1', 5),
  ('Imprensa', '#ec4899', 6)
ON CONFLICT (nome) DO NOTHING;

-- 6. Tarefas da Noha (com campo objetivo_intermarine para conexão)
CREATE TABLE IF NOT EXISTS tarefas_noha (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  frente TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  prioridade TEXT NOT NULL DEFAULT 'Média' CHECK (prioridade IN ('Baixa', 'Média', 'Alta', 'Urgente')),
  dono TEXT NOT NULL DEFAULT 'A definir',
  status TEXT NOT NULL DEFAULT 'A Fazer' CHECK (status IN ('A Fazer', 'Em Progresso', 'Em Revisão', 'Concluído')),
  deadline DATE,
  progresso INT DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  objetivo_intermarine TEXT DEFAULT NULL,  -- Conecta à frente/objetivo do plano Intermarine
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Comentários das tarefas Noha
CREATE TABLE IF NOT EXISTS comentarios_tarefas (
  id SERIAL PRIMARY KEY,
  tarefa_id INT NOT NULL REFERENCES tarefas_noha(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  autor TEXT,
  auto BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Inserir ações padrão do plano Intermarine
INSERT INTO acoes_intermarine (acao, frente, descricao, prioridade, dono, status) VALUES
  ('Template para Barcos', 'Marketing Barcos', 'Criar um padrão de template para comparativo de barcos com a Arquitetura', 'Quick Win', 'Noha', 'Não Iniciado'),
  ('Repositório Digital de Embarcações', 'Marketing Barcos', 'Repositório digital de fácil consulta com cada embarcação e seus materiais', 'Quick Win', 'Noha / Bruno', 'Não Iniciado'),
  ('Experiência Exclusiva IM', 'Novos Clientes', 'Locação de barcos parados para experiências exclusivas', 'Projeto Estratégico', 'Comercial / Marketing', 'Não Iniciado'),
  ('CRM Casa Intermarine', 'Novos Clientes', 'Casa Intermarine: Cadastrar clientes + CRM', 'Ação Tática', 'Felipe Antunes', 'Não Iniciado'),
  ('Conexão Assistência & Comercial', 'Novos Clientes', 'Conectar Assistência Técnica com a área comercial', 'Quick Win', 'Felipe Antunes', 'Não Iniciado'),
  ('Impulsionamento Oceane', 'Novos Clientes', 'Campanha de Captação de lead pela Oceane via Tráfego Pago', 'Quick Win', 'Noha e Felipe Antunes', 'Não Iniciado'),
  ('Acompanhamento com Vendedores', 'Preparação Vendedores', 'Dinâmica de acompanhamento com os vendedores', 'Quick Win', 'Felipe Antunes', 'Não Iniciado'),
  ('Treinamentos Periódicos', 'Preparação Vendedores', 'Treinamentos específicos ao longo do ano', 'Projeto Estratégico', 'Felipe Antunes', 'Não Iniciado'),
  ('Conteúdos para Vendedores', 'Preparação Vendedores', 'Vídeos orgânicos da fábrica para vendedores', 'Quick Win', 'Noha', 'Não Iniciado'),
  ('CRM Intermarine', 'Preparação Vendedores', 'Organizar a base de CRM como suporte para o time comercial', 'Projeto Estratégico', 'Felipe Antunes', 'Não Iniciado'),
  ('Playbook de Divulgação', 'Preparação Vendedores', 'Playbook de como os vendedores devem divulgar os barcos', 'Quick Win', 'Noha', 'Não Iniciado'),
  ('Brokers & Intermarine', 'Brokers', 'Canal aberto com os brokers para vender Intermarine', 'Projeto Estratégico', 'Felipe Antunes', 'Não Iniciado'),
  ('Bom Marinheiro', 'Marinheiros', 'Participar ativamente do programa Bom Marinheiro', 'Ação Tática', 'Marketing', 'Não Iniciado'),
  ('Parcerias Luxo', 'Parcerias', 'Fechar parcerias com marcas de luxo para eventos', 'Projeto Estratégico', 'Comercial / Marketing', 'Não Iniciado'),
  ('Depoimentos Reais', 'Credibilidade Intermarine', 'Coletar depoimentos de clientes e parceiros', 'Quick Win', 'Noha', 'Não Iniciado'),
  ('Eventos para Clientes', 'Aproximação com Clientes', 'Organizar eventos exclusivos para a base de clientes', 'Projeto Estratégico', 'Comercial / Marketing', 'Não Iniciado'),
  ('Redes Sociais IM', 'Marketing & Comercial', 'Planejamento e calendário de redes sociais Intermarine', 'Ação Tática', 'Noha', 'Não Iniciado'),
  ('Branding Oceane', 'Oceane', 'Revisão da identidade visual e posicionamento Oceane', 'Projeto Estratégico', 'Noha', 'Não Iniciado')
ON CONFLICT DO NOTHING;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE frentes_intermarine ENABLE ROW LEVEL SECURITY;
ALTER TABLE acoes_intermarine ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios_acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE frentes_noha ENABLE ROW LEVEL SECURITY;
ALTER TABLE tarefas_noha ENABLE ROW LEVEL SECURITY;
ALTER TABLE comentarios_tarefas ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Profiles visíveis para usuários autenticados"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem inserir próprio perfil"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Políticas para frentes_intermarine (leitura para todos autenticados)
CREATE POLICY "Frentes Intermarine visíveis para autenticados"
  ON frentes_intermarine FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar frentes Intermarine"
  ON frentes_intermarine FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para acoes_intermarine
CREATE POLICY "Ações visíveis para autenticados"
  ON acoes_intermarine FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Autenticados podem inserir ações"
  ON acoes_intermarine FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Autenticados podem atualizar ações"
  ON acoes_intermarine FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Autenticados podem deletar ações"
  ON acoes_intermarine FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para comentários de ações
CREATE POLICY "Comentários de ações visíveis para autenticados"
  ON comentarios_acoes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Autenticados podem inserir comentários em ações"
  ON comentarios_acoes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Políticas para frentes_noha
CREATE POLICY "Frentes Noha visíveis para autenticados"
  ON frentes_noha FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar frentes Noha"
  ON frentes_noha FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Políticas para tarefas_noha
CREATE POLICY "Tarefas Noha visíveis para autenticados"
  ON tarefas_noha FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Autenticados podem inserir tarefas Noha"
  ON tarefas_noha FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Autenticados podem atualizar tarefas Noha"
  ON tarefas_noha FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Autenticados podem deletar tarefas Noha"
  ON tarefas_noha FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para comentários de tarefas
CREATE POLICY "Comentários de tarefas visíveis para autenticados"
  ON comentarios_tarefas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Autenticados podem inserir comentários em tarefas"
  ON comentarios_tarefas FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- FUNÇÕES E TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_acoes_updated_at
  BEFORE UPDATE ON acoes_intermarine
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tarefas_updated_at
  BEFORE UPDATE ON tarefas_noha
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Função para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
