-- 1. GARANTIR QUE A TABELA EXISTE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  nationality TEXT,
  birth_year INTEGER,
  password TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ADICIONAR COLUNAS FALTANTES (role, phone, status)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
    ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'migrant';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone_country_code') THEN
    ALTER TABLE public.profiles ADD COLUMN phone_country_code TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='phone_number') THEN
    ALTER TABLE public.profiles ADD COLUMN phone_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
    ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'offline';
  END IF;
END $$;

-- 3. HABILITAR RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. LIMPAR POLÍTICAS EXISTENTES
DROP POLICY IF EXISTS "Utilizadores podem ver o próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Utilizadores podem atualizar o próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Inserção automática no registo" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem tudo" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver tudo em profiles" ON public.profiles;

-- 5. POLÍTICAS DE SEGURANÇA (Utilizadores normais)
CREATE POLICY "Utilizadores podem ver o próprio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Utilizadores podem atualizar o próprio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Inserção automática no registo" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 6. POLÍTICA PARA ADMINS (Acesso total)
-- Esta política permite que qualquer utilizador com role = 'admin' tenha acesso total a todos os perfis.
CREATE POLICY "Admins podem tudo" 
ON public.profiles FOR ALL 
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

