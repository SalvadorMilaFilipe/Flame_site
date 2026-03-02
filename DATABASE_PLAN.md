# 🔥 FLAME – Plano de Base de Dados

> **Frontline Legal Aid for Migrants & Emergencies**
> Documento técnico: Arquitetura de dados, autenticação, storage e segurança.

---

## 📐 Visão Geral da Arquitetura

```
┌──────────────────────────────────────────────────────────────────┐
│                        FLAME – Stack                            │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Frontend    │  Backend     │  Storage     │  Segurança         │
│  React (Web) │  Supabase    │  Supabase    │  AES-256-GCM       │
│  React Native│  PostgreSQL  │  Storage     │  RLS Policies      │
│  (Mobile)    │  Edge Funcs  │  (Buckets)   │  JWT + OAuth       │
└──────────────┴──────────────┴──────────────┴────────────────────┘
```

---

## 🗄️ Tabelas da Base de Dados

### Diagrama de Relações (ER Simplificado)

```
auth.users
    │
    ├──1:1──► profiles
    │             │
    │             ├──1:N──► vault_items ──► vault_files (Storage)
    │             │
    │             ├──1:N──► cases (como migrant_id)
    │             │           │
    │             │           ├──N:1──► profiles (como lawyer_id)
    │             │           │
    │             │           ├──1:N──► messages
    │             │           │
    │             │           └──1:N──► voip_sessions
    │             │
    │             ├──1:N──► emergency_alerts
    │             │
    │             ├──1:N──► trusted_contacts
    │             │
    │             └──1:N──► sessions
    │
    └──────────► audit_logs
```

---

### 1. `profiles` – Perfis de Utilizador

| Coluna         | Tipo          | Descrição                                    |
|----------------|---------------|----------------------------------------------|
| `id`           | UUID (PK, FK) | Referência a `auth.users.id`                 |
| `full_name`    | TEXT          | Nome completo                                |
| `display_name` | TEXT          | Nome de exibição (username)                  |
| `email`        | TEXT UNIQUE   | Email do utilizador                          |
| `phone`        | TEXT          | Número de telefone (opcional)                |
| `role`         | ENUM          | `'migrant'`, `'lawyer'`, `'admin'`           |
| `avatar_url`   | TEXT          | URL do avatar (bucket `avatars`)             |
| `language`     | TEXT          | Idioma preferido (default: `'pt'`)           |
| `nationality`  | TEXT          | Nacionalidade                                |
| `status`       | ENUM          | `'online'`, `'inactive'`, `'offline'`        |
| `created_at`   | TIMESTAMPTZ   | Data de criação                              |
| `updated_at`   | TIMESTAMPTZ   | Última atualização                           |

**Relações:**
- `id` → `auth.users.id` (1:1, CASCADE DELETE)

---

### 2. `vault_items` – Itens do Cofre Digital

| Coluna              | Tipo          | Descrição                                       |
|---------------------|---------------|-------------------------------------------------|
| `id`                | UUID (PK)     | Identificador único                              |
| `user_id`           | UUID (FK)     | Dono do documento → `profiles.id`                |
| `title`             | TEXT          | Nome do documento (encriptado no client)         |
| `category`          | ENUM          | `'identity'`, `'immigration'`, `'legal'`, etc.   |
| `encrypted_content` | TEXT          | Conteúdo encriptado (AES-256-GCM)                |
| `encryption_iv`     | TEXT          | Vetor de inicialização (IV) da encriptação       |
| `encryption_salt`   | TEXT          | Salt usado na derivação da chave (PBKDF2)        |
| `file_url`          | TEXT          | Referência ao ficheiro no Supabase Storage       |
| `file_size`         | BIGINT        | Tamanho do ficheiro em bytes                     |
| `mime_type`         | TEXT          | Tipo MIME do ficheiro                            |
| `status`            | ENUM          | `'verified'`, `'pending'`, `'expired'`           |
| `expires_at`        | DATE          | Data de validade do documento (opcional)          |
| `is_important`      | BOOLEAN       | Marcado como importante                          |
| `created_at`        | TIMESTAMPTZ   | Data de upload                                   |
| `updated_at`        | TIMESTAMPTZ   | Última modificação                               |

