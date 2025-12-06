from sqlalchemy import Column, ForeignKey, String, LargeBinary
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, default_uuid


class Attachment(Base, TimestampMixin):
    __tablename__ = "zalaczniki"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    organization_id = Column("organizacja_id", UUID(as_uuid=True), ForeignKey("organizacje.id"), nullable=False)

    file_name = Column("nazwa_pliku", String(255), nullable=False)
    mime_type = Column("mime_type", String(120), nullable=False)
    size_bytes = Column("size_bytes", String(40), nullable=True)
    blob = Column("blob", LargeBinary, nullable=False)
    meta = Column("meta", JSONB, nullable=True)

    links = relationship("AccidentAttachment", back_populates="attachment", cascade="all, delete-orphan")


class AccidentAttachment(Base, TimestampMixin):
    __tablename__ = "wypadek_zalaczniki"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    accident_id = Column("wypadek_id", UUID(as_uuid=True), ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False)
    explanation_id = Column("wyjasnienia_id", UUID(as_uuid=True), ForeignKey("wyjasnienia_poszkodowanego.id", ondelete="CASCADE"), nullable=True)
    attachment_id = Column("zalacznik_id", UUID(as_uuid=True), ForeignKey("zalaczniki.id", ondelete="CASCADE"), nullable=False)
    role = Column("rola", String(80), nullable=True)  # np. pelnomocnictwo, dokumentacja_medyczna

    accident = relationship("Accident", back_populates="attachments")
    explanation = relationship("InjuredExplanation")
    attachment = relationship("Attachment", back_populates="links")

