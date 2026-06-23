# Fio & Luz

Sistema de apoio ao bordado manual — catálogo digital de riscos (moldes) com Mesa de Luz Digital para transferência de desenhos para o tecido.

## Visão Geral

O Fio & Luz é uma aplicação web full-stack que oferece um catálogo curado de riscos de bordado organizados em coleções temáticas. Seu diferencial é a Mesa de Luz Digital, que utiliza APIs do navegador (Screen Wake Lock, Fullscreen API) para transformar tablets e smartphones em mesas de luz, permitindo o decalque diretamente sobre a tela do dispositivo.

## Objetivo

Substituir a fragmentação de redes sociais por um catálogo focado de riscos de bordado, e reduzir a dependência de impressoras para transferência de moldes através de uma Mesa de Luz Digital baseada em navegador.

## Funcionalidades

- **Catálogo de Riscos**: Listagem de patterns com busca por texto, filtro por coleção, filtro por dificuldade (1 a 5) e ocultação de favoritados.
- **Coleções Temáticas**: Agrupamento curado de riscos (Xadrez, Animais, Flores, Pessoas — 24 patterns via seed).
- **Mesa de Luz Digital**: Tela cheia com Wake Lock API, desabilitação de scroll/zoom, simulador de bastidor, calibração manual de escala física, saída por toque longo (mobile) ou ESC/clique (desktop).
- **Autenticação por Magic Link**: Login sem senha via link enviado por e-mail (simulado em logs no ambiente de desenvolvimento), com JWT (HS256) protegendo rotas de favoritos.
- **Baú Pessoal (Favoritos)**: Lista de riscos favoritados por usuária, com limite de 100 itens (enforced via trigger PostgreSQL e verificação no frontend).
- **PWA**: Service Worker com cache de ativos estáticos.

## Tecnologias Utilizadas

### Backend
Python 3.10, FastAPI 0.109, SQLModel (SQLAlchemy 2.0), asyncpg, Pydantic v2, python-jose (JWT), Alembic, pytest-asyncio

### Frontend
Next.js 16 (App Router), TypeScript 5, Tailwind CSS v4, shadcn/ui, TanStack React Query 5, axios, react-hook-form, zod 4, Sonner, Vitest, Playwright

### Infraestrutura
Docker, Docker Compose, PostgreSQL 15 Alpine, GitHub Actions (CI + CD)

## Arquitetura

- **Backend**: FastAPI com Clean Architecture + DDD. Camadas: `adapters → use_cases → domain`. Domínio puro sem frameworks. Repositórios com protocolos.
- **Frontend**: Clean Architecture em `src/` com `domain → application → infrastructure → presentation`. Server Components (RSC) para dados iniciais, Client Components para interatividade.

## Estrutura do Projeto

```
fio-e-luz/
├── backend/           # FastAPI — Clean Architecture + DDD
│   ├── adapters/      # API routes, persistência SQLModel, workers
│   ├── domain/        # Entidades, interfaces, exceções
│   ├── use_cases/     # Casos de uso (orquestração)
│   ├── infrastructure/# Database, autenticação JWT, mensageria
│   ├── tests/         # pytest-asyncio
│   ├── alembic/       # Migrations
│   ├── main.py
│   └── seed_db.py
├── frontend/          # Next.js 16 App Router
│   ├── app/           # Páginas (home, login, vault, light-table/[id])
│   ├── components/    # shadcn/ui + componentes de domínio
│   ├── src/           # Clean Architecture: domain, application, infrastructure, presentation
│   └── public/        # SVGs, Service Worker, manifest.json
├── openspec/          # Especificação OpenSpec (3 changes, 8 specs)
├── documentacao/      # Documentos acadêmicos
└── docker-compose.yml
```

## Execução Local

### Com Docker Compose

```bash
docker compose up --build
docker compose exec api python seed_db.py   # apenas 1x
```

Após subir, acessar:
- Frontend: http://localhost:3000
- Backend (API): http://localhost:8000
- Documentação Swagger: http://localhost:8000/docs

### Desenvolvimento Local

```bash
# Terminal 1 — Banco de dados
docker compose up db

# Terminal 2 — Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload    # http://localhost:8000

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev                  # http://localhost:3000
```

