-- 1. ADICIONAR COLUNAS DE TELEMÓVEL E STATUS
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_country_code TEXT,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'offline';

-- 2. LIMPAR POLÍTICAS PARA ATUALIZAR
DROP POLICY IF EXISTS "Utilizadores podem ver o próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Utilizadores podem atualizar o próprio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Inserção automática no registo" ON public.profiles;
DROP POLICY IF EXISTS "Admins podem ver tudo em profiles" ON public.profiles;

-- 3. RECRIAR POLÍTICAS
CREATE POLICY "Utilizadores podem ver o próprio perfil" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Utilizadores podem atualizar o próprio perfil" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Inserção automática no registo" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins podem ver tudo em profiles" 
ON public.profiles FOR ALL 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
