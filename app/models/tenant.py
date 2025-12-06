import uuid

from sqlalchemy import Column, Enum, String, UniqueConstraint, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, default_uuid
from app.models.enums import RolaUzytkownika


class Organization(Base, TimestampMixin):
    __tablename__ = "organizacje"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    name = Column("nazwa", String(255), nullable=False)
    tax_id = Column("nip", String(20), unique=True)
    stat_id = Column("regon", String(20), unique=True)
    org_type = Column("typ", String(50), nullable=True)  # np. pracodawca, zus_admin

    users = relationship("User", back_populates="organization", cascade="all, delete")
    people = relationship("Person", back_populates="organization", cascade="all, delete")


class User(Base, TimestampMixin):
    __tablename__ = "uzytkownicy"
    __table_args__ = (
        UniqueConstraint("organizacja_id", "email", name="uq_uzytkownicy_org_email"),
    )

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    organization_id = Column("organizacja_id", UUID(as_uuid=True), ForeignKey("organizacje.id"), nullable=False)
    email = Column("email", String(255), nullable=False)
    role = Column("rola", Enum(RolaUzytkownika, name="rola_uzytkownika"), nullable=False, default=RolaUzytkownika.pracownik)
    hashed_password = Column("hashed_password", String(255), nullable=True)

    organization = relationship("Organization", back_populates="users")

