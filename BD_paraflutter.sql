-- ========================================================
-- F.L.A.M.E – Schema Unificado para Flutter (PostgreSQL)
-- Versão Consolidada: Base de Dados do Site + Portal Staff
-- ========================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================
-- 2. TIPOS E ENUMS (Consolidados)
-- ========================================================

-- Geral e Portal de Apoio
DO $$ BEGIN
    CREATE TYPE vault_cat     AS ENUM ('identity', 'immigration', 'legal', 'residence', 'health', 'other');
    CREATE TYPE doc_status    AS ENUM ('verified', 'pending', 'expired');
    CREATE TYPE case_status   AS ENUM ('pending', 'active', 'closed');
    CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'urgent');
    CREATE TYPE msg_type      AS ENUM ('text', 'file', 'system', 'voip_transcript');
    CREATE TYPE voip_status   AS ENUM ('ringing', 'active', 'ended', 'missed');
    CREATE TYPE alert_status  AS ENUM ('sent', 'received', 'responded', 'resolved');
    CREATE TYPE platform_type AS ENUM ('web', 'mobile_ios', 'mobile_android');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Staff e Departamentos
DO $$ BEGIN
    CREATE TYPE department_type AS ENUM ('field_agents', 'it', 'legal', 'social', 'recruitment');
    CREATE TYPE staff_role AS ENUM (
      'field_agent', 'field_coordinator',
      'mobile_dev', 'cybersecurity', 'data_analyst',
      'immigration_lawyer', 'human_rights_lawyer', 'legal_assistant',
      'psychologist', 'translator', 'social_worker',
      'recruiter', 'hr_manager'
    );
    CREATE TYPE task_status     AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
    CREATE TYPE task_priority   AS ENUM ('low', 'medium', 'high', 'critical');
    CREATE TYPE shift_status    AS ENUM ('scheduled', 'active', 'completed', 'missed');
    CREATE TYPE candidate_status AS ENUM ('applied', 'screening', 'interview', 'offered', 'hired', 'rejected');
    CREATE TYPE session_type    AS ENUM ('psychological', 'translation', 'legal_consultation');
    CREATE TYPE ticket_status   AS ENUM ('open', 'investigating', 'resolved', 'escalated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ========================================================
-- 3. TABELAS PRINCIPAIS
-- ========================================================

-- 3.1 USER ROLES (Standardization)
CREATE TABLE IF NOT EXISTS public.user_roles (
  name TEXT PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.user_roles (name, description) VALUES 
('migrant', 'Utilizador base (imigrante)'),
('staff', 'Colaborador da organização'),
('admin', 'Administrador com acesso total'),
('developer', 'Programador / Suporte Técnico'),
('lawyer', 'Advogado especializado'),
('operator', 'Operador de campo / VoIP')
ON CONFLICT (name) DO NOTHING;

-- 3.2 PROFILES (Consolidada)
-- Obs: 'id' referencia auth.users do Supabase
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY, -- Referência a auth.users (id)
  email         TEXT UNIQUE,
  username      TEXT UNIQUE,
  full_name     TEXT,
  display_name  TEXT,
  nationality   TEXT,
  birth_year    INTEGER,
  phone         TEXT,
  phone_country_code TEXT,
  phone_number  TEXT,
  password      TEXT,             -- Password plaintext/hash (mock)
  role          TEXT DEFAULT 'migrant' REFERENCES public.user_roles(name),
  avatar_url    TEXT,
  language      TEXT DEFAULT 'pt',
  status        TEXT DEFAULT 'offline', -- online, offline, inactive
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 VAULT ITEMS
CREATE TABLE IF NOT EXISTS vault_items (
  id                UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID          REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title             TEXT          NOT NULL,
  category          vault_cat     DEFAULT 'other',
  encrypted_content TEXT,           
  encryption_iv     TEXT,           
  encryption_salt   TEXT,           
  file_url          TEXT,           
  file_size         BIGINT,         
  mime_type         TEXT,
  status            doc_status    DEFAULT 'pending',
  expires_at        DATE,
  is_important      BOOLEAN       DEFAULT FALSE,
  created_at        TIMESTAMPTZ   DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   DEFAULT NOW()
);

-- 3.4 CASES (Casos Jurídicos)
CREATE TABLE IF NOT EXISTS cases (
  id            UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  migrant_id    UUID          REFERENCES profiles(id) NOT NULL,
  lawyer_id     UUID          REFERENCES profiles(id),
  subject       TEXT,
  description   TEXT,
  status        case_status   DEFAULT 'pending',
  priority      case_priority DEFAULT 'medium',
  category      TEXT,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW(),
  closed_at     TIMESTAMPTZ
);

-- 3.5 MESSAGES (Chat Traduzido)
CREATE TABLE IF NOT EXISTS messages (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id         UUID        REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  sender_id       UUID        REFERENCES profiles(id) NOT NULL,
  encrypted_text  TEXT,
  encryption_iv   TEXT,
  message_type    msg_type    DEFAULT 'text',
  translation     TEXT,          -- Tradução automática gerada pela IA
  source_lang     TEXT,
  target_lang     TEXT,
  is_read         BOOLEAN     DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 EMERGENCY ALERTS (App SOS)
CREATE TABLE IF NOT EXISTS emergency_alerts (
  id            UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID          REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  latitude      DECIMAL(10,6),
  longitude     DECIMAL(10,6),
  accuracy_m    INT,
  status        alert_status  DEFAULT 'sent',
  resolved_by   UUID          REFERENCES profiles(id),
  notes         TEXT,
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  resolved_at   TIMESTAMPTZ
);

-- ========================================================
-- 4. TABELAS DE STAFF (Portal de Gestão)
-- ========================================================

CREATE TABLE IF NOT EXISTS staff_profiles (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID    REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  department      department_type NOT NULL,
  staff_role      staff_role      NOT NULL,
  employee_id     TEXT    UNIQUE,
  is_immigrant    BOOLEAN DEFAULT FALSE,
  languages       TEXT[]  DEFAULT ARRAY['pt'],
  specializations TEXT[],
  is_active       BOOLEAN DEFAULT TRUE,
  hired_at        DATE    DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Turnos e Despacho de Emergência
CREATE TABLE IF NOT EXISTS field_shifts (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  agent_id        UUID    REFERENCES staff_profiles(id) ON DELETE CASCADE NOT NULL,
  shift_date      DATE    NOT NULL,
  start_time      TIME    NOT NULL,
  end_time        TIME    NOT NULL,
  region          TEXT,
  status          shift_status DEFAULT 'scheduled',
  check_in_at     TIMESTAMPTZ,
  check_out_at    TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS field_dispatches (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  alert_id        UUID    REFERENCES emergency_alerts(id) ON DELETE CASCADE NOT NULL,
  agent_id        UUID    REFERENCES staff_profiles(id) NOT NULL,
  status          task_status DEFAULT 'open',
  dispatched_at   TIMESTAMPTZ DEFAULT NOW(),
  arrived_at      TIMESTAMPTZ,
  resolved_at     TIMESTAMPTZ,
  report          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- TI e Sistemas
CREATE TABLE IF NOT EXISTS security_tickets (
  id              UUID    DEFAULT uuid_generate_v4() PRIMARY KEY,
  reported_by     UUID    REFERENCES staff_profiles(id),
  assigned_to     UUID    REFERENCES staff_profiles(id),
  title           TEXT    NOT NULL,
  description     TEXT,
  severity        task_priority DEFAULT 'medium',
  status          ticket_status DEFAULT 'open',
  category        TEXT,
  resolution      TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

-- ========================================================
-- 5. FUNÇÕES E AUTOMATISMOS (Supabase Logic)
-- ========================================================

-- Gatilho de Criação de Perfil (Profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      full_name, 
      username, 
      role, 
      nationality, 
      birth_year, 
      password,
      status
    )
    VALUES (
      new.id,
      new.email,
      COALESCE(new.raw_user_meta_data->>'full_name', 'Utilizador Novo'),
      COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
      COALESCE(new.raw_user_meta_data->>'role', 'migrant'),
      COALESCE(new.raw_user_meta_data->>'nationality', ''),
      (CASE 
        WHEN (new.raw_user_meta_data->>'birth_year') ~ '^[0-9]+$' 
        THEN (new.raw_user_meta_data->>'birth_year')::INTEGER 
        ELSE NULL 
      END),
      COALESCE(new.raw_user_meta_data->>'password_plaintext', ''),
      'offline'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger no Auth.Users (Supabase interno)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atualização automática de Timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_staff_updated BEFORE UPDATE ON staff_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========================================================
-- 6. SEGURANÇA (RLS)
-- ========================================================

-- Desativar RLS para facilitar integração inicial com Flutter (ou usar políticas 'true')
-- Em produção real, dever-se-ia configurar políticas detalhadas.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles DISABLE ROW LEVEL SECURITY;

-- ========================================================
-- FIM DO SCHEMA
-- ========================================================
