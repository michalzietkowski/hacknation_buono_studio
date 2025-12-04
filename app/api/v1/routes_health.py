from fastapi import APIRouter
from app.core.config import get_settings

router = APIRouter(prefix="/health", tags=["health"])
settings = get_settings()


@router.get("/")
async def health_check():
    return {
        "status": "ok",
        "env": settings.ENV,
    }

