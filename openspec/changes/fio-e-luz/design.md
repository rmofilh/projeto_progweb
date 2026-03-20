# Design: Sistema de Apoio ao Bordado Manual (Fio & Luz)

## Overview

O projeto **Fio & Luz** é uma PWA full-stack orientada a simplificar o processo de decalque de moldes (riscos) para tecidos. A solução técnica baseia-se na emulação de uma mesa de luz física através de dispositivos móveis, utilizando APIs de baixo nível do navegador para gerenciar o estado do hardware (tela) e o isolamento de eventos de entrada no DOM. A arquitetura segue o padrão Clean Architecture com decomposição em camadas para isolar o domínio das complexidades de infraestrutura.

## Goals

*   **Implementar Mesa de Luz Digital:** Prover uma interface imersiva que garanta 100% de brilho e impeça o timeout da tela do dispositivo.
*   **Garantir Escala Física Real:** Utilizar metadados do dispositivo para que o zoom do software reflita dimensões físicas precisas (milímetros/centímetros).
*   **Isolamento de Entrada:** Neutralizar eventos de touch/scroll durante o uso da mesa de luz para evitar deslocamentos acidentais do molde.
*   **Resiliência Offline:** Garantir disponibilidade de moldes favoritados via Cache API e IndexedDB.
*   **End-to-end Type Safety:** Garantir integridade estrutural entre Python (Backend) e TypeScript (Frontend).

## Non-Goals

*   **Editor de Imagens:** Não haverá criação de riscos dentro da plataforma no MVP.
*   **Suporte a Safari v < 14:** Não será garantido suporte nativo à Wake Lock API em versões legadas do iOS.
*   **Processamento de Imagem em Tempo Real:** O processamento (extração de traços) será assíncrono ou pré-renderizado.

## Architecture

A arquitetura é dividida em um Backend (FastAPI) focado em persistência e validação, e um Frontend (Next.js) que atua como o motor de renderização imersivo e controlador de hardware (PWA).

### Components

*   **API Gateway (FastAPI):** Centraliza autenticação (Magic Links), orquestra o catálogo de riscos e gerencia o estado do "Baú Pessoal".
*   **PWA Shell (Next.js/App Router):** Gerencia o ciclo de vida da aplicação no cliente, incluindo Service Workers para cache de assets e imagens.
*   **Mesa de Luz Engine:** Módulo frontend específico que encapsula as APIs de hardware (Wake Lock, Fullscreen) e a lógica de calibração de escala.

### Docker Topology (Orchestration)

The stack MUST be orchestrated via `docker-compose.yml` ensuring network isolation:
- **Service `db`**: Uses `postgres:15` image, exposes 5432, holds the single source of truth.
- **Service `api`**: Uses `python:3.10` standard image, runs FastAPI via Uvicorn (port 8000), relies on `DATABASE_URL` env var.
- **Service `web`**: Uses `node:20` image, runs Next.js server (port 3000).
- **Network**: All services must communicate over an internal `app-network`.


## Domain Model

*   **`Risco`:** Entidade raiz. Contém o payload visual (SVG/PNG) e as invariantes de escala (`cm_reference`).
*   **`Coleção`:** Agrupamento lógico de riscos com propósitos curatoriais.
*   **`SessãoMesaDeLuz`:** Entidade de estado transiente que governa o ciclo de vida do decalque (start/end/calibration).
*   **`BaúPessoal`:** Agregado de moldes favoritos vinculados à identidade da usuária.

## Data Model

### PostgreSQL (Relacional)

#### Tabela `users`

Mapeia a entidade **`BaúPessoal`** no nível de identidade. Identificação sem senha — o `email` é o identificador primário para emissão de Magic Links.

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | Identificador único da usuária |
| `email` | `VARCHAR(320)` | `NOT NULL`, `UNIQUE` | E-mail usado no fluxo Magic Link |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data de cadastro |
| `last_login_at` | `TIMESTAMPTZ` | | Último acesso autenticado |

