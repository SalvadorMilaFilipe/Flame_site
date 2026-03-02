# Projeto Flame – Estrutura & Documentação

## 1. Visão Geral
**Flame – Frontline Legal Aid for Migrants & Emergencies** é uma plataforma Social Tech dedicada a fornecer apoio jurídico crítico e seguro para migrantes em situações de vulnerabilidade ou emergência.

### Pilares do Projeto:
- **Agilidade:** Resposta rápida em situações críticas.
- **Segurança:** Encriptação de ponta-a-ponta para dados sensíveis.
- **Acessibilidade:** Interface clara para um público adulto e multilingue.
- **Legalidade:** Conexão direta com profissionais jurídicos verificados.

---

## 2. Estrutura do Projeto

### 📁 Frontend (Web Admin & Landing) - Next.js
```
/flame-web
  /src
    /app
      /admin         # Painel administrativo
      /dashboard     # Painel do utilizador (Vault, Chat)
      /auth          # Login/Signup
    /components
      /ui            # Botões, inputs, modais (Design System)
      /vault         # Componentes do Cofre Digital
      /chat          # Interface de chat segura
    /hooks           # Lógica de encriptação (useAES)
    /services        # Integração com Supabase
    /styles          # Temas e variáveis CSS
```

### 📁 Mobile App - React Native / Flutter
- **React Native:** Usado para a aplicação principal de comunicação e gestão.
- **Flutter:** Usado especificamente para o módulo de **Botão de Pânico** (alta performance e acesso a hardware).

---

## 3. Funcionalidades Detalhadas

### 3.1 App Mobile
- **Vault Digital:** Armazenamento de passaportes, vistos e contratos com encriptação AES-256 no client-side.
- **Chat Seguro:** Mensagens encriptadas e chamadas VoIP.
- **Tradução em Tempo Real:** Integração de API para facilitar a comunicação migrante-advogado.

### 3.2 Painel Administrativo
- **Gestão de Casos:** Triagem de pedidos de ajuda.
- **Monitorização:** Acompanhamento de alertas (vindos do Flutter).
- **Diretório de Advogados:** Gestão de voluntários e profissionais parceiros.

---

## 4. Lógica de Permissões (RBAC)
- **Migrante:** Pode gerir o seu próprio Vault, iniciar chats e pedir auxílio.
- **Advogado:** Pode visualizar os casos atribuídos e comunicar com migrantes.
- **Admin:** Controlo total sobre utilizadores, auditoria e configurações do sistema.

---

## 5. Segurança
- **Client-Side Encryption:** A chave de desencriptação reside apenas no dispositivo do utilizador (simulado).
- **RLS (Row Level Security):** Garantia de que um utilizador só acede aos seus próprios dados diretamente na base de dados.
