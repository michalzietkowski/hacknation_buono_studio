from fastapi import APIRouter, UploadFile, Depends, HTTPException

from app.services.pipeline import process_case

router = APIRouter(prefix="/pipeline", tags=["pipeline"])


@router.post("/run")
async def run_pipeline(case_id: str, files: list[UploadFile] = None):
    try:
        result = await process_case(files or [], case_id=case_id)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Pipeline failed") from exc