**Relações:**
- `user_id` → `profiles.id` (N:1, CASCADE DELETE)

**🔐 Nota de Segurança:**
- O conteúdo é encriptado no **client-side** com AES-256-GCM antes de ser enviado
- O servidor **nunca** vê os dados em texto claro
- A chave de encriptação é derivada de uma senha do utilizador via PBKDF2 (100.000 iterações)
- Cada item tem o seu próprio IV (vetor de inicialização) único

---

### 3. `cases` – Casos Jurídicos

| Coluna        | Tipo          | Descrição                              |
|---------------|---------------|----------------------------------------|
| `id`          | UUID (PK)     | Identificador único                    |
| `migrant_id`  | UUID (FK)     | Cliente → `profiles.id`               |
| `lawyer_id`   | UUID (FK)     | Advogado atribuído → `profiles.id`    |
| `subject`     | TEXT          | Assunto do caso                        |
| `description` | TEXT          | Descrição detalhada                    |
| `status`      | ENUM          | `'pending'`, `'active'`, `'closed'`    |
| `priority`    | ENUM          | `'low'`, `'medium'`, `'high'`, `'urgent'` |
| `category`    | TEXT          | Tipo de caso (asilo, visto, etc.)      |
| `created_at`  | TIMESTAMPTZ   | Data de abertura                       |
| `updated_at`  | TIMESTAMPTZ   | Última atualização                     |
| `closed_at`   | TIMESTAMPTZ   | Data de encerramento (se aplicável)    |

**Relações:**
- `migrant_id` → `profiles.id`
- `lawyer_id` → `profiles.id`

---

### 4. `messages` – Mensagens (Chat Encriptado)

| Coluna           | Tipo          | Descrição                              |
|------------------|---------------|----------------------------------------|
| `id`             | UUID (PK)     | Identificador único                    |
| `case_id`        | UUID (FK)     | Caso associado → `cases.id`           |
| `sender_id`      | UUID (FK)     | Remetente → `profiles.id`             |
| `encrypted_text` | TEXT          | Texto encriptado (E2E)                 |
| `encryption_iv`  | TEXT          | IV da encriptação                      |
| `message_type`   | ENUM          | `'text'`, `'file'`, `'system'`, `'voip_transcript'` |
| `translation`    | TEXT          | Tradução gerada pela IA (opcional)     |
| `source_lang`    | TEXT          | Idioma original                        |
| `target_lang`    | TEXT          | Idioma de tradução                     |
| `is_read`        | BOOLEAN       | Lida pelo destinatário                 |
| `created_at`     | TIMESTAMPTZ   | Data de envio                          |

**Relações:**
- `case_id` → `cases.id` (CASCADE DELETE)
- `sender_id` → `profiles.id`

---

### 5. `voip_sessions` – Sessões VoIP

| Coluna          | Tipo          | Descrição                              |
|-----------------|---------------|----------------------------------------|
| `id`            | UUID (PK)     | Identificador da sessão                |
| `case_id`       | UUID (FK)     | Caso associado → `cases.id`           |
| `caller_id`     | UUID (FK)     | Quem iniciou → `profiles.id`          |
| `receiver_id`   | UUID (FK)     | Quem recebeu → `profiles.id`          |
| `source_lang`   | TEXT          | Idioma do caller                       |
| `target_lang`   | TEXT          | Idioma do receiver                     |
| `status`        | ENUM          | `'ringing'`, `'active'`, `'ended'`, `'missed'` |
| `duration_secs` | INT           | Duração em segundos                    |
| `started_at`    | TIMESTAMPTZ   | Início da chamada                      |
| `ended_at`      | TIMESTAMPTZ   | Fim da chamada                         |
| `created_at`    | TIMESTAMPTZ   | Registo criado                         |

**Relações:**
- `case_id` → `cases.id`
- `caller_id`, `receiver_id` → `profiles.id`

**🔐 Nota:** Nenhum áudio é armazenado. Apenas metadados da sessão.

---

