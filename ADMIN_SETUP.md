# 🛠️ Configuração de Administração e Convites (Supabase)

Para que o novo sistema de administração funcione, precisas de seguir estes passos no teu projeto Supabase.

## 1. Tornar-te Administrador
Por defeito, todos os novos utilizadores são registados como `migrant`. Para acederes ao painel admin, tens de mudar o teu próprio cargo:

1. Vai ao **Table Editor** no Supabase.
2. Seleciona a tabela `profiles`.
3. Encontra a tua linha (pelo e-mail/id) e muda a coluna `role` de `migrant` para `admin`.
4. Agora já consegues entrar em `/admin` no site.

---

## 2. Criar Staff via Edge Function (Segurança)
Como o browser não pode ter permissões para criar outros utilizadores (por segurança), o formulário que criei faz uma simulação. Para ser real, deves criar uma **Edge Function** no Supabase.

### Código da Edge Function (`supabase/functions/invite-staff/index.ts`)
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  const { email, full_name, role, dept, password } = await req.json()

  // Cliente com SERVICE_ROLE_KEY (pode criar users)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // 1. Criar o User no Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role: 'staff' }
  })

  if (authError) return new Response(JSON.stringify(authError), { status: 400 })

  // 2. Criar Perfil e Perfil de Staff
  await supabaseAdmin.from('profiles').insert({
    id: authUser.user.id,
    full_name,
    role: 'staff'
  })

  await supabaseAdmin.from('staff_profiles').insert({
    user_id: authUser.user.id,
    department: dept,
    staff_role: role
  })

  // 3. Enviar E-mail (Exemplo com Resend/SendGrid)
  // ... lógica de envio de e-mail aqui ...

  return new Response(JSON.stringify({ success: true }), { status: 200 })
})
```

---

## 3. SQL Complementar
Executa isto no teu **SQL Editor** para garantir que as tabelas estão prontas para o staff:

```sql
-- Adicionar coluna role se ainda não existir (já incluí no database_profiles.sql)
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'migrant';

-- Garantir que o admin tem acesso a tudo (Limpar antes para evitar erro)
DROP POLICY IF EXISTS "Admins podem ver tudo em profiles" ON profiles;
CREATE POLICY "Admins podem ver tudo em profiles" 
ON profiles FOR ALL 
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );

-- Garantir que staff_profiles está ligado corretamente
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins gerem staff" ON staff_profiles;
CREATE POLICY "Admins gerem staff" 
ON staff_profiles FOR ALL 
USING ( (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' );
```

---

## 🚀 Como testar agora:
1. Abre a consola do teu browser (F12).
2. Tenta "convidar" alguém no formulário de Admin.
3. Verás os logs da simulação com a **password gerada** e os dados que seriam enviados.
