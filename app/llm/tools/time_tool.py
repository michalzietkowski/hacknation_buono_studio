from datetime import datetime, timezone
from langchain_core.tools import tool


@tool
def get_server_time() -> str:
    """Return the current server time in ISO 8601 format (UTC)."""
    return datetime.now(timezone.utc).isoformat()


