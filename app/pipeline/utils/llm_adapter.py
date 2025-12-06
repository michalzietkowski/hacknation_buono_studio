import json
from typing import Optional, Callable

from app.llm.chains.basic_chat import run_basic_chat


class LLMJsonError(Exception):
    pass


async def call_llm(prompt: str, parser: Optional[Callable[[str], dict]] = None) -> str | dict:
    """
    Thin async adapter over app.llm basic_chat.
    If parser is provided, parses output to dict (raises LLMJsonError on failure).
    """
    resp = await run_basic_chat(prompt)
    if parser:
        try:
            return parser(resp)
        except Exception as exc:
            raise LLMJsonError(f"Failed to parse LLM output: {exc}") from exc
    return resp


def safe_json_parse(text: str) -> dict:
    return json.loads(text)

