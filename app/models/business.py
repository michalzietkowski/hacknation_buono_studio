from sqlalchemy import Column, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import Base, TimestampMixin, default_uuid


class Business(Base, TimestampMixin):
    __tablename__ = "dzialalnosci"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    organization_id = Column("organizacja_id", UUID(as_uuid=True), ForeignKey("organizacje.id"), nullable=False)

    tax_id = Column("nip", String(20), nullable=False)
    stat_id = Column("regon", String(20), nullable=True)
    pkd_code = Column("pkd_kod", String(10), nullable=True)

