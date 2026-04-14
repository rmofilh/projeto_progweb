# Documentação Técnica: Sistema de Autenticação (Fio & Luz)

## 1. Visão Geral
Conforme definido no `proposal.md`, a autenticação do sistema **Fio & Luz** prioriza a baixa carga cognitiva para usuárias acima de 50 anos. Por isso, optou-se pelo uso de **Magic Links** (acesso sem senha via link de e-mail) e tokens **JWT** para persistência de sessão.

## 2. Fluxo de Operação

O processo de autenticação ocorre em dois estágios:

### Estágio 1: Solicitação de Acesso
- **Endpoint:** `POST /v1/auth/magic-link`
- **Input:** `{ "email": "usuario@dominio.com" }`
- **Lógica:**
    1. O sistema verifica se o usuário existe; se não, cria um novo (Just-in-time provisioning).
    2. Gera um token único (UUID).
    3. Registra na tabela `magic_links` com expiração de 15 minutos.
- **Simulação (Desenvolvimento):** O link de acesso é impresso no console do backend:
  `[EMAIL SIMULATION] Link: https://fioeluz.app/verify?token=<uuid>`

### Estágio 2: Verificação e Emissão de JWT
- **Endpoint:** `POST /v1/auth/verify?token=<uuid>`
- **Input:** Token via Query String.
- **Lógica:**
    1. Valida se o token existe, não foi usado e não expirou.
    2. Marca o token como usado.
    3. Atualiza o campo `last_login_at` do usuário.
    4. Emite um **JWT** (JSON Web Token) contendo o `user_id`.

## 3. Arquitetura Técnica

A implementação segue os padrões de **Clean Architecture**:

- **Modelos (`domain/models.py`):** Entidade `MagicLink` introduzida para gerenciar ciclos de vida de tokens.
- **Esquemas (`domain/schemas.py`):** `AuthRequest` e `TokenResponse` garantindo contratos Type-Safe.
- **Serviço (`services/auth.py`):** `AuthService` isola a lógica de hashing do JWT e gestão de expiração.
- **Dependências (`api/dependencies.py`):** O injetor `get_current_user` automatiza a extração do usuário a partir do Header `Authorization: Bearer <JWT>`.

## 4. Segurança
- **Expiração:** Magic Links expiram em 15 minutos. JWTs expiram em 1 semana.
- **Idempotência:** Tokens marcados como `used=True` não podem ser reutilizados.
- **Assinatura:** JWTs são assinados com `HS256` usando uma `SECRET_KEY` configurável via variáveis de ambiente.

---
*Documento gerado automaticamente após a conclusão da Fase 1 da implementação.*