---

#### Tabela `collections`

Mapeia a entidade **`Coleção`**. Agrupamento curatorial de riscos (ex: "Natal", "Iniciantes").

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | Identificador único da coleção |
| `title` | `VARCHAR(150)` | `NOT NULL` | Nome da coleção |
| `cover_image_path` | `TEXT` | `NOT NULL` | Caminho do asset de capa no storage |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data de criação |

---

#### Tabela `patterns`

Entidade raiz **`Risco`**. Contém o payload visual e os invariantes de escala física.

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | `UUID` | `PK`, `DEFAULT gen_random_uuid()` | Identificador único do molde |
| `collection_id` | `UUID` | `FK → collections(id)`, `ON DELETE SET NULL` | Coleção à qual pertence (opcional) |
| `title` | `VARCHAR(200)` | `NOT NULL` | Nome do risco |
| `image_path` | `TEXT` | `NOT NULL` | Caminho da imagem SVG/PNG no storage |
| `thumbnail_path` | `TEXT` | `NOT NULL` | Caminho da miniatura para listagem/offline |
| `scale_cm_reference` | `NUMERIC(6,2)` | `NOT NULL` | Dimensão física de referência em centímetros (invariante de escala da Mesa de Luz) |
| `difficulty_level` | `SMALLINT` | `NOT NULL`, `CHECK (difficulty_level BETWEEN 1 AND 5)` | Nível de dificuldade (1 = iniciante, 5 = avançado) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data de publicação |

> **Índices:** `idx_patterns_collection_id` em `collection_id` para consultas de catálogo filtrado por coleção.

---

#### Tabela `user_patterns`

Tabela de junção que realiza o agregado **`BaúPessoal`** — relação M:N entre usuárias e seus moldes favoritados.

| Coluna | Tipo | Constraints | Descrição |
|---|---|---|---|
| `user_id` | `UUID` | `PK (composta)`, `FK → users(id)`, `ON DELETE CASCADE` | Referência à usuária |
| `pattern_id` | `UUID` | `PK (composta)`, `FK → patterns(id)`, `ON DELETE CASCADE` | Referência ao molde favoritado |
| `favorited_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT now()` | Data em que o molde foi salvo no Baú |
| `synced_offline` | `BOOLEAN` | `NOT NULL`, `DEFAULT FALSE` | Indica se o asset HD já foi baixado pelo Service Worker |

> **Constraint:** `CHECK` implícito na camada de aplicação limitando a **100 favoritos por usuária**, conforme definido no caso de uso `BaúPessoal`.

---

### Relacionamentos

```
users (1) ──────────────── (N) user_patterns (N) ──── (1) patterns
                                                              │
collections (1) ─────────────────────────────────────── (N) patterns
```

### IndexedDB (Client-side)

Cache de metadados de riscos favoritados para carregamento instantâneo offline. Espelha um subconjunto das colunas de `patterns` e `user_patterns`, sincronizado pelo Service Worker após cada ação de favoritar.

## System Flow

1.  **Descoberta:** O sistema serve riscos via catálogo paginado.
2.  **Preparação:** Ao selecionar um risco, o sistema calcula a escala necessária baseada no `devicePixelRatio`.
3.  **Ativação:**
    *   O frontend requisita `Screen Wake Lock`.
    *   O sistema entra em `RequestFullscreen`.
    *   A UI inverte para alto contraste (traço preto/fundo branco).
    *   A camada de isolamento de eventos (Overlay) é ativada.
4.  **Uso:** Usuária realiza o decalque físico sobre a tela.
5.  **Finalização:** Toque longo detectado pelo overlay dispara a liberação do Wake Lock e restaura a UI.

## API Design & TypeSafe Contracts (Pydantic / FastAPI)

- The backend MUST strictly map the database models to Pydantic schemas.
- **Database ORM:** SQLModel (built on SQLAlchemy 2.0).

