import json
import asyncio

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session, sessionmaker

from app.core.db import get_db
from app.models.analysis import AnalysisCase
from app.schemas.pipeline import DocumentUploadMeta, PipelineRunResponse, PipelineStatusResponse
from app.services.case_service import (
    create_case,
    mark_case_failed,
    persist_documents,
    run_pipeline_for_case,
    run_pipeline_for_case_id,
)

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.post("/run", response_model=PipelineRunResponse, status_code=status.HTTP_201_CREATED)
async def run_pipeline_endpoint(
    documents_meta: str = Form(..., description="JSON array with document metadata"),
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    try:
        parsed = json.loads(documents_meta)
        meta = [DocumentUploadMeta.model_validate(item) for item in parsed]
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid documents_meta payload") from exc

    case = None
    try:
        case = create_case(db)
        await persist_documents(db, case, files, meta)
        # Reuse current connection/engine for background session (works with test overrides)
        bind = db.get_bind()
        session_factory = sessionmaker(autocommit=False, autoflush=False, bind=bind)
        asyncio.create_task(run_pipeline_for_case_id(str(case.id), session_factory=session_factory))
        return PipelineRunResponse(case_id=str(case.id), status=case.status, stage="received")
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        mark_case_failed(db, case, str(exc))
        raise HTTPException(status_code=500, detail="Pipeline failed") from exc


@router.get("/case/{case_id}/status", response_model=PipelineStatusResponse)
def get_pipeline_status(case_id: str, db: Session = Depends(get_db)):
    case: AnalysisCase | None = db.get(AnalysisCase, case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    stage = None
    result = None
    if isinstance(case.result, dict):
        stage = case.result.get("stage")
        result = case.result if case.status == "completed" else None

    return PipelineStatusResponse(
        case_id=str(case.id),
        status=case.status,
        stage=stage,
        result=result,
        error=case.error,
    )

