-- ========================================================
-- FIX: Acesso Administrativo e Recursão de RLS
-- ========================================================

-- 1. Criar uma função SECURITY DEFINER para verificar se é admin
-- Isto ignora a RLS da própria tabela e evita recursão.
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Atualizar as políticas da tabela profiles
DROP POLICY IF EXISTS "Admins podem ver tudo em profiles" ON public.profiles;
DROP POLICY IF EXISTS "Perfil: admins lêem todos" ON public.profiles;

CREATE POLICY "Admins podem ver tudo em profiles" 
ON public.profiles FOR ALL 
USING ( public.is_admin(auth.uid()) );

-- 3. PROMOVER O TEU UTILIZADOR A ADMIN (Copia e corre isto com o teu ID)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = 'd2fc4a91-3fad-4174-abe3-1c2588176737';

-- Se a linha não existir (registo antigo), corre este em vez do UPDATE:
-- INSERT INTO public.profiles (id, full_name, role) 
-- VALUES ('d2fc4a91-3fad-4174-abe3-1c2588176737', 'Admin User', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';


-- 4. Adicionar política para permitir que admins vejam staff_profiles (apenas se a tabela existir)
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'staff_profiles') THEN
    ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Admins podem gerir staff" ON public.staff_profiles;
    CREATE POLICY "Admins podem gerir staff" 
    ON public.staff_profiles FOR ALL 
    USING ( public.is_admin(auth.uid()) );
  END IF;
END $$;

