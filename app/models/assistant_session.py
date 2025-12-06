from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID, JSONB

from app.models.base import Base, TimestampMixin, default_uuid


class AssistantSession(Base, TimestampMixin):
    __tablename__ = "assistant_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=default_uuid)
    session_id = Column(String(255), nullable=False, unique=True)
    history = Column(JSONB, nullable=False, default=list)
    form_state = Column(JSONB, nullable=False, default=dict)

