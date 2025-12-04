from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
from functools import lru_cache

from app.core.config import get_settings


@lru_cache()
def get_engine():
    """Lazy initialization of database engine."""
    settings = get_settings()
    # For psycopg3, use pool_pre_ping to verify connections
    # But disable it initially to avoid premature connections
    return create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=False,  # Disable to avoid premature connections
        echo=settings.DEBUG  # Log SQL queries in debug mode
    )


@lru_cache()
def get_session_local():
    """Lazy initialization of session maker."""
    return sessionmaker(autocommit=False, autoflush=False, bind=get_engine())


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for database session."""
    SessionLocal = get_session_local()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