Pré-requisitos: Python 3.10, Node.js 20, PostgreSQL 15, Docker (opcional).

### Executando Testes

```bash
# Backend (requer PostgreSQL rodando)
cd backend && pytest

# Frontend
cd frontend && npm test              # Vitest
cd frontend && npm run typecheck     # tsc --noEmit
cd frontend && npm run lint          # ESLint
```

## Links de Acesso

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

Ambiente de produção: não implementado no momento desta auditoria.

## Variáveis de Ambiente

| Variável | Obrigatória | Padrão (dev) | Descrição |
|----------|-------------|-------------|-----------|
| `DATABASE_URL` | Sim | — | Conexão PostgreSQL com asyncpg |
| `SECRET_KEY` | Sim (prod) | fallback dev | Chave para assinatura JWT HS256 |
| `FRONTEND_URL` | Não | `http://localhost:3000` | URL base para links de magic link |
| `CORS_ORIGINS` | Não | `http://localhost:3000` | Origens permitidas pelo CORS |
| `ENVIRONMENT` | Não | `development` | Se `development`, expõe magic link na resposta |
| `NEXT_PUBLIC_API_URL` | Sim | — | URL da API para o frontend |
| `NEXT_PUBLIC_USE_MOCK_API` | Não | `true` | Se `true`, usa repositórios mock (sem backend) |

## OpenSpec

O projeto utiliza OpenSpec como sistema de especificação. Os artefatos estão em `openspec/changes/` com 3 mudanças registradas:

| Change | Conteúdo |
|--------|----------|
| `fio-e-luz/` | Proposta original, design completo, 6 specs de funcionalidades, tasks |
| `align-backend-fio-e-luz/` | Alinhamento do backend (autenticação, repositórios, constraints) |
| `refactor-backend-clean-arch/` | Refatoração Clean Architecture + DDD, 4 specs arquiteturais |

Total: 8 especificações (specs), 3 propostas, 3 designs, 3 listas de tarefas.

## Status do Projeto

**Implementado:**
- Catálogo de riscos com busca e filtros (coleção, dificuldade, favoritos)
- Mesa de Luz Digital (Wake Lock, fullscreen, simulador de bastidor, calibração)
- Autenticação por Magic Link com JWT (simulado em dev, rotas protegidas)
- Favoritos com limite de 100 (trigger PostgreSQL + verificação frontend)
- 25+ testes unitários (Vitest) no frontend
- E2E spec com 9 cenários (Playwright)
- Testes de backend (pytest-asyncio com httpx)
- Docker Compose completo (db + api + web + pgadmin)
- CI/CD (GitHub Actions: lint + typecheck + test + build + docker push)
- Seed de dados (24 patterns, 4 coleções)

**Não implementado (documentado no OpenSpec como Fase 5 pendente):**
- IndexedDB para favoritos offline
- Background Sync no Service Worker
- Envio real de e-mail (substituído por log em desenvolvimento)

## Limitações Conhecidas

1. **PWA offline parcial**: IndexedDB para favoritos offline e Background Sync não foram implementados. O Service Worker usa cache-first para ativos estáticos.
2. **Magic Link simulado**: Em desenvolvimento, o link é exibido no log do servidor — não há envio real de e-mail.
3. **Wake Lock depende do navegador**: O suporte varia (especialmente Safari iOS). Não há fallback NoSleep.js implementado.
4. **proxy.ts não vinculado**: O guard de autenticação existe mas não está configurado como middleware do Next.js.
5. **Mensageria mock**: O MessageBroker usa print/log (não Redis ou fila real).
6. **Calibração manual**: A escala física depende de calibração manual com cartão de referência, não de detecção automática de DPI.
7. **Coleções fixas**: Não há CRUD de coleções — 4 coleções fixas via seed.
8. **Favoritos mock via localStorage**: Quando `USE_MOCK_API=true`, favoritos persistem apenas em localStorage, sem sincronização com nuvem.
9. **Testes e2e não automatizados no CI**: A spec do Playwright existe mas não integrada ao pipeline.

## Autor

Projeto acadêmico desenvolvido na disciplina de Laboratório de Progamação Web, utilizando OpenSpec como metodologia de especificação e desenvolvimento orientado por Clean Architecture, TDD e DDD.
