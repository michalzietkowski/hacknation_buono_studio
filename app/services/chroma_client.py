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

    # Disable noisy/buggy telemetry if present
    try:
        import chromadb.telemetry.product.posthog as _ph_module

        _ph_module.posthog.capture = lambda *args, **kwargs: None  # type: ignore
    except Exception:
        pass

    client_settings = ChromaSettings(anonymized_telemetry=False)
    if settings.CHROMA_AUTH_TOKEN:
        client_settings.chroma_client_auth_provider = (
            "chromadb.auth.token_authn.TokenAuthClientProvider"
        )
        client_settings.chroma_client_auth_credentials = settings.CHROMA_AUTH_TOKEN

    return chromadb.HttpClient(
        host=host,
        port=port,
        ssl=use_ssl,
        settings=client_settings,
    )


def get_default_collection():
    """Get or create the default collection configured for the app."""
    client = get_chroma_client()
    settings = get_settings()
    return client.get_or_create_collection(settings.CHROMA_COLLECTION)

