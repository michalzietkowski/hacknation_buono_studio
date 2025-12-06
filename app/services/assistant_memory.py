from __future__ import annotations

import datetime as dt
import uuid
from typing import Any, Dict, List, Tuple

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models.assistant_session import AssistantSession

settings = get_settings()


def _cap_history(history: List[Dict[str, Any]], limit: int) -> List[Dict[str, Any]]:
    if limit <= 0:
        return history
    return history[-limit:]


def _merge_form_state(stored: Dict[str, Any] | None, incoming: Dict[str, Any] | None) -> Dict[str, Any]:
    merged = dict(stored or {})
    if incoming:
        merged.update(incoming)
    return merged


def load_session(db: Session, session_id: str) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    rec = (
        db.query(AssistantSession.history, AssistantSession.form_state)
        .filter(AssistantSession.session_id == session_id)
        .one_or_none()
    )
    if not rec:
        return [], {}
    history, form_state = rec
    return history or [], form_state or {}


def save_session(
    db: Session,
    session_id: str,
    history: List[Dict[str, Any]],
    form_state: Dict[str, Any],
) -> None:
    now = dt.datetime.now(dt.timezone.utc)
    capped_history = _cap_history(history, settings.ASSIST_HISTORY_LIMIT)
    stmt = insert(AssistantSession).values(
        id=uuid.uuid4(),
        session_id=session_id,
        history=capped_history,
        form_state=form_state or {},
        updated_at=now,
    )
    stmt = stmt.on_conflict_do_update(
        index_elements=[AssistantSession.session_id],
        set_={
            "history": capped_history,
            "form_state": form_state or {},
            "updated_at": now,
        },
    )
    db.execute(stmt)
    db.commit()


def merge_state(
    stored_history: List[Dict[str, Any]],
    stored_form_state: Dict[str, Any],
    incoming_history: List[Dict[str, Any]] | None,
    incoming_form_state: Dict[str, Any] | None,
) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
    merged_history = list(stored_history or [])
    if incoming_history:
        merged_history.extend(incoming_history)
    merged_form_state = _merge_form_state(stored_form_state, incoming_form_state)
    return merged_history, merged_form_state

