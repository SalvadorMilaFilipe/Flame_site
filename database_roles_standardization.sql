-- 1. CRIAR TABELA DE ROLES DISPONÍVEIS
CREATE TABLE IF NOT EXISTS public.user_roles (
  name TEXT PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSERIR ROLES PADRÃO
INSERT INTO public.user_roles (name, description) VALUES 
('migrant', 'Utilizador base (imigrante)'),
('staff', 'Colaborador da organização'),
('admin', 'Administrador com acesso total'),
('developer', 'Programador / Suporte Técnico'),
('lawyer', 'Advogado especializado'),
('operator', 'Operador de campo / VoIP')
ON CONFLICT (name) DO NOTHING;

-- 3. CRIAR CONSTRAINT NA TABELA PROFILES (Apenas se não existir)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='fk_role_validation' AND table_name='profiles') THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT fk_role_validation
    FOREIGN KEY (role) REFERENCES public.user_roles(name)
    ON UPDATE CASCADE;
  END IF;
END $$;

-- 4. HABILITAR REALTIME PARA A TABELA PROFILES (Safe check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Caso a publicação não exista (ambiente local sem realtime configurado)
  RAISE NOTICE 'Não foi possível adicionar profiles à publicação Realtime.';
END $$;
