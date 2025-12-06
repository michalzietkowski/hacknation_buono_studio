import json
from app.pipeline.extraction.schema import CaseData
from app.pipeline.extraction.extractor_prompt import EXTRACTOR_PROMPT
from app.pipeline.utils.llm_adapter import call_llm, safe_json_parse


async def run_extractor(documents: dict, case_id: str) -> CaseData:
    """
    Async runner for Model 1 (Extractor).
    Uses LLM via call_llm; falls back to stub if parsing fails.
    """
    prompt = f"""{EXTRACTOR_PROMPT}
CASE_ID: {case_id}
DOCUMENTS:
{json.dumps(documents, ensure_ascii=False)[:6000]}
"""
    try:
        data = await call_llm(prompt, parser=safe_json_parse)
        return CaseData(**data)
    except Exception:
        # Fallback stub
        payload = {"case_id": case_id, "documents": documents}
        return CaseData(**payload)