### 6. `emergency_alerts` – Alertas de Emergência (App Móvel)

| Coluna        | Tipo          | Descrição                              |
|---------------|---------------|----------------------------------------|
| `id`          | UUID (PK)     | Identificador                          |
| `user_id`     | UUID (FK)     | Quem acionou → `profiles.id`          |
| `latitude`    | DECIMAL(10,6) | Latitude GPS                           |
| `longitude`   | DECIMAL(10,6) | Longitude GPS                          |
| `accuracy_m`  | INT           | Precisão em metros                     |
| `status`      | ENUM          | `'sent'`, `'received'`, `'responded'`, `'resolved'` |
| `resolved_by` | UUID (FK)     | Quem respondeu → `profiles.id`        |
| `notes`       | TEXT          | Notas da equipa                        |
| `created_at`  | TIMESTAMPTZ   | Momento do alerta                      |
| `resolved_at` | TIMESTAMPTZ   | Momento da resolução                   |

---

### 7. `trusted_contacts` – Contactos de Confiança

| Coluna        | Tipo          | Descrição                              |
|---------------|---------------|----------------------------------------|
| `id`          | UUID (PK)     | Identificador                          |
| `user_id`     | UUID (FK)     | Dono → `profiles.id`                  |
| `name`        | TEXT          | Nome do contacto                       |
| `phone`       | TEXT          | Telefone                               |
| `email`       | TEXT          | Email (opcional)                       |
| `relationship`| TEXT          | Relação (amigo, familiar, advogado)    |
| `notify_on_emergency` | BOOLEAN | Notificar em caso de pânico?     |
| `created_at`  | TIMESTAMPTZ   | Data de registo                        |

---

### 8. `sessions` – Sessões Ativas

| Coluna        | Tipo          | Descrição                              |
|---------------|---------------|----------------------------------------|
| `id`          | UUID (PK)     | Identificador                          |
| `user_id`     | UUID (FK)     | Utilizador → `profiles.id`            |
| `platform`    | ENUM          | `'web'`, `'mobile_ios'`, `'mobile_android'` |
| `ip_address`  | INET          | Endereço IP                            |
| `user_agent`  | TEXT          | Browser/dispositivo                    |
| `is_active`   | BOOLEAN       | Sessão ativa?                          |
| `last_ping`   | TIMESTAMPTZ   | Último heartbeat                       |
| `created_at`  | TIMESTAMPTZ   | Início da sessão                       |
| `expired_at`  | TIMESTAMPTZ   | Expiração                              |

---

### 9. `audit_logs` – Registo de Auditoria

| Coluna        | Tipo          | Descrição                              |
|---------------|---------------|----------------------------------------|
| `id`          | UUID (PK)     | Identificador                          |
| `user_id`     | UUID (FK)     | Quem executou → `profiles.id`         |
| `action`      | TEXT          | Ação executada (ex: `vault.upload`)    |
| `resource_type`| TEXT         | Tipo de recurso (ex: `vault_item`)     |
| `resource_id` | UUID          | ID do recurso afetado                  |
| `details`     | JSONB         | Detalhes adicionais                    |
| `ip_address`  | INET          | IP de origem                           |
| `created_at`  | TIMESTAMPTZ   | Timestamp                              |

---

## 🔑 Autenticação (Supabase Auth)

### Métodos de Login
| Método           | Provider      | Notas                                   |
|------------------|---------------|-----------------------------------------|
| Email/Password   | Supabase Auth | Com verificação por email               |
| Google OAuth     | Google        | Criação automática de perfil via trigger |
| Apple Sign-In    | Apple         | Para utilizadores iOS (futuro)          |

### Fluxo de Autenticação
```
1. Utilizador regista-se via Email ou Google
2. Trigger `on_auth_user_created` cria entrada em `profiles`
3. JWT emitido pelo Supabase contém `user.id` e `user.role`
4. Todas as queries passam por RLS (Row Level Security)
5. Tokens refresh automáticos pelo SDK do Supabase
```

### JWT Claims Customizados
```sql
-- O role do utilizador é incluído no JWT para RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- Supabase automaticamente inclui auth.uid() em cada request
```

