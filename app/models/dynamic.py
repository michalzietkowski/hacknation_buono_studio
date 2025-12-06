from sqlalchemy import Column, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, default_uuid
from app.models.enums import ZakresPytania


class DynamicQuestion(Base, TimestampMixin):
    __tablename__ = "pytania_dynamiczne"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    organization_id = Column("organizacja_id", UUID(as_uuid=True), ForeignKey("organizacje.id"), nullable=False)
    scope = Column("zakres", Enum(ZakresPytania, name="zakres_pytania"), nullable=False)
    text = Column("tresc", Text, nullable=False)
    required = Column("wymagane", String(10), nullable=True)  # np. hard/soft, walidacja po stronie app
    order = Column("kolejnosc", Integer, nullable=True)

    conditions = relationship("QuestionCondition", back_populates="question", cascade="all, delete-orphan")
    answers = relationship("DynamicAnswer", back_populates="question", cascade="all, delete-orphan")


class QuestionCondition(Base, TimestampMixin):
    __tablename__ = "warunki_pytan"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    question_id = Column("pytanie_id", UUID(as_uuid=True), ForeignKey("pytania_dynamiczne.id", ondelete="CASCADE"), nullable=False)
    definition = Column("definicja", JSONB, nullable=False)

    question = relationship("DynamicQuestion", back_populates="conditions")


class DynamicAnswer(Base, TimestampMixin):
    __tablename__ = "odpowiedzi_dynamiczne"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    question_id = Column("pytanie_id", UUID(as_uuid=True), ForeignKey("pytania_dynamiczne.id", ondelete="CASCADE"), nullable=False)
    accident_id = Column("wypadek_id", UUID(as_uuid=True), ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False)
    explanation_id = Column("wyjasnienia_id", UUID(as_uuid=True), ForeignKey("wyjasnienia_poszkodowanego.id", ondelete="CASCADE"), nullable=True)
    value_text = Column("wartosc_text", Text, nullable=True)
    value_json = Column("wartosc_json", JSONB, nullable=True)

    question = relationship("DynamicQuestion", back_populates="answers")
    accident = relationship("Accident", back_populates="dynamic_answers")
    explanation = relationship("InjuredExplanation")

