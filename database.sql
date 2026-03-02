-- ========================================================
-- F.L.A.M.E – Schema Completo para Supabase (PostgreSQL)
-- Frontline Legal Aid for Migrants & Emergencies
-- ========================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================
-- 2. TIPOS ENUMERADOS
-- ========================================================

CREATE TYPE user_role     AS ENUM ('migrant', 'lawyer', 'admin');
CREATE TYPE user_status   AS ENUM ('online', 'inactive', 'offline');
CREATE TYPE vault_cat     AS ENUM ('identity', 'immigration', 'legal', 'residence', 'health', 'other');
CREATE TYPE doc_status    AS ENUM ('verified', 'pending', 'expired');
CREATE TYPE case_status   AS ENUM ('pending', 'active', 'closed');
CREATE TYPE case_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE msg_type      AS ENUM ('text', 'file', 'system', 'voip_transcript');
CREATE TYPE voip_status   AS ENUM ('ringing', 'active', 'ended', 'missed');
CREATE TYPE alert_status  AS ENUM ('sent', 'received', 'responded', 'resolved');
CREATE TYPE platform_type AS ENUM ('web', 'mobile_ios', 'mobile_android');

-- ========================================================
-- 3. TABELAS
-- ========================================================

-- 3.1 PROFILES (estende auth.users)
CREATE TABLE profiles (
  id            UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name     TEXT,
  display_name  TEXT,
  email         TEXT UNIQUE,
  phone         TEXT,
  role          user_role     DEFAULT 'migrant',
  avatar_url    TEXT,
  language      TEXT          DEFAULT 'pt',
  nationality   TEXT,
  status        user_status   DEFAULT 'offline',
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- 3.2 VAULT ITEMS (documentos encriptados)
CREATE TABLE vault_items (
  id                UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID          REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title             TEXT          NOT NULL,
  category          vault_cat     DEFAULT 'other',
  encrypted_content TEXT,           -- Conteúdo encriptado com AES-256-GCM (base64)
  encryption_iv     TEXT,           -- Initialization Vector (base64)
  encryption_salt   TEXT,           -- Salt para PBKDF2 (base64)
  file_url          TEXT,           -- Referência ao Supabase Storage
  file_size         BIGINT,         -- Tamanho em bytes
  mime_type         TEXT,
  status            doc_status    DEFAULT 'pending',
  expires_at        DATE,
  is_important      BOOLEAN       DEFAULT FALSE,
  created_at        TIMESTAMPTZ   DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   DEFAULT NOW()
);

-- 3.3 CASES (casos jurídicos)
CREATE TABLE cases (
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

-- 3.4 MESSAGES (chat encriptado)
CREATE TABLE messages (
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

-- 3.5 VOIP SESSIONS (histórico de chamadas)
CREATE TABLE voip_sessions (
  id             UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  case_id        UUID         REFERENCES cases(id),
  caller_id      UUID         REFERENCES profiles(id) NOT NULL,
  receiver_id    UUID         REFERENCES profiles(id),
  source_lang    TEXT,
  target_lang    TEXT,
  status         voip_status  DEFAULT 'ringing',
  duration_secs  INT          DEFAULT 0,
  started_at     TIMESTAMPTZ,
  ended_at       TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- 3.6 EMERGENCY ALERTS (botão de pânico - app móvel)
CREATE TABLE emergency_alerts (
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

-- 3.7 TRUSTED CONTACTS (contactos de emergência)
CREATE TABLE trusted_contacts (
  id                    UUID      DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id               UUID      REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name                  TEXT      NOT NULL,
  phone                 TEXT,
  email                 TEXT,
  relationship          TEXT,
  notify_on_emergency   BOOLEAN   DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 SESSIONS (controlo de sessões ativas)
CREATE TABLE sessions (
  id            UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID          REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  platform      platform_type NOT NULL,
  ip_address    INET,
  user_agent    TEXT,
  is_active     BOOLEAN       DEFAULT TRUE,
  last_ping     TIMESTAMPTZ   DEFAULT NOW(),
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  expired_at    TIMESTAMPTZ
);

-- 3.9 AUDIT LOGS (registo de auditoria imutável)
CREATE TABLE audit_logs (
  id             UUID         DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID         REFERENCES profiles(id),
  action         TEXT         NOT NULL,   -- ex: 'vault.upload', 'case.create'
  resource_type  TEXT,                    -- ex: 'vault_item', 'case'
  resource_id    UUID,
  details        JSONB,
  ip_address     INET,
  created_at     TIMESTAMPTZ  DEFAULT NOW()
);

-- ========================================================
-- 4. ÍNDICES
-- ========================================================

CREATE INDEX idx_vault_items_user    ON vault_items(user_id);
CREATE INDEX idx_vault_items_cat     ON vault_items(category);
CREATE INDEX idx_cases_migrant       ON cases(migrant_id);
CREATE INDEX idx_cases_lawyer        ON cases(lawyer_id);
CREATE INDEX idx_cases_status        ON cases(status);
CREATE INDEX idx_messages_case       ON messages(case_id);
CREATE INDEX idx_messages_sender     ON messages(sender_id);
CREATE INDEX idx_messages_created    ON messages(created_at);
CREATE INDEX idx_voip_sessions_case  ON voip_sessions(case_id);
CREATE INDEX idx_emergency_user      ON emergency_alerts(user_id);
CREATE INDEX idx_emergency_status    ON emergency_alerts(status);
CREATE INDEX idx_audit_user          ON audit_logs(user_id);
CREATE INDEX idx_audit_action        ON audit_logs(action);
CREATE INDEX idx_sessions_user       ON sessions(user_id);
CREATE INDEX idx_sessions_active     ON sessions(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_contacts_user       ON trusted_contacts(user_id);

-- ========================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ========================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases             ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE voip_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_alerts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs        ENABLE ROW LEVEL SECURITY;

-- ── PROFILES ──
CREATE POLICY "Perfil: ler próprio"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Perfil: admins lêem todos"
  ON profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Perfil: atualizar próprio"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ── VAULT ──
CREATE POLICY "Vault: gestão completa própria"
  ON vault_items FOR ALL
  USING (auth.uid() = user_id);

-- ── CASES ──
CREATE POLICY "Casos: migrante vê os seus"
  ON cases FOR SELECT
  USING (auth.uid() = migrant_id);

CREATE POLICY "Casos: advogado vê atribuídos"
  ON cases FOR SELECT
  USING (auth.uid() = lawyer_id);

CREATE POLICY "Casos: admins vêem todos"
  ON cases FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Casos: criar (auth)"
  ON cases FOR INSERT
  WITH CHECK (auth.uid() = migrant_id);

CREATE POLICY "Casos: atualizar (advogado ou admin)"
  ON cases FOR UPDATE
  USING (
    auth.uid() = lawyer_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── MESSAGES ──
CREATE POLICY "Mensagens: ler do caso participante"
  ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = messages.case_id
    AND (cases.migrant_id = auth.uid() OR cases.lawyer_id = auth.uid())
  ));

CREATE POLICY "Mensagens: inserir no caso participante"
  ON messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM cases
    WHERE cases.id = messages.case_id
    AND (cases.migrant_id = auth.uid() OR cases.lawyer_id = auth.uid())
  ));

-- ── VOIP SESSIONS ──
CREATE POLICY "VoIP: participantes vêem"
  ON voip_sessions FOR SELECT
  USING (auth.uid() = caller_id OR auth.uid() = receiver_id);

-- ── EMERGENCY ALERTS ──
CREATE POLICY "Alertas: dono vê os seus"
  ON emergency_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Alertas: admins vêem todos"
  ON emergency_alerts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Alertas: criar (auth)"
  ON emergency_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── TRUSTED CONTACTS ──
CREATE POLICY "Contactos: gestão completa própria"
  ON trusted_contacts FOR ALL
  USING (auth.uid() = user_id);

-- ── SESSIONS ──
CREATE POLICY "Sessões: ler próprias"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

-- ── AUDIT LOGS ──
CREATE POLICY "Audit: admins lêem"
  ON audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- ========================================================
-- 6. FUNÇÕES & TRIGGERS
-- ========================================================

-- Auto-criar perfil quando o utilizador se regista
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    'migrant'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-atualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_vault_updated
  BEFORE UPDATE ON vault_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_cases_updated
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Registar ações no audit log (vault)
CREATE OR REPLACE FUNCTION public.log_vault_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, details)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    CASE TG_OP
      WHEN 'INSERT' THEN 'vault.upload'
      WHEN 'UPDATE' THEN 'vault.update'
      WHEN 'DELETE' THEN 'vault.delete'
    END,
    'vault_item',
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('operation', TG_OP, 'title', COALESCE(NEW.title, OLD.title))
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_vault_audit
  AFTER INSERT OR UPDATE OR DELETE ON vault_items
  FOR EACH ROW EXECUTE FUNCTION public.log_vault_action();

-- Atualizar status do profile com base nas sessões ativas
CREATE OR REPLACE FUNCTION public.update_user_status()
RETURNS TRIGGER AS $$
DECLARE
  active_count INT;
BEGIN
  SELECT COUNT(*) INTO active_count
  FROM sessions
  WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND is_active = TRUE;

  UPDATE profiles SET status = (
    CASE
      WHEN active_count > 0 THEN 'online'::user_status
      ELSE 'offline'::user_status
    END
  )
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_session_status
  AFTER INSERT OR UPDATE OR DELETE ON sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_user_status();

-- ========================================================
-- 7. STORAGE BUCKETS (executar no Supabase Dashboard)
-- ========================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('vault-documents', 'vault-documents', FALSE);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', TRUE);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('case-attachments', 'case-attachments', FALSE);
