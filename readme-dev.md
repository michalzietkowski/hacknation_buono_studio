# Hacknation – developer guide

## Stack
- Backend: FastAPI + LangChain/LangGraph, uv for deps, Docker/Docker Compose.
- Frontend: React + Vite (TypeScript), npm, Docker/nginx for production build.
- DB: Postgres (via docker-compose).

## Prerequisites
- Docker + Docker Compose
- Node 18+ / npm (for local frontend dev)
- Python 3.11+ with uv installed (for backend)

## Setup & local dev
```bash
# backend deps
uv sync

# frontend deps
cd frontend && npm install
```

Run services:
- Backend (hot reload): `uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- Frontend (Vite dev): `cd frontend && npm run dev -- --host --port 3000`
- Full stack with DB (no hot reload for frontend): `docker compose up --build`

## Environment
- Backend: `.env` (defaults in `app/core/config.py`)
  - `DATABASE_URL` (compose default: `postgresql+psycopg://user:password@db:5432/app`)
  - `OPENAI_API_KEY` (needed for real LLM responses)
  - `FRONTEND_ORIGIN` (default `http://localhost:3000`)
- Frontend: `.env.example` → `.env.local`
  - `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`; compose build uses `http://api:8000/api/v1`)

## Render deploys
- Backend workflow: `.github/workflows/deploy-render.yml` expects `RENDER_API_KEY`, `RENDER_SERVICE_ID`, optional `RENDER_BRANCH`.
- Frontend workflow: `.github/workflows/deploy-frontend-render.yml` expects `RENDER_FRONTEND_API_KEY`, `RENDER_FRONTEND_SERVICE_ID`, optional `RENDER_FRONTEND_BRANCH`.

## Make targets
- `make backend-dev` – run FastAPI with uvicorn (hot reload)
- `make frontend-dev` – run Vite dev server
- `make frontend-build` – build static assets
- `make compose-up` / `make compose-down` – full stack via Docker Compose
- `make backend-test` – run pytest
- `make migrate` – apply Alembic migrations (`uv run alembic upgrade head`)
- `make alembic-revision msg="..."` – autogenerate migration
- `make compose-up-migrate` – uruchom db, wykonaj migracje, podnieś api+frontend

## Schemat bazy (ZUS wypadki)
- Dokument: `docs/db_schema.md` – ERD, tabele (multi-tenant), mapowanie SQLAlchemy i notatki migracyjne.
- Modele dodane w `app/models/` (Base + enumy + wypadki, pytania dynamiczne, załączniki).
- Migracje (po konfiguracji Alembic):
  - `uv run alembic revision --autogenerate -m "init accident schema"`
  - `uv run alembic upgrade head`

## Migracje lokalnie (docker compose)
1. `docker compose up -d --build db`
2. `docker compose build api`
3. `docker compose run --rm api uv run alembic upgrade head`
4. `docker compose up --build api frontend`
- Skrótowo: `make compose-up-migrate`

## Render (deploy + migracje)
- Ustaw zmienne środowiskowe w Render:
  - `DATABASE_URL` (connection string do Render Postgres)
  - `ENV=render`, `DEBUG=false` (opcjonalnie)
- W Render add-on Postgres utwórz bazę (pole id, UUID itp. nie wymagają zmian).
- W sekcji deploy hooks ustaw komendę migracji: `uv run alembic upgrade head` (run after build).

