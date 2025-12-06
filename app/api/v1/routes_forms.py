from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.auth import require_bearer_token
from app.schemas.accident_form import AccidentFormPayload, AccidentCreateResponse
from app.services.forms import create_accident_form

router = APIRouter(prefix="/forms", tags=["forms"])


@router.post("/accident", response_model=AccidentCreateResponse, status_code=status.HTTP_201_CREATED)
def create_accident_endpoint(
    payload: AccidentFormPayload,
    db: Session = Depends(get_db),
    _token: str = Depends(require_bearer_token),
):
    try:
        accident = create_accident_form(db, payload)
        return AccidentCreateResponse(id=accident.id)
    except HTTPException:
        raise
    except Exception as exc:
        # In production, log exc
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save accident form",
        ) from exc

