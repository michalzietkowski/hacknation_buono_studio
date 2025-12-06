from fastapi import APIRouter, HTTPException

from app.schemas.chat import FieldAssistRequest, FieldAssistResponse
from app.llm.agent.form_assistant import run_field_assistant

router = APIRouter(prefix="/assist", tags=["assist"])


@router.post("/field", response_model=FieldAssistResponse)
async def assist_field(payload: FieldAssistRequest) -> FieldAssistResponse:
    try:
        reply = await run_field_assistant(
            field_id=payload.field_id,
            user_input=payload.message,
            form_state=payload.form_state,
            chat_history=[msg.model_dump() for msg in (payload.history or [])],
        )
        return FieldAssistResponse(reply=reply, meta={})
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

