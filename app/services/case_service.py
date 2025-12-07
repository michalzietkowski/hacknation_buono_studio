from io import BytesIO
from typing import Callable, List, Sequence

from fastapi import UploadFile
from starlette.datastructures import Headers
from sqlalchemy.orm import Session

from app.models.analysis import AnalysisCase, AnalysisDocument
from app.schemas.pipeline import DocumentUploadMeta
from app.services.pipeline import process_case
from app.core.db import get_session_local


def create_case(db: Session, *, source_case_id: str | None = None) -> AnalysisCase:
    case = AnalysisCase(status="processing", source_case_id=source_case_id, result={"stage": "received"})
    db.add(case)
    db.commit()
    db.refresh(case)
    return case


async def persist_documents(
    db: Session,
    case: AnalysisCase,
    files: Sequence[UploadFile],
    meta: Sequence[DocumentUploadMeta],
) -> List[AnalysisDocument]:
    if len(files) != len(meta):
        raise ValueError("Files count does not match metadata count")
    if not files:
        raise ValueError("No files provided")

    documents: list[AnalysisDocument] = []
    for upload, meta_item in zip(files, meta):
        content = await upload.read()
        document = AnalysisDocument(
            case_id=case.id,
            file_name=meta_item.name or upload.filename,
            mime_type=upload.content_type or "application/octet-stream",
            size_bytes=len(content),
            form=meta_item.form,
            doc_type=meta_item.type,
            other_description=meta_item.otherDescription,
            blob=content,
            meta={"client_id": meta_item.id},
        )
        db.add(document)
        documents.append(document)

    db.commit()
    for document in documents:
        db.refresh(document)
    return documents


async def run_pipeline_for_case(
    db: Session,
    case: AnalysisCase,
    documents: Sequence[AnalysisDocument],
) -> dict:
    def progress(stage: str, extra: dict | None = None) -> None:
        payload: dict = {"stage": stage}
        if extra:
            payload.update(extra)
        case.status = "processing"
        case.result = payload
        db.commit()
        db.refresh(case)

    upload_files: list[UploadFile] = []
    for document in documents:
        headers = Headers({"content-type": document.mime_type}) if document.mime_type else None
        upload_files.append(
            UploadFile(
                file=BytesIO(document.blob),
                filename=document.file_name,
                headers=headers,
            )
        )

    result = await process_case(upload_files, case_id=str(case.id), progress_cb=progress)
    result_with_stage = {**result, "stage": "completed"}
    case.status = "completed"
    case.result = result_with_stage
    db.commit()
    db.refresh(case)
    return result_with_stage


def mark_case_failed(db: Session, case: AnalysisCase | None, error: str) -> None:
    if case is None:
        return
    case.status = "failed"
    case.error = error
    db.commit()


async def run_pipeline_for_case_id(case_id: str, session_factory: Callable[[], Session] | None = None) -> None:
    """
    Background-safe runner: opens its own DB session, loads documents, and runs the pipeline.
    """
    SessionLocal = session_factory or get_session_local()
    db: Session | None = None
    case: AnalysisCase | None = None
    try:
        db = SessionLocal()
        case = db.get(AnalysisCase, case_id)
        if not case:
            return
        documents = db.query(AnalysisDocument).filter(AnalysisDocument.case_id == case.id).all()
        await run_pipeline_for_case(db, case, documents)
    except Exception as exc:  # pragma: no cover - background path
        if db:
            mark_case_failed(db, case, str(exc))
    finally:
        if db:
            db.close()