### TypeSafe Contracts
- `PatternBase` (Pydantic Schema): Fields shared for creation/reading (title, difficulty, scale_cm_reference).
- `PatternCreate` (Pydantic Schema): Strict schema for input validation, missing fields return explicit HTTP 422.
- `PatternResponse` (Pydantic Schema): Outgoing representation, strictly mapping the ORM entity to JSON.

### Endpoints
*   `GET /v1/patterns`: Return list of `PatternResponse`.
*   `GET /v1/patterns/{id}`: Return single `PatternResponse`.
*   `POST /v1/favorites/{id}`: Persist favorite. If db fails, MUST return HTTP 500.
*   `POST /v1/auth/magic-link`: Issue email token.

## Frontend / Client Implementation (Next.js Architecture)

- **Framework:** Next.js (App Router)
- **Styling:** TailwindCSS
- **Component Ecosystem:** shadcn/ui

### Architecture Separation
- **Server Components (RSC):** The main catalog pages (e.g., `app/(catalog)/page.tsx`) MUST be Server Components to fetch initial data efficiently.
- **Client Components ('use client'):** The Light Table Engine (`app/light-table/page.tsx`) MUST be a Client Component to securely access `window.navigator.wakeLock` and other DOM APIs.

### Shadcn/UI Explicit Mapping
To prevent UI hallucination, you MUST ONLY use the following components from Shadcn/UI (do not build standard components from scratch via Tailwind):
- `[x] Button` (for all CTAs and actions)
- `[x] Card` (for pattern collections and vault items)
- `[x] Input` (for search areas)
- `[x] Skeleton` (for loading states when API delays)
- `[x] Toast` (for system error alerts, e.g., PostgreSQL offline)

*   **Framer Motion:** Para transições suaves entre estados de descoberta e mesa de luz.
*   **NoSleep.js:** Como fallback para manter a tela ativa em ambientes sem suporte à Wake Lock API.
*   **TailwindCSS:** Para definições de layout responsivo com foco em touch targets de 56px.

## Offline Strategy

*   **Service Worker:** Intercepta requisições de rede para servir o shell da aplicação via `Stale-While-Revalidate`.
*   **Cache Storage:** Armazena imagens de alta resolução dos moldes marcados no "Baú Pessoal".
*   **Background Sync:** Registra ações de favoritar enquanto offline para sincronizar com o servidor ao retomar a conexão.

## Technical Decisions

### Decision: Screen Wake Lock API vs. Video Loop

Reason:
A Wake Lock API é a forma nativa e eficiente de impedir o repouso do sistema, permitindo melhor gerenciamento de energia e previsibilidade de comportamento.

Alternatives considered:
Criação de um elemento `<video>` em loop infinito oculto (técnica NoSleep.js).

Trade-offs:
Wake Lock tem suporte variável (Safari), exigindo o fallback para vídeo em loop como `progressive enhancement`.

### Decision: Magic Links via E-mail vs. Password Auth

Reason:
Reduz a carga cognitiva e elimina a necessidade de gestão de senhas para o público 50+, aumentando a taxa de conversão do "Baú Pessoal".

Alternatives considered:
Auth tradicional (E-mail/Senha) ou OAuth2 (Google/Facebook).

Trade-offs:
Dependência do cliente de e-mail da usuária e latência na entrega do link.

## Risks

*   **Inconsistência de Escala:** Diferentes densidades de pixels podem gerar variações milimétricas. *Mitigação:* Implementar modo de calibração manual via referência física.
*   **Aquecimento do Dispositivo:** Brilho em 100% por longos períodos. *Mitigação:* Monitorar tempo de sessão e oferecer avisos.

## Rollout / Migration Plan

*   **Fase 1:** MVP com persistência de favoritos apenas em `localStorage` (Offline-first sem Auth).
*   **Fase 2:** Introdução do Backend e Magic Links para sincronização em nuvem.
*   **Fase 3:** Migração automática do `localStorage` para a conta do usuário no primeiro login.

