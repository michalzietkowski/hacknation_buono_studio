from app.pipeline.extraction.schema import CaseData
from app.pipeline.generation.opinion_generator_prompt import OPINION_GENERATOR_PROMPT
from app.pipeline.utils.llm_adapter import call_llm


async def generate_opinion(case: CaseData) -> str:
    prompt = f"""{OPINION_GENERATOR_PROMPT}
                FACTS:
                {case.model_dump()}
                """
    try:
        resp = await call_llm(prompt)
        return str(resp)
    except Exception:
        return "Opinia (stub): wymagane podpięcie LLM."

