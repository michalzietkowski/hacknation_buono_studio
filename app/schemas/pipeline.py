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
    result: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}

