from app.core.config import get_settings

settings = get_settings()


async def run_basic_chat(message: str, history: list[str] | None = None) -> str:
    """
    Minimal LLM chat function.
    
    If OPENAI_API_KEY is set, this could call a real LLM.
    For now, it returns a stub response for development.
    """
    if settings.OPENAI_API_KEY:
        # TODO: Implement real LangChain chain here
        # For now, return a placeholder
        return f"LLM response to: {message} (API key is set, but not implemented yet)"
    else:
        # Stub response for local development
        return f"Echo: {message} (stub mode - set OPENAI_API_KEY for real LLM)"


