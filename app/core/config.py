from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    ENV: str = "local"
    DEBUG: bool = True
    API_PREFIX: str = "/api/v1"
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    API_BEARER_TOKEN: str | None = None
    
    # Database (default for docker-compose; override with env var for local)
    DATABASE_URL: str = "postgresql+psycopg://user:password@localhost:5432/app"
    
    # LLM
    OPENAI_API_KEY: str | None = None
    ASSIST_HISTORY_LIMIT: int = 30
    
    # LangSmith / LangChain tracing
    LANGCHAIN_TRACING_V2: str | None = None
    LANGCHAIN_API_KEY: str | None = None
    LANGCHAIN_PROJECT: str = "hacknation-backend"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()

