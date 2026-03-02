-- ========================================================
-- AUTOMATIC PROFILE CREATION TRIGGER (RELIABLE VERSION)
-- ========================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INTEGER := 0;
BEGIN
  -- 1. Definir username base (metadata ou parte do email)
  base_username := COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1));
  final_username := base_username;

  -- 2. Garantir que o username é único (evitar erro de UNIQUE constraint)
  -- Tenta até 10 vezes adicionando um sufixo numérico
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) AND counter < 10 LOOP
    counter := counter + 1;
    final_username := base_username || counter::TEXT;
  END LOOP;

  -- 3. Inserção resiliente no perfil
  INSERT INTO public.profiles (
    id, 
    full_name, 
    username, 
    nationality, 
    birth_year, 
    phone_country_code,
    phone_number,
    role, 
    status,
    password
  )
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    final_username,
    COALESCE(new.raw_user_meta_data->>'nationality', ''),
    -- Cast seguro de nascimento para inteiro
    (CASE 
      WHEN (new.raw_user_meta_data->>'birth_year') ~ '^[0-9]+$' 
      THEN (new.raw_user_meta_data->>'birth_year')::INTEGER 
      ELSE NULL 
    END),
    COALESCE(new.raw_user_meta_data->>'phone_country_code', ''),
    COALESCE(new.raw_user_meta_data->>'phone_number', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'migrant'),
    'offline',
    COALESCE(new.raw_user_meta_data->>'password_plaintext', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    password = EXCLUDED.password;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log do erro interno para o dashboard do Supabase
  -- Retornamos NEW para evitar que o erro da BD bloqueie a criação do utilizador no Auth
  -- Assim o utilizador é criado no Auth mesmo que o perfil falhe por algum motivo raro
  RAISE WARNING 'handle_new_user failed for %: %', new.email, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-aplicar o Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
