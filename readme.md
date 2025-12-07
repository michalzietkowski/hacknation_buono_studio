# Hacknation (short overview)

React + FastAPI + LangChain. Umożliwia zgłoszenie wypadku do ZUS: uploadujesz dokumenty → pipeline (OCR → klasyfikacja → ekstrakcja → opinia) → gotowe dane + generowany dokument.

## Jak uruchomić demo lokalnie
```bash
docker compose up --build
```
- Frontend: http://localhost:3000  
- Backend: http://localhost:8000 (`/api/v1`)  
- Chroma: http://localhost:8001  
Opcjonalnie ustaw `OPENAI_API_KEY`, jeśli chcesz prawdziwe odpowiedzi LLM.

## Co pokazujemy
- Formularz z krokami i generacją dokumentu zgłoszenia.
- Upload + analiza dokumentów: `POST /api/v1/pipeline/run` zwraca `case_id`; status: `GET /api/v1/pipeline/case/{id}/status`.
- Asystent pól formularza: `POST /api/v1/assist/field`.

## Jak wdrożyć (krótko)
- Produkcja przez Render:  
  - Backend workflow `.github/workflows/deploy-render.yml` (secrets: `RENDER_API_KEY`, `RENDER_SERVICE_ID`).  
  - Frontend workflow `.github/workflows/deploy-frontend-render.yml` (secrets: `RENDER_FRONTEND_API_KEY`, `RENDER_FRONTEND_SERVICE_ID`).  
  - Chroma: obraz `chromadb/chroma:0.5.23`, port 8000, dysk 25GB, healthcheck `GET /api/v1/heartbeat`.
- Migracje DB: `uv run alembic upgrade head` (lokalnie lub jako hook po deployu; wymagany `DATABASE_URL`).

