from sqlalchemy import Column, Date, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, default_uuid
from app.models.enums import TypAdresu, RodzajKorespondencji


class Person(Base, TimestampMixin):
    __tablename__ = "osoby"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    organization_id = Column("organizacja_id", UUID(as_uuid=True), ForeignKey("organizacje.id"), nullable=False)

    national_id = Column("pesel", String(11), nullable=True)
    document_type = Column("dokument_typ", String(50), nullable=True)
    document_number = Column("dokument_nr", String(50), nullable=True)
    first_name = Column("imie", String(100), nullable=False)
    last_name = Column("nazwisko", String(100), nullable=False)
    date_of_birth = Column("data_urodzenia", Date, nullable=True)
    place_of_birth = Column("miejsce_urodzenia", String(120), nullable=True)
    phone = Column("telefon", String(50), nullable=True)
    email = Column("email", String(255), nullable=True)

    addresses = relationship("Address", back_populates="person", cascade="all, delete")
    organization = relationship("Organization", back_populates="people")


class Address(Base, TimestampMixin):
    __tablename__ = "adresy"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    organization_id = Column("organizacja_id", UUID(as_uuid=True), ForeignKey("organizacje.id"), nullable=False)
    person_id = Column("osoba_id", UUID(as_uuid=True), ForeignKey("osoby.id"), nullable=True)

    address_type = Column("typ", Enum(TypAdresu, name="typ_adresu"), nullable=False)
    street = Column("ulica", String(120), nullable=True)
    house_number = Column("nr_domu", String(20), nullable=True)
    apartment_number = Column("nr_lokalu", String(20), nullable=True)
    postal_code = Column("kod", String(12), nullable=True)
    city = Column("miejscowosc", String(120), nullable=True)
    country = Column("kraj", String(80), nullable=False)
    correspondence_kind = Column("rodzaj_korespondencji", Enum(RodzajKorespondencji, name="rodzaj_korespondencji"), nullable=True)
    facility_name = Column("nazwa_placowki", String(120), nullable=True)
    po_box_number = Column("nr_skrytki", String(30), nullable=True)
    office_code = Column("kod_urzedu", String(20), nullable=True)

    person = relationship("Person", back_populates="addresses")
    organization = relationship("Organization")

