from pydantic import BaseModel
from typing import Optional, Any, Dict, List


class ChatRequest(BaseModel):
    message: str
    history: Optional[list[str]] = None


class ChatResponse(BaseModel):
    reply: str
    meta: Optional[dict] = None


# Agent-specific schemas
class AgentMessage(BaseModel):
    role: str
    content: str


class AgentChatRequest(BaseModel):
    message: str
    history: Optional[List[AgentMessage]] = None


class AgentChatResponse(BaseModel):
    reply: str
    meta: Dict[str, Any] = {}


class FieldAssistRequest(BaseModel):
    field_id: str
    message: str
    form_state: Optional[Dict[str, Any]] = None
    history: Optional[List[AgentMessage]] = None


class FieldAssistResponse(BaseModel):
    reply: str
    meta: Dict[str, Any] = {}

