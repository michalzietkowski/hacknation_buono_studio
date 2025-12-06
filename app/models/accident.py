from sqlalchemy import (
    Boolean,
    Column,
    Date,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
    Time,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import Base, TimestampMixin, default_uuid
from app.models.enums import TypZglaszajacego, StatusSprawy, TypOrgan


class Accident(Base, TimestampMixin):
    __tablename__ = "wypadki"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    organization_id = Column("organizacja_id", UUID(as_uuid=True), ForeignKey("organizacje.id"), nullable=False)
    business_id = Column("dzialalnosc_id", UUID(as_uuid=True), ForeignKey("dzialalnosci.id"), nullable=True)

    injured_person_id = Column("poszkodowany_id", UUID(as_uuid=True), ForeignKey("osoby.id"), nullable=False)
    reporter_type = Column("zglaszajacy_typ", Enum(TypZglaszajacego, name="typ_zglaszajacego"), nullable=False)
    reporter_id = Column("zglaszajacy_id", UUID(as_uuid=True), ForeignKey("osoby.id"), nullable=False)
    attorney_id = Column("pelnomocnik_id", UUID(as_uuid=True), ForeignKey("osoby.id"), nullable=True)

    accident_date = Column("data_wypadku", Date, nullable=False)
    accident_time = Column("godzina_wypadku", Time, nullable=False)
    planned_start_time = Column("plan_start", Time, nullable=True)
    planned_end_time = Column("plan_koniec", Time, nullable=True)

    location_address_id = Column("miejsce_adres_id", UUID(as_uuid=True), ForeignKey("adresy.id"), nullable=False)
    activity_description = Column("opis_czynnosci", Text, nullable=True)
    event_description = Column("opis_zdarzenia", Text, nullable=True)
    cause_description = Column("opis_przyczyny", Text, nullable=True)
    place_description = Column("opis_miejsca", Text, nullable=True)
    injury_description = Column("urazy_opis", Text, nullable=True)
    is_fatal = Column("czy_smiertelny", Boolean, nullable=False, default=False)

    first_aid_given = Column("czy_pierwsza_pomoc", Boolean, nullable=False, default=False)
    medical_facility_address_id = Column("placowka_adres_id", UUID(as_uuid=True), ForeignKey("adresy.id"), nullable=True)
    medical_diagnosis = Column("rozpoznanie_medyczne", Text, nullable=True)
    hospitalization_from = Column("hospitalizacja_od", Date, nullable=True)
    hospitalization_to = Column("hospitalizacja_do", Date, nullable=True)
    incapacity_days = Column("niezdolnosc_dni", Integer, nullable=True)

    on_sick_leave_that_day = Column("l4_w_dniu", Boolean, nullable=True)
    sick_leave_reason = Column("l4_powod", Text, nullable=True)
    alcohol_test_performed = Column("czy_badanie_trzezwosci", Boolean, nullable=True)
    sobriety_result = Column("trzezwosc_wynik", String(50), nullable=True)
    sobriety_details = Column("trzezwosc_szczegoly", Text, nullable=True)
    case_status = Column("status_sprawy", Enum(StatusSprawy, name="status_sprawy"), nullable=True)

    witnesses = relationship("AccidentWitness", back_populates="accident", cascade="all, delete-orphan")
    machines = relationship("AccidentMachine", back_populates="accident", cascade="all, delete-orphan")
    protective_measures = relationship("AccidentProtectiveMeasure", back_populates="accident", cascade="all, delete-orphan")
    proceedings = relationship("AccidentProceeding", back_populates="accident", cascade="all, delete-orphan")
    explanation = relationship("InjuredExplanation", uselist=False, back_populates="accident", cascade="all, delete-orphan")
    attachments = relationship("AccidentAttachment", back_populates="accident", cascade="all, delete-orphan")
    dynamic_answers = relationship("DynamicAnswer", back_populates="accident", cascade="all, delete-orphan")


class AccidentWitness(Base, TimestampMixin):
    __tablename__ = "wypadek_swiadkowie"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    accident_id = Column("wypadek_id", UUID(as_uuid=True), ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False)
    first_name = Column("imie", String(100), nullable=False)
    last_name = Column("nazwisko", String(100), nullable=False)
    address = Column("adres", String(255), nullable=True)
    contact = Column("kontakt", String(100), nullable=True)

    accident = relationship("Accident", back_populates="witnesses")


class AccidentMachine(Base, TimestampMixin):
    __tablename__ = "wypadek_maszyny"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    accident_id = Column("wypadek_id", UUID(as_uuid=True), ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False)
    name = Column("nazwa", String(120), nullable=False)
    machine_type = Column("typ", String(120), nullable=True)
    production_date = Column("data_produkcji", String(20), nullable=True)
    is_operational = Column("czy_sprawna", Boolean, nullable=True)
    used_as_intended = Column("uzycie_zgodne", Boolean, nullable=True)
    has_conformity_declaration = Column("czy_deklaracja_zgodnosci", Boolean, nullable=True)
    recorded_in_fixed_assets = Column("czy_w_ewidencji", Boolean, nullable=True)

    accident = relationship("Accident", back_populates="machines")


class AccidentProtectiveMeasure(Base, TimestampMixin):
    __tablename__ = "wypadek_srodki_ochrony"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    accident_id = Column("wypadek_id", UUID(as_uuid=True), ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False)
    name = Column("nazwa", String(120), nullable=False)
    is_operational = Column("czy_sprawny", Boolean, nullable=True)
    requires_belaying = Column("czy_wymagana_asekuracja", Boolean, nullable=True)
    could_be_solo = Column("czy_mogla_byc_samotnie", Boolean, nullable=True)

    accident = relationship("Accident", back_populates="protective_measures")


class AccidentProceeding(Base, TimestampMixin):
    __tablename__ = "wypadek_postepowania"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    accident_id = Column("wypadek_id", UUID(as_uuid=True), ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False)
    authority_type = Column("organ_typ", Enum(TypOrgan, name="typ_organ"), nullable=False)
    authority_name = Column("nazwa_organu", String(120), nullable=True)
    case_number = Column("numer_sprawy", String(80), nullable=True)
    case_status = Column("status_sprawy", Enum(StatusSprawy, name="status_sprawy_postepowanie"), nullable=False, default=StatusSprawy.w_toku)

    accident = relationship("Accident", back_populates="proceedings")


class InjuredExplanation(Base, TimestampMixin):
    __tablename__ = "wyjasnienia_poszkodowanego"

    id = Column("id", UUID(as_uuid=True), primary_key=True, default=default_uuid)
    accident_id = Column("wypadek_id", UUID(as_uuid=True), ForeignKey("wypadki.id", ondelete="CASCADE"), nullable=False, unique=True)

    pre_accident_actions = Column("opis_czynnosci", Text, nullable=False)
    event_sequence = Column("opis_zdarzen", Text, nullable=False)
    causes_description = Column("opis_przyczyn", Text, nullable=False)
    machinery_description = Column("opis_maszyn", Text, nullable=True)
    protective_measures_description = Column("opis_srodki_ochrony", Text, nullable=True)
    authorities_description = Column("opis_postepowan", Text, nullable=True)
    medical_diagnosis = Column("rozpoznanie_medyczne", Text, nullable=True)
    hospitalization_period = Column("hospitalizacja_okres", String(120), nullable=True)
    sick_leave_info = Column("l4_info", String(120), nullable=True)
    sobriety_assessment = Column("ocena_trzezwosci", String(120), nullable=True)

    accident = relationship("Accident", back_populates="explanation")

