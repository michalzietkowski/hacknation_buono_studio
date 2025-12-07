from typing import Any, Optional

from pydantic import BaseModel


class DocumentUploadMeta(BaseModel):
    id: str
    name: str
    type: str
    form: str
    otherDescription: Optional[str] = None


class PipelineRunResponse(BaseModel):
    case_id: str
    status: str
    stage: Optional[str] = None
    result: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}


class PipelineStatusResponse(BaseModel):
    case_id: str
    status: str
    stage: Optional[str] = None
    result: Optional[dict[str, Any]] = None
    error: Optional[str] = None

    model_config = {"from_attributes": True}

