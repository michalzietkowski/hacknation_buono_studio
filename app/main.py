from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.api.v1.routes_health import router as health_router
from app.api.v1.routes_chat import router as chat_router
from app.api.v1.routes_agent_chat import router as agent_chat_router
from app.api.v1.routes_forms import router as forms_router

settings = get_settings()

app = FastAPI(
    title="Hacknation Backend",
    description="FastAPI backend with LangChain integration",
    version="0.1.0",
    debug=settings.DEBUG,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(chat_router, prefix=settings.API_PREFIX)
app.include_router(agent_chat_router, prefix=settings.API_PREFIX)
app.include_router(forms_router, prefix=settings.API_PREFIX)


