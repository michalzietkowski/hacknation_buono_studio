import sys
from pathlib import Path

from alembic import context
from sqlalchemy import engine_from_config, pool
from sqlalchemy.engine.url import make_url


# Ensure app package is importable
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.append(str(BASE_DIR))

from app.core.config import get_settings  # noqa: E402
from app.models.base import Base  # noqa: E402

config = context.config
settings = get_settings()

# Normalize DB URL to use psycopg driver if user passed bare postgres/postgresql
raw_url = settings.DATABASE_URL
parsed = make_url(raw_url)
if parsed.drivername in ("postgres", "postgresql"):
    parsed = parsed.set(drivername="postgresql+psycopg")
normalized_url = parsed.render_as_string(hide_password=False)

# Override sqlalchemy.url from env (after normalization)
config.set_main_option("sqlalchemy.url", normalized_url)
target_metadata = Base.metadata


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()

