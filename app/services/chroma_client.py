from __future__ import annotations

from functools import lru_cache
from urllib.parse import urlparse

import chromadb
from chromadb import Settings as ChromaSettings

from app.core.config import get_settings


def _parse_chroma_url(url: str) -> tuple[str, int, bool]:
    parsed = urlparse(url)
    host = parsed.hostname or "localhost"
    port = parsed.port or (443 if parsed.scheme == "https" else 8000)
    use_ssl = parsed.scheme == "https"
    return host, port, use_ssl


@lru_cache()
def get_chroma_client():
    """Return a cached Chroma HTTP client configured from env."""
    settings = get_settings()
    host, port, use_ssl = _parse_chroma_url(settings.CHROMA_URL)

    auth_settings = None
    if settings.CHROMA_AUTH_TOKEN:
        auth_settings = ChromaSettings(
            chroma_client_auth_provider="chromadb.auth.token_authn.TokenAuthClientProvider",
            chroma_client_auth_credentials=settings.CHROMA_AUTH_TOKEN,
        )

    return chromadb.HttpClient(
        host=host,
        port=port,
        ssl=use_ssl,
        settings=auth_settings,
    )


def get_default_collection():
    """Get or create the default collection configured for the app."""
    client = get_chroma_client()
    settings = get_settings()
    return client.get_or_create_collection(settings.CHROMA_COLLECTION)

