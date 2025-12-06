.PHONY: backend-dev backend-test frontend-install frontend-dev frontend-build compose-up compose-down

backend-dev:
	uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

backend-test:
	uv run pytest

alembic-revision:
	uv run alembic revision --autogenerate -m "$(msg)"

migrate:
	uv run alembic upgrade head

frontend-install:
	cd frontend && npm install

frontend-dev:
	cd frontend && npm run dev -- --host --port 3000

frontend-build:
	cd frontend && npm run build

compose-up:
	docker compose up --build

compose-down:
	docker compose down

compose-up-migrate:
	docker compose up -d --build db
	docker compose build api
	docker compose run --rm api uv run alembic upgrade head
	docker compose up --build api frontend

