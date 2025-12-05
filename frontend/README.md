# Hacknation frontend

React + Vite (TypeScript) UI that calls the FastAPI backend. Environment is driven by `VITE_API_BASE_URL` (default `http://localhost:8000/api/v1`).

## Quickstart

```bash
npm install
npm run dev -- --host --port 3000
```

## Environment

- Copy `.env.example` to `.env.local` (or export) and set `VITE_API_BASE_URL` if your backend URL differs.

## Docker (prod-style)

The `frontend/Dockerfile` builds static assets and serves them via nginx. `docker compose up --build` (from repo root) will build and expose the app on port 3000 with `VITE_API_BASE_URL=http://api:8000/api/v1` inside the compose network.