---

## 📦 Storage Buckets (Supabase Storage)

| Bucket             | Acesso    | Limite    | Descrição                              |
|--------------------|-----------|-----------|----------------------------------------|
| `vault-documents`  | Privado   | 50MB/file | Documentos encriptados do cofre        |
| `avatars`          | Público   | 2MB/file  | Fotos de perfil                        |
| `case-attachments` | Privado   | 20MB/file | Anexos de casos jurídicos              |
| `translations`     | Privado   | 5MB/file  | Transcrições traduzidas (temporário)   |

### Políticas de Storage
```sql
-- vault-documents: apenas o dono pode ver/inserir/eliminar
CREATE POLICY "Utilizador gere os seus ficheiros vault"
ON storage.objects FOR ALL
USING (bucket_id = 'vault-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- avatars: público para leitura, apenas dono para escrita
CREATE POLICY "Avatares legíveis por todos"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

---

## 🔐 Encriptação AES-256-GCM (Implementação Real)

### Arquitetura de Segurança

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT-SIDE (Browser)                     │
│                                                             │
│  Senha ──┐                                                  │
│          ▼                                                  │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   PBKDF2    │───▶│  AES-256-GCM │───▶│  Base64       │  │
│  │  100k iter  │    │  Encrypt     │    │  Encode       │  │
│  │  SHA-256    │    │              │    │               │  │
│  └─────────────┘    └──────────────┘    └──────┬────────┘  │
│       ▲                    ▲                    │           │
│       │                    │                    ▼           │
│    Salt (random)      IV (random)         Encrypted Data   │
│    16 bytes           12 bytes            (enviado ao DB)  │
│                                                             │
│  ⚠️ A chave NUNCA sai do browser                           │
│  ⚠️ O servidor NUNCA vê dados em texto claro               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SERVER-SIDE (Supabase)                    │
│                                                             │
│  Armazena APENAS:                                           │
│  • encrypted_content (ciphertext em base64)                 │
│  • encryption_iv (IV em base64)                             │
│  • encryption_salt (salt em base64)                         │
│  • metadata (título, categoria, status)                     │
│                                                             │
│  NÃO ARMAZENA:                                              │
│  ✕ Chave de encriptação                                     │
│  ✕ Senha do utilizador                                      │
│  ✕ Dados em texto claro                                     │
└─────────────────────────────────────────────────────────────┘
```

### Algoritmos Utilizados
| Função          | Algoritmo      | Parâmetros                       |
|-----------------|----------------|----------------------------------|
| Derivação chave | PBKDF2         | SHA-256, 100.000 iterações       |
| Encriptação     | AES-256-GCM    | Chave 256-bit, IV 96-bit         |
| Salt            | Crypto.random  | 16 bytes (128-bit)               |
| IV              | Crypto.random  | 12 bytes (96-bit)                |

### Fluxo de Encriptação
1. Utilizador introduz senha de cofre (nunca enviada ao servidor)
2. Gera-se um **salt aleatório** (16 bytes)
3. Deriva-se a **chave AES-256** via **PBKDF2** (100.000 iterações de SHA-256)
4. Gera-se um **IV aleatório** (12 bytes)
5. Encripta-se o conteúdo com **AES-256-GCM**
6. Envia-se ao servidor: `{ ciphertext, iv, salt }` — tudo em Base64
7. Para desencriptar: utilizador introduz a mesma senha → PBKDF2 → AES-GCM Decrypt

---

## 🛡️ Row Level Security (RLS)

### Políticas por Tabela

| Tabela              | SELECT                          | INSERT              | UPDATE          | DELETE          |
|---------------------|---------------------------------|----------------------|-----------------|-----------------|
| `profiles`          | Próprio + Admins                | Trigger automático   | Próprio         | Admins          |
| `vault_items`       | Próprio                         | Próprio              | Próprio         | Próprio         |
| `cases`             | Migrante OU Advogado do caso    | Auth                 | Advogado/Admin  | Admin           |
| `messages`          | Participantes do caso           | Participantes        | —               | Admin           |
| `voip_sessions`     | Caller OU Receiver              | Auth                 | —               | Admin           |
| `emergency_alerts`  | Próprio + Admins                | Próprio              | Admins          | Admins          |
| `trusted_contacts`  | Próprio                         | Próprio              | Próprio         | Próprio         |
| `sessions`          | Próprio                         | Sistema              | Sistema         | Sistema         |
| `audit_logs`        | Admins                          | Sistema              | —               | —               |

