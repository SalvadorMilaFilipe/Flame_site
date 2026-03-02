-- ========================================================
-- FUNCIONALIDADE:Auto-confirmação de Migrantes e Regras de Segurança
-- Objetivo: Evitar confirmação por email para migrantes, mas manter para staff.
-- ========================================================

-- 1. TRIGGER PARA AUTO-CONFIRMAR EMAIL DE MIGRANTES
CREATE OR REPLACE FUNCTION public.handle_auto_confirm_migrants()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o utilizador não tiver role definida ou se for explicitamente 'migrant'
  -- (Baseado nos metadados enviados no registo ou padrão)
  IF (new.raw_app_meta_data->>'role' = 'migrant' OR new.raw_app_meta_data->>'role' IS NULL) THEN
    new.email_confirmed_at = NOW();
    new.last_sign_in_at = NOW();
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar à tabela de autenticação do Supabase
DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;
CREATE TRIGGER on_auth_user_created_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auto_confirm_migrants();

-- 2. GARANTIR QUE STAFF PRECISA DE CONFIRMAÇÃO (Opcional, apenas informativo)
-- Nota: O Supabase por padrão pede confirmação se configurado. 
-- O trigger acima apenas salta esse passo para 'migrant'.

-- 3. PROCEDIMENTO PARA ADMIN CRIAR STAFF COM PROFILE PREENCHIDO
-- Esta função pode ser chamada pelo site (via RPC ou Edge Function)
CREATE OR REPLACE FUNCTION public.admin_create_staff(
  input_email TEXT,
  input_password TEXT,
  input_full_name TEXT,
  input_username TEXT,
  input_nationality TEXT,
  input_birth_year INTEGER,
  input_role TEXT,
  input_dept TEXT
) RETURNS VOID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- NOTA: Criar user em auth.users a partir de PL/pgSQL requer extensões ou ser feito via API.
  -- Este script foca na lógica de dados. O site deve usar auth.admin.createUser da SDK.
  
  -- Exemplo de inserção forçada se o ID já vier da API:
  -- INSERT INTO public.profiles (id, full_name, username, nationality, birth_year, role)
  -- VALUES (new_user_id, input_full_name, input_username, input_nationality, input_birth_year, input_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
