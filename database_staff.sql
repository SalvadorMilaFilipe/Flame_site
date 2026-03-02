-- ========================================================
-- F.L.A.M.E – Extensão: Portal de Agentes / Staff
-- Executar DEPOIS do schema principal (database.sql)
-- ========================================================

-- 1. NOVOS TIPOS ENUMERADOS
-- ========================================================

CREATE TYPE department_type AS ENUM (
  'field_agents',     -- Agentes de Campo
  'it',               -- Departamento de TI
  'legal',            -- Apoio Legal
  'social',           -- Apoio Social
  'recruitment'       -- Recrutamento
);

CREATE TYPE staff_role AS ENUM (
  -- Campo
  'field_agent',
  'field_coordinator',
  -- TI
  'mobile_dev',
  'cybersecurity',
  'data_analyst',
  -- Legal
  'immigration_lawyer',
  'human_rights_lawyer',
  'legal_assistant',
  -- Social
  'psychologist',
  'translator',
  'social_worker',
  -- Recrutamento
  'recruiter',
  'hr_manager'
);

CREATE TYPE task_status     AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
CREATE TYPE task_priority   AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE shift_status    AS ENUM ('scheduled', 'active', 'completed', 'missed');
CREATE TYPE candidate_status AS ENUM ('applied', 'screening', 'interview', 'offered', 'hired', 'rejected');
CREATE TYPE session_type    AS ENUM ('psychological', 'translation', 'legal_consultation');
CREATE TYPE ticket_status   AS ENUM ('open', 'investigating', 'resolved', 'escalated');

-- 2. TABELA DE STAFF (colaboradores FLAME)
-- ========================================================

