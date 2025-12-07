import json

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.schemas.pipeline import DocumentUploadMeta, PipelineRunResponse
from app.services.case_service import (
    create_case,
    mark_case_failed,
    persist_documents,
    run_pipeline_for_case,
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
        stored_docs = await persist_documents(db, case, files, meta)
        result = await run_pipeline_for_case(db, case, stored_docs)
        return PipelineRunResponse(case_id=str(case.id), status=case.status, result=result)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except HTTPException:
        raise
    except Exception as exc:
        mark_case_failed(db, case, str(exc))
        raise HTTPException(status_code=500, detail="Pipeline failed") from exc

