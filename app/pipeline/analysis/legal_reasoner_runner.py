from app.pipeline.extraction.schema import CaseData
from app.pipeline.analysis.legal_reasoner_prompt import LEGAL_REASONER_PROMPT
from app.pipeline.utils.llm_adapter import call_llm, safe_json_parse


async def run_legal_reasoner(case: CaseData) -> CaseData:
    """
    Async runner for Model 2 (Legal Reasoner).
    """
    payload = case.model_dump()
    prompt = f"""{LEGAL_REASONER_PROMPT}
FACTS:
{payload}
"""
    try:
        data = await call_llm(prompt, parser=safe_json_parse)
        if "ocena_definicji" in data:
            case.ocena_definicji = case.ocena_definicji.model_copy(update=data["ocena_definicji"])
        if "rekomendacja" in data:
            case.rekomendacja = case.rekomendacja.model_copy(update=data["rekomendacja"])
    except Exception:
        pass
    return case

