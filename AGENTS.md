# Fio & Luz — AGENTS.md

## Project

"Fio & Luz" — embroidery pattern support system. Monorepo with `backend/` (FastAPI) and `frontend/` (Next.js).

## Backend (`backend/`)

- **Stack**: Python 3.10, FastAPI, SQLModel (SQLAlchemy 2.0), asyncpg, PostgreSQL, pytest-asyncio
- **Architecture**: Strict Clean Architecture + DDD. Dependency direction: `adapters/` → `use_cases/` → `domain/`. No framework imports inside `domain/`. Use cases orchestrate only (no business logic).
- **Domain entities** use dataclasses with fail-fast `__post_init__` validation (e.g. difficulty between 1–5).
- **Persistence**: SQLModel ORM models in `adapters/persistence/sqlmodel/`; domain entities are never ORM models. Convert via `_to_entity` methods.
- **Async**: 100% async, no blocking IO.

### Commands

```bash
uvicorn main:app --reload          # dev server (port 8000)
pytest                             # run all tests (requires PostgreSQL)
pytest tests/test_foo.py -v        # single test file
pytest --cov -vv                   # with coverage
ruff check .                       # lint
mypy . --exclude .venv/            # typecheck
```

### Testing & Quality

- Config in `pyproject` (pytest, ruff, mypy).
- Tests require a running PostgreSQL (use `docker compose up db` or set `DATABASE_URL`).
- `conftest.py` truncates tables (`TRUNCATE ... CASCADE`) before each test.
- Test client uses `httpx.AsyncClient` with DI override of `get_session`.

## Frontend (`frontend/`)

- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind v4 (`@tailwindcss/postcss`), shadcn/ui (base-nova style), React Query, Vitest, Playwright
- **Architecture**: Clean-Architecture-inspired layers — `src/domain/`, `src/application/` (use cases), `src/infrastructure/` (HTTP, repos, mappers), `src/presentation/` (hooks, providers)
- **Component location**: `components/` (not `src/components/`). Path alias `@/` maps to project root.
- **Auth**: Magic links (no passwords). `proxy.ts` exists as auth guard skeleton but is **not** wired as Next.js middleware.
- **Dev data**: `MockPatternRepository` and `MockAuthRepository` in `src/infrastructure/repositories/` — the app runs without a real backend during development.
- **Next.js 16**: This is NOT the Next.js you know — breaking changes exist. Read `node_modules/next/dist/docs/` before writing code.

### Commands

```bash
npm run dev             # dev server (port 3000)
npm run build           # production build (standalone output)
npm run lint            # ESLint
npm test                # Vitest (unit/integration)
npm run test:coverage   # Vitest with coverage (threshold: 70%)
npm run test:e2e        # Playwright (no e2e tests written yet)
npm run typecheck       # tsc --noEmit
```

### Testing (Vitest)

- Environment: `jsdom`, globals enabled.
- Setup file: `vitest.setup.ts` mocks `matchMedia` and `ResizeObserver` (needed for shadcn components).
- Components under test should be wrapped in `QueryProvider` (from `src/presentation/providers/QueryProvider`).

## Docker Compose

```bash
docker compose up --build   # starts db, api, web
```

- `db`: PostgreSQL 15 Alpine (port 5432)
- `api`: FastAPI (port 8000), multi-stage Docker image (no volume mount — use `uvicorn main:app --reload` for local dev)
- `web`: Next.js (port 3000), static build (no volume mount for dev)
- Default creds: `fioeluz` / `fioeluz_pass` / `fioeluz_db`

## Project-wide conventions

- **Frontend only**: TypeScript in all files, shadcn/ui components only, Tailwind for styling, lucide-react for icons
- **Backend only**: FastAPI routes in `adapters/api/routes/`, commit transaction in API layer, no commit inside repositories
- **openspec/**: Spec-driven project config. `openspec/config.yaml` is the authoritative spec reference.

## Spec-driven workflow (openspec)

This project uses OpenSpec. Changes should follow the propose → apply → archive cycle. Pipeline config in `openspec/config.yaml`; changes stored in `openspec/changes/`.

## Deploy & Production

### Environment variables

| Variable | Where | Required | Example |
|---|---|---|---|
| `DATABASE_URL` | Render (API) | Yes | `postgresql+asyncpg://user:pass@neon.tech/db` |
| `SECRET_KEY` | Render (API) | Yes | `openssl rand -hex 32` |
| `CORS_ORIGINS` | Render (API) | Yes | `https://fio-e-luz.vercel.app` |
| `FRONTEND_URL` | Render (API) | Yes | `https://fio-e-luz.vercel.app` |
| `ENVIRONMENT` | Render (API) | Yes | `production` |
| `JWT_EXPIRE_HOURS` | Render (API) | No | `24` |
| `SQL_ECHO` | Render (API) | No | `false` |
| `NEXT_PUBLIC_API_URL` | Vercel (Frontend) | Yes | `https://fioeluz-api.onrender.com` |
| `NEXT_PUBLIC_USE_MOCK_API` | Vercel (Frontend) | Yes | `false` |

### Seed database (post-deploy)

Tables are created automatically on API startup. Seed data must be executed manually once after deploy:

```bash
# Docker (local or self-hosted):
docker compose exec api python seed_db.py

# Render (production): connect via Render Shell or a one-off task:
python seed_db.py
```

