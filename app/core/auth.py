from fastapi import Header, HTTPException, status

from app.core.config import get_settings


def require_bearer_token(authorization: str | None = Header(None)) -> str:
    """
    Simple bearer-token guard.
    - If API_BEARER_TOKEN is set, require a matching Bearer header.
    - If API_BEARER_TOKEN is NOT set, allow requests without a token (no-op).
    """
    settings = get_settings()
    if not settings.API_BEARER_TOKEN:
        return "public"

    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = authorization.split(" ", 1)[1].strip()
    if token != settings.API_BEARER_TOKEN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    return token

