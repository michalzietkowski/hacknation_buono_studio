from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.chat import FieldAssistRequest, FieldAssistResponse
from app.llm.agent.form_assistant import run_field_assistant
from app.core.db import get_db
from app.core.config import get_settings
from app.services.assistant_memory import load_session, save_session, merge_state, _cap_history

router = APIRouter(prefix="/assist", tags=["assist"])
settings = get_settings()


@router.post("/field", response_model=FieldAssistResponse)
async def assist_field(
    payload: FieldAssistRequest,
    db: Session = Depends(get_db),
) -> FieldAssistResponse:
    try:
        stored_history, stored_form_state = ([], {})
        if payload.session_id:
            stored_history, stored_form_state = load_session(db, payload.session_id)

        incoming_history = [msg.model_dump() for msg in (payload.history or [])]
        merged_history, merged_form_state = merge_state(
            stored_history=stored_history,
            stored_form_state=stored_form_state,
            incoming_history=incoming_history,
            incoming_form_state=payload.form_state,
        )

        reply = await run_field_assistant(
            field_id=payload.field_id,
            user_input=payload.message,
            form_state=merged_form_state,
            chat_history=_cap_history(merged_history, settings.ASSIST_HISTORY_LIMIT),
        )

        updated_history = merged_history + [
            {"role": "user", "content": payload.message},
            {"role": "assistant", "content": reply},
        ]

        if payload.session_id:
            save_session(
                db,
                session_id=payload.session_id,
                history=updated_history,
                form_state=merged_form_state,
            )

        return FieldAssistResponse(reply=reply, meta={})
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

