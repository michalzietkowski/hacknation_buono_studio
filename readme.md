# Hacknation (judges overview)

Lovable/React frontend + FastAPI backend with LangChain-enabled chat. Primary demo: send a message from the UI to `/api/v1/chat/completion` and show the LLM reply.

## How to demo locally

```bash
docker compose up --build
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:8000 (API prefix `/api/v1`)
- Vector DB: Chroma at http://localhost:8001 (from `docker compose up`)

Environment defaults are embedded for local compose. To enable real LLM responses, provide `OPENAI_API_KEY` in your environment (e.g., export before `docker compose up`).

## New demo: form support chat
- Endpoint: `POST /api/v1/assist/field` with `field_id`, `message`, optional `form_state` and prior `history`; returns a guided reply to help fill the ZUS form fields.

## Deploys

- Backend Render deploy: `.github/workflows/deploy-render.yml` (secrets: `RENDER_API_KEY`, `RENDER_SERVICE_ID`, optional `RENDER_BRANCH`).
- Frontend Render deploy: `.github/workflows/deploy-frontend-render.yml` (secrets: `RENDER_FRONTEND_API_KEY`, `RENDER_FRONTEND_SERVICE_ID`, optional `RENDER_FRONTEND_BRANCH`).
- Chroma Render deploy: create a Web Service from image `chromadb/chroma:0.5.23`, port `8000`, persistent disk 25GB at `/chroma/.chroma`, env `CHROMA_SERVER_HTTP_PORT=8000` and `ANONYMIZED_TELEMETRY=false`; health check `GET /api/v1/heartbeat`. Point backend env `CHROMA_URL` to this URL (plus `CHROMA_AUTH_TOKEN` if you enable token auth).

Both workflows trigger on pushes to `main` and via manual dispatch.

## Nowa funkcja (ZUS wypadki)
- Przygotowany schemat bazy dla zgłoszeń wypadków i wyjaśnień poszkodowanego (multi-tenant, załączniki, pytania warunkowe) – patrz `docs/db_schema.md`.
- Backend posiada gotowe modele SQLAlchemy (angielskie atrybuty, polskie nazwy kolumn); po migracji będzie można dodać API do wypełniania formularzy i generowania zgłoszeń do ZUS.
- Migracje Alembic: uruchom `uv run alembic upgrade head` (lokalnie lub jako post-deploy hook w Render z poprawnym `DATABASE_URL`).
- Upload i analiza dokumentów wypadku: na froncie wybierz pliki → „Uruchom analizę”; wysyłka trafia na `POST /api/v1/pipeline/run` (multipart), pliki zapisują się w bazie, a backend uruchamia pipeline (OCR + ekstrakcja + opinia) i zwraca `case_id` wraz z wynikiem.
- Logi pipeline (OCR, klasyfikacja, generacja) lecą na stdout; w Dockerze podejrzyj `docker compose logs -f api`. Postęp na froncie: `GET /api/v1/pipeline/case/{id}/status` zwraca `status` i `stage`.

