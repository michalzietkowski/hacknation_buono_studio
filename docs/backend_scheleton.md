# Backend skeleton specification (FastAPI + uv + Docker + Postgres + LangChain)

Goal: Have a minimal but complete backend that can be started quickly with:
- `uv run uvicorn app.main:app --reload` for local dev
- `docker compose up --build` for full stack (API + DB)

The backend uses:
- FastAPI
- uv for dependency management
- PostgreSQL as DB
- LangChain / LangGraph for LLM workflows (initially a simple chat endpoint)
- Docker + docker-compose for running the stack

---

## Target file structure (minimal initial version)

Create the following files and folders:

- `pyproject.toml`
- `app/__init__.py`
- `app/main.py`
- `app/api/__init__.py`
- `app/api/v1/__init__.py`
- `app/api/v1/routes_health.py`
- `app/api/v1/routes_chat.py`
- `app/core/__init__.py`
- `app/core/config.py`
- `app/core/db.py`
- `app/schemas/__init__.py`
- `app/schemas/chat.py`
- `app/llm/__init__.py`
- `app/llm/chains/__init__.py`
- `app/llm/chains/basic_chat.py`
- `Dockerfile`
- `docker-compose.yml`
- `tests/__init__.py`
- `tests/test_health.py`

You may add small helper files if needed, but keep the structure simple.

---

## pyproject.toml

Use a uv-compatible `pyproject.toml` (PEP 621). It should:

- Define a project named e.g. `"hacknation-backend"`.
- Use Python `>=3.11`.
- Include dependencies at least:
  - `fastapi`
  - `uvicorn[standard]`
  - `pydantic`
  - `sqlalchemy` (or `sqlmodel`, choose one and use it consistently)
  - `psycopg[binary]` (or similar Postgres driver)
  - `python-dotenv` (optional, for loading env)
  - `langchain` and/or `langgraph`
  - `httpx` (optional, for outbound HTTP)
  - `pytest` and `pytest-asyncio` for tests

It should work with `uv sync` and `uv run`.

---

## app/main.py

Implement:

- `FastAPI` application instance.
- Include API routers from `app.api.v1`:
  - health router from `routes_health.py`
  - chat router from `routes_chat.py`
- Basic CORS middleware allowing local frontend origins (e.g. `http://localhost:3000`).
- Use a configurable API prefix, default `/api/v1`.

Expose `app` as the FastAPI instance, e.g.:

```python
app = create_app()

or just:

app = FastAPI(...)

but make sure uvicorn app.main:app works.
app/core/config.py

Implement configuration using Pydantic BaseSettings:

    Fields:

        ENV (default "local")

        DEBUG (bool, default True in local)

        API_PREFIX (default "/api/v1")

        FRONTEND_ORIGIN (default "http://localhost:3000")

        DATABASE_URL (default something like postgresql+psycopg://user:password@db:5432/app for docker-compose)

        OPENAI_API_KEY (optional, environment-based)

        Any other LLM-related keys can be optional for now.

Provide a function or singleton to access settings easily, e.g. get_settings().
app/core/db.py

Implement SQLAlchemy (or SQLModel) DB integration:

    Create an engine based on DATABASE_URL from settings.

    Create a SessionLocal or equivalent.

    Provide a FastAPI dependency get_db() that yields a DB session and closes it after the request.

No need for models yet – just the infrastructure.
app/api/v1/routes_health.py

Implement a simple health-check endpoint:

    Router with:

        prefix: "/health"

        tag: "health"

    GET / endpoint that returns a simple JSON, e.g.:

        {"status": "ok"} and maybe app version/env from settings.

This endpoint should be covered by tests.
app/schemas/chat.py

Define Pydantic models for the chat endpoint:

    ChatRequest with:

        message: str

        optional history: list[str] or similar.

    ChatResponse with:

        reply: str

        optional meta: dict for extra info.

Keep it simple and easy to extend later.
app/llm/chains/basic_chat.py

Implement a minimal LLM integration placeholder:

    For now, it can be:

        Either a real LangChain chain calling an LLM (if API key is set),

        Or a stub that returns a deterministic response in absence of keys (useful for local/dev).

Export a function like:

async def run_basic_chat(message: str, history: list[str] | None = None) -> str:
    ...

    This function will be used by the FastAPI chat route.

    It should be easy to later replace the internal implementation with LangGraph.

app/api/v1/routes_chat.py

Implement a chat endpoint:

    Router with:

        prefix: "/chat"

        tag: "chat"

    POST /completion endpoint:

        Request body: ChatRequest

        Response: ChatResponse

        Internally:

            Calls run_basic_chat(...) from app.llm.chains.basic_chat.

            Returns the reply in the ChatResponse.

Handle errors by returning an HTTP 500 with a simple error message if something goes wrong.
Dockerfile

Create a Dockerfile for the backend:

    Base image: python:3.12-slim (or 3.11-slim).

    Install uv.

    Set WORKDIR to /app.

    Copy pyproject.toml (and uv.lock if present).

    Run uv sync --frozen (or similar) to install dependencies.

    Copy the app/ directory.

    Expose port 8000.

    Use CMD that runs uvicorn via uv, for example:

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

docker-compose.yml

Create a docker-compose.yml with at least two services:

    api:

        Builds from the local Dockerfile.

        Depends on db.

        Uses environment variables (can reference a .env file).

        Exposes port 8000:8000.

    db:

        Uses official postgres image (e.g. postgres:16).

        Environment variables for:

            POSTGRES_USER

            POSTGRES_PASSWORD

            POSTGRES_DB

        Exposes port 5432 (optional).

        Uses a named volume for data.

Make sure api connects to db using the same connection string as expected by DATABASE_URL in config.
tests/test_health.py

Implement a simple pytest test that:

    Uses FastAPI TestClient.

    Calls GET /api/v1/health/.

    Asserts HTTP 200 and {"status": "ok"} (or similar agreed shape).

Tests should be runnable with:

uv run pytest

Developer commands (for README or docs)

Make sure the generated scaffold works with:

    Install deps (local):

        uv sync

    Run dev server:

        uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

    Run tests:

        uv run pytest

    Run with Docker:

        docker compose up --build