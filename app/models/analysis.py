from sqlalchemy import Column, ForeignKey, Integer, LargeBinary, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, default_uuid


class AnalysisCase(Base, TimestampMixin):
    __tablename__ = "analysis_cases"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    status = Column("status", String(50), nullable=False, default="processing")
    source_case_id = Column("source_case_id", String(120), nullable=True)
    result = Column("result", JSONB, nullable=True)
    error = Column("error", Text, nullable=True)

    documents = relationship("AnalysisDocument", back_populates="case", cascade="all, delete-orphan")


class AnalysisDocument(Base, TimestampMixin):
    __tablename__ = "analysis_documents"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    case_id = Column("case_id", UUID(as_uuid=True), ForeignKey("analysis_cases.id", ondelete="CASCADE"), nullable=False)

    file_name = Column("file_name", String(255), nullable=False)
    mime_type = Column("mime_type", String(120), nullable=False)
    size_bytes = Column("size_bytes", Integer, nullable=False)
    form = Column("form", String(50), nullable=True)
    doc_type = Column("doc_type", String(50), nullable=True)
    other_description = Column("other_description", String(255), nullable=True)
    blob = Column("blob", LargeBinary, nullable=False)
    meta = Column("meta", JSONB, nullable=True)

    case = relationship("AnalysisCase", back_populates="documents")