CREATE TABLE staff_profiles (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID    REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  department      department_type NOT NULL,
  staff_role      staff_role      NOT NULL,
  employee_id     TEXT    UNIQUE,                    -- Código de funcionário (ex: FLD-001)
  is_immigrant    BOOLEAN DEFAULT FALSE,             -- Flag: ex-imigrante (empatia real)
  languages       TEXT[]  DEFAULT ARRAY['pt'],        -- Idiomas falados
  specializations TEXT[],                             -- Especializações
  is_active       BOOLEAN DEFAULT TRUE,
  hired_at        DATE    DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AGENTES DE CAMPO – Turnos e Dispatches
-- ========================================================

-- Turnos/plantões dos agentes de campo
CREATE TABLE field_shifts (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id        UUID    REFERENCES staff_profiles(id) ON DELETE CASCADE NOT NULL,
  shift_date      DATE    NOT NULL,
  start_time      TIME    NOT NULL,
  end_time        TIME    NOT NULL,
  region          TEXT,                               -- Zona geográfica atribuída
  status          shift_status DEFAULT 'scheduled',
  check_in_at     TIMESTAMPTZ,
  check_out_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Dispatches: atribuição de agentes a emergências
CREATE TABLE field_dispatches (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  alert_id        UUID    REFERENCES emergency_alerts(id) ON DELETE CASCADE NOT NULL,
  agent_id        UUID    REFERENCES staff_profiles(id) NOT NULL,
  status          task_status DEFAULT 'open',
  dispatched_at   TIMESTAMPTZ DEFAULT NOW(),
  arrived_at      TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  report          TEXT,                               -- Relatório do agente
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DEPARTAMENTO TI – Tickets e Métricas de Segurança
-- ========================================================

CREATE TABLE security_tickets (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  reported_by     UUID    REFERENCES staff_profiles(id),
  assigned_to     UUID    REFERENCES staff_profiles(id),
  title           TEXT    NOT NULL,
  description     TEXT,
  severity        task_priority DEFAULT 'medium',
  status          ticket_status DEFAULT 'open',
  category        TEXT,       -- ex: 'vulnerability', 'data_breach', 'system_failure'
  resolution      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

-- Métricas de sistema (dados injetados por jobs)
CREATE TABLE system_metrics (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  metric_name     TEXT    NOT NULL,           -- ex: 'cpu_usage', 'active_users', 'vault_encrypt_ops'
  metric_value    DECIMAL NOT NULL,
  unit            TEXT,                       -- ex: '%', 'count', 'ms'
  recorded_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 5. APOIO LEGAL – Notas Jurídicas e Consultas
-- ========================================================

CREATE TABLE legal_notes (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id         UUID    REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  lawyer_id       UUID    REFERENCES staff_profiles(id) NOT NULL,
  title           TEXT    NOT NULL,
  content         TEXT,                                -- Notas internas (não visíveis ao migrante)
  is_confidential BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE legal_consultations (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id         UUID    REFERENCES cases(id),
  client_id       UUID    REFERENCES profiles(id) NOT NULL,
  lawyer_id       UUID    REFERENCES staff_profiles(id) NOT NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_mins   INT     DEFAULT 30,
  session_type    session_type DEFAULT 'legal_consultation',
  status          task_status DEFAULT 'open',
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 6. APOIO SOCIAL – Sessões e Pedidos de Tradução
-- ========================================================

CREATE TABLE support_sessions (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  client_id       UUID    REFERENCES profiles(id) NOT NULL,
  staff_id        UUID    REFERENCES staff_profiles(id) NOT NULL,
  session_type    session_type NOT NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  duration_mins   INT     DEFAULT 45,
  status          task_status DEFAULT 'open',
  source_lang     TEXT,
  target_lang     TEXT,
  notes           TEXT,
  wellbeing_score INT     CHECK (wellbeing_score BETWEEN 1 AND 10),  -- Escala de bem-estar
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 7. RECRUTAMENTO – Vagas e Candidatos
-- ========================================================

CREATE TABLE job_postings (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  title           TEXT    NOT NULL,
  department      department_type NOT NULL,
  role            staff_role NOT NULL,
  description     TEXT,
  requirements    TEXT[],
  prefer_immigrant BOOLEAN DEFAULT TRUE,     -- Preferência por ex-imigrantes
  is_open         BOOLEAN DEFAULT TRUE,
  location        TEXT,
  created_by      UUID    REFERENCES staff_profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  closed_at       TIMESTAMPTZ
);

CREATE TABLE candidates (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  job_id          UUID    REFERENCES job_postings(id) ON DELETE CASCADE NOT NULL,
  full_name       TEXT    NOT NULL,
  email           TEXT    NOT NULL,
  phone           TEXT,
  nationality     TEXT,
  is_immigrant    BOOLEAN DEFAULT FALSE,
  languages       TEXT[]  DEFAULT ARRAY['pt'],
  resume_url      TEXT,                       -- Ficheiro no Storage
  status          candidate_status DEFAULT 'applied',
  notes           TEXT,
  interview_date  TIMESTAMPTZ,
  reviewed_by     UUID    REFERENCES staff_profiles(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 8. TAREFAS INTERNAS (cross-department)
-- ========================================================

CREATE TABLE staff_tasks (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  assigned_to     UUID    REFERENCES staff_profiles(id) NOT NULL,
  assigned_by     UUID    REFERENCES staff_profiles(id),
  department      department_type NOT NULL,
  title           TEXT    NOT NULL,
  description     TEXT,
  priority        task_priority DEFAULT 'medium',
  status          task_status   DEFAULT 'open',
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ÍNDICES
-- ========================================================

CREATE INDEX idx_staff_department    ON staff_profiles(department);
CREATE INDEX idx_staff_role          ON staff_profiles(staff_role);
CREATE INDEX idx_staff_user          ON staff_profiles(user_id);
CREATE INDEX idx_shifts_agent        ON field_shifts(agent_id);
CREATE INDEX idx_shifts_date         ON field_shifts(shift_date);
CREATE INDEX idx_dispatches_alert    ON field_dispatches(alert_id);
CREATE INDEX idx_dispatches_agent    ON field_dispatches(agent_id);
CREATE INDEX idx_sec_tickets_status  ON security_tickets(status);
CREATE INDEX idx_legal_notes_case    ON legal_notes(case_id);
CREATE INDEX idx_consultations_lawyer ON legal_consultations(lawyer_id);
CREATE INDEX idx_support_staff       ON support_sessions(staff_id);
CREATE INDEX idx_support_client      ON support_sessions(client_id);
CREATE INDEX idx_jobs_department     ON job_postings(department);
CREATE INDEX idx_candidates_job      ON candidates(job_id);
CREATE INDEX idx_candidates_status   ON candidates(status);
CREATE INDEX idx_tasks_assigned      ON staff_tasks(assigned_to);
CREATE INDEX idx_tasks_department    ON staff_tasks(department);
CREATE INDEX idx_tasks_status        ON staff_tasks(status);

-- 10. RLS
-- ========================================================

ALTER TABLE staff_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_shifts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE field_dispatches    ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_tickets    ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics      ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_notes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_postings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_tasks         ENABLE ROW LEVEL SECURITY;

-- Staff vê o seu próprio perfil
CREATE POLICY "Staff: ler próprio perfil"
  ON staff_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Staff do mesmo departamento pode ver colegas
CREATE POLICY "Staff: ver colegas do departamento"
  ON staff_profiles FOR SELECT
  USING (
    department = (
      SELECT department FROM staff_profiles WHERE user_id = auth.uid() LIMIT 1
    )
  );

-- Admins vêem todos os staff
CREATE POLICY "Staff: admins vêem todos"
  ON staff_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Agentes de campo vêem os seus turnos
CREATE POLICY "Turnos: agente vê os próprios"
  ON field_shifts FOR ALL
  USING (agent_id = (
    SELECT id FROM staff_profiles WHERE user_id = auth.uid() LIMIT 1
  ));

-- Dispatches: agentes vêem os seus
CREATE POLICY "Dispatches: agente vê os próprios"
  ON field_dispatches FOR ALL
  USING (agent_id = (
    SELECT id FROM staff_profiles WHERE user_id = auth.uid() LIMIT 1
  ));

-- TI: tickets visíveis pelo departamento
CREATE POLICY "Tickets: departamento TI"
  ON security_tickets FOR ALL
  USING (EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE user_id = auth.uid() AND department = 'it'
  ));

-- Métricas: leitura por TI e admins
CREATE POLICY "Métricas: leitura TI"
  ON system_metrics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE user_id = auth.uid() AND department = 'it'
  ));

-- Legal: notas visíveis por advogados do caso
CREATE POLICY "Notas legais: advogado do caso"
  ON legal_notes FOR ALL
  USING (lawyer_id = (
    SELECT id FROM staff_profiles WHERE user_id = auth.uid() LIMIT 1
  ));

-- Legal: consultas visíveis pelo advogado
CREATE POLICY "Consultas: advogado atribuído"
  ON legal_consultations FOR ALL
  USING (lawyer_id = (
    SELECT id FROM staff_profiles WHERE user_id = auth.uid() LIMIT 1
  ));

-- Social: sessões visíveis pelo profissional atribuído
CREATE POLICY "Sessões: staff atribuído"
  ON support_sessions FOR ALL
  USING (staff_id = (
    SELECT id FROM staff_profiles WHERE user_id = auth.uid() LIMIT 1
  ));

-- Recrutamento: vagas visíveis pelo departamento
CREATE POLICY "Vagas: departamento recrutamento"
  ON job_postings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE user_id = auth.uid() AND department = 'recruitment'
  ));

-- Vagas: leitura pública (para candidatos)
CREATE POLICY "Vagas: leitura pública (abertas)"
  ON job_postings FOR SELECT
  USING (is_open = TRUE);

-- Candidatos: visíveis pelo recrutamento
CREATE POLICY "Candidatos: recrutamento"
  ON candidates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE user_id = auth.uid() AND department = 'recruitment'
  ));

-- Tarefas: visíveis pelo assignee
CREATE POLICY "Tarefas: assignee"
  ON staff_tasks FOR ALL
  USING (assigned_to = (
    SELECT id FROM staff_profiles WHERE user_id = auth.uid() LIMIT 1
  ));

-- 11. TRIGGERS
-- ========================================================

CREATE TRIGGER trg_staff_updated
  BEFORE UPDATE ON staff_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_legal_notes_updated
  BEFORE UPDATE ON legal_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_candidates_updated
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