---

## 📡 API Endpoints (Supabase Auto-generated + Edge Functions)

### REST API (via PostgREST automático)
```
GET    /rest/v1/profiles?id=eq.{uid}          → Perfil do utilizador
GET    /rest/v1/vault_items?user_id=eq.{uid}  → Documentos do cofre
POST   /rest/v1/vault_items                   → Adicionar documento
PATCH  /rest/v1/vault_items?id=eq.{id}        → Atualizar documento
DELETE /rest/v1/vault_items?id=eq.{id}        → Remover documento

GET    /rest/v1/cases?or=(migrant_id.eq.{uid},lawyer_id.eq.{uid})
POST   /rest/v1/cases                         → Abrir caso
PATCH  /rest/v1/cases?id=eq.{id}              → Atualizar caso

GET    /rest/v1/messages?case_id=eq.{cid}     → Mensagens do caso
POST   /rest/v1/messages                      → Enviar mensagem
```

### Supabase Realtime (WebSocket)
```
SUBSCRIBE  messages:case_id=eq.{cid}          → Chat em tempo real
SUBSCRIBE  emergency_alerts:user_id=eq.{uid}  → Alertas de pânico
SUBSCRIBE  sessions:user_id=eq.{uid}          → Estado online/offline
```

### Edge Functions (Serverless)
```
POST   /functions/v1/translate    → Tradução via IA (DeepL / Google Cloud)
POST   /functions/v1/notify       → Notificação push (emergência)
POST   /functions/v1/voip-token   → Token WebRTC para chamada segura
GET    /functions/v1/health        → Estado dos serviços
```

---

## 🔄 Triggers e Funções

| Trigger                    | Tabela        | Ação                                         |
|----------------------------|---------------|----------------------------------------------|
| `on_auth_user_created`     | `auth.users`  | Cria perfil automático em `profiles`          |
| `on_profile_updated`       | `profiles`    | Atualiza `updated_at`                        |
| `on_vault_item_change`     | `vault_items` | Cria entrada em `audit_logs`                 |
| `on_emergency_alert`       | `emergency_alerts` | Notifica admins + contactos de confiança |
| `on_session_update`        | `sessions`    | Atualiza `profiles.status` (online/offline)  |

---

## 📊 Índices Recomendados

```sql
CREATE INDEX idx_vault_items_user    ON vault_items(user_id);
CREATE INDEX idx_cases_migrant       ON cases(migrant_id);
CREATE INDEX idx_cases_lawyer        ON cases(lawyer_id);
CREATE INDEX idx_messages_case       ON messages(case_id);
CREATE INDEX idx_messages_sender     ON messages(sender_id);
CREATE INDEX idx_voip_sessions_case  ON voip_sessions(case_id);
CREATE INDEX idx_emergency_user      ON emergency_alerts(user_id);
CREATE INDEX idx_audit_user          ON audit_logs(user_id);
CREATE INDEX idx_sessions_user       ON sessions(user_id);
```

---

## ✅ Resumo de Segurança

| Camada              | Tecnologia                            |
|---------------------|---------------------------------------|
| Transporte          | HTTPS / TLS 1.3                       |
| Autenticação        | JWT + OAuth 2.0 (Supabase Auth)       |
| Autorização         | PostgreSQL RLS (Row Level Security)   |
| Encriptação at rest | AES-256-GCM (client-side)             |
| Derivação de chave  | PBKDF2 (SHA-256, 100k iterações)      |
| Áudio VoIP          | Zero-log (não armazenado)             |
| Auditoria           | Logs imutáveis em `audit_logs`        |
| Storage             | Buckets privados com RLS              |
| RGPD                | Direito ao esquecimento via CASCADE   |
