import datetime as dt
from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.tenant import Organization
from app.models.people import Person, Address
from app.models.business import Business
from app.models.accident import (
    Accident,
    AccidentWitness,
    AccidentMachine,
    AccidentProtectiveMeasure,
    AccidentProceeding,
    InjuredExplanation,
)
from app.models.attachment import Attachment
from app.models.dynamic import DynamicAnswer
from app.models.enums import TypAdresu, TypZglaszajacego, TypOrgan, StatusSprawy
from app.schemas.accident_form import (
    AccidentFormPayload,
    AddressPayload,
    WitnessPayload,
    CircumstancesPayload,
)
from app.models.base import default_uuid


def _parse_date(value: Optional[str]) -> Optional[dt.date]:
    if not value:
        return None
    try:
        return dt.date.fromisoformat(value)
    except Exception:
        return None


def _parse_time(value: Optional[str]) -> Optional[dt.time]:
    if not value:
        return None
    try:
        return dt.time.fromisoformat(value)
    except Exception:
        # try HH:MM
        try:
            return dt.datetime.strptime(value, "%H:%M").time()
        except Exception:
            return None


def _ensure_org(db: Session, payload: AccidentFormPayload) -> Organization:
    org = None
    if payload.business.nip:
        org = (
            db.query(Organization)
            .filter(Organization.tax_id == payload.business.nip)
            .first()
        )
    if not org:
        org = Organization(
            id=default_uuid(),
            name=payload.business.companyName,
            tax_id=payload.business.nip,
            stat_id=payload.business.regon,
            org_type="pracodawca",
        )
        db.add(org)
        db.flush()
    return org


def _create_address(
    db: Session, org_id, data: AddressPayload | None, address_type: TypAdresu
) -> Optional[Address]:
    if data is None:
        return None
    addr = Address(
        id=default_uuid(),
        organization_id=org_id,
        address_type=address_type,
        street=data.street,
        house_number=data.houseNumber,
        apartment_number=data.apartmentNumber,
        postal_code=data.postalCode,
        city=data.city,
        country=data.country or "Polska",
    )
    db.add(addr)
    db.flush()
    return addr


def _create_person(db: Session, org_id, data, address_type: TypAdresu) -> Person:
    address = _create_address(db, org_id, data.address, address_type)
    correspondence = None
    if data.useCorrespondenceAddress and data.correspondenceAddress:
        correspondence = _create_address(
            db, org_id, data.correspondenceAddress, TypAdresu.korespondencyjny
        )

    person = Person(
        id=default_uuid(),
        organization_id=org_id,
        national_id=data.pesel,
        document_type=data.documentType or data.documentSeries,
        document_number=data.documentNumber,
        first_name=data.firstName,
        last_name=data.lastName,
        date_of_birth=_parse_date(data.birthDate),
        place_of_birth=data.birthPlace,
        phone=data.phone,
    )
    db.add(person)
    db.flush()
    # Link address
    if address:
        address.person_id = person.id
    if correspondence:
        correspondence.person_id = person.id
    return person


def _map_circumstances_to_proceedings(
    db: Session, accident: Accident, circumstances: CircumstancesPayload
):
    for org_name in circumstances.reportedToAuthorities or []:
        proceeding = AccidentProceeding(
            id=default_uuid(),
            accident_id=accident.id,
            authority_type=TypOrgan.inne,
            authority_name=org_name,
            case_number=circumstances.authorityReferenceNumber,
            case_status=StatusSprawy.w_toku,
        )
        db.add(proceeding)


def create_accident_form(db: Session, payload: AccidentFormPayload) -> Accident:
    org = _ensure_org(db, payload)

    business = Business(
        id=default_uuid(),
        organization_id=org.id,
        tax_id=payload.business.nip,
        stat_id=payload.business.regon,
        pkd_code=payload.business.pkd,
    )
    db.add(business)
    db.flush()

    injured = _create_person(db, org.id, payload.injuredPerson, TypAdresu.zamieszkania)
    representative = (
        _create_person(db, org.id, payload.representative, TypAdresu.korespondencyjny)
        if payload.representative
        else None
    )

    location_address = Address(
        id=default_uuid(),
        organization_id=org.id,
        address_type=TypAdresu.miejsce_wypadku,
        street=payload.accidentBasic.accidentPlace,
        country="Polska",
    )
    db.add(location_address)
    db.flush()

    medical_address = None
    if payload.injury.medicalFacilityAddress or payload.injury.medicalFacilityName:
        medical_address = Address(
            id=default_uuid(),
            organization_id=org.id,
            address_type=TypAdresu.placowka_medyczna,
            street=payload.injury.medicalFacilityAddress
            or payload.injury.medicalFacilityName,
            facility_name=payload.injury.medicalFacilityName,
            country="Polska",
        )
        db.add(medical_address)
        db.flush()

    accident = Accident(
        id=default_uuid(),
        organization_id=org.id,
        business_id=business.id,
        injured_person_id=injured.id,
        reporter_type=TypZglaszajacego.pelnomocnik
        if payload.userRole == "representative"
        else TypZglaszajacego.poszkodowany,
        reporter_id=representative.id if payload.userRole == "representative" and representative else injured.id,
        attorney_id=representative.id if representative else None,
        accident_date=_parse_date(payload.accidentBasic.accidentDate) or dt.date.today(),
        accident_time=_parse_time(payload.accidentBasic.accidentTime) or dt.datetime.now().time(),
        planned_start_time=_parse_time(payload.accidentBasic.plannedWorkStart),
        planned_end_time=_parse_time(payload.accidentBasic.plannedWorkEnd),
        location_address_id=location_address.id,
        activity_description=payload.circumstances.activityBeforeAccident,
        event_description=payload.circumstances.directEvent,
        cause_description=payload.circumstances.externalCause,
        place_description=payload.circumstances.freeTextDescription,
        injury_description=payload.injury.injuryDescription,
        is_fatal=False,
        first_aid_given=payload.injury.firstAidProvided,
        medical_facility_address_id=medical_address.id if medical_address else None,
        medical_diagnosis=payload.injury.injuryType,
        hospitalization_from=_parse_date(payload.injury.hospitalizationDates.get("from"))
        if payload.injury.hospitalizationDates
        else None,
        hospitalization_to=_parse_date(payload.injury.hospitalizationDates.get("to"))
        if payload.injury.hospitalizationDates
        else None,
        incapacity_days=None,
        on_sick_leave_that_day=payload.injury.unableToWork,
    )
    db.add(accident)
    db.flush()

    # Witnesses
    for w in payload.witnesses or []:
        addr = (
            _create_address(db, org.id, w.address, TypAdresu.korespondencyjny)
            if w.address
            else None
        )
        witness = AccidentWitness(
            id=default_uuid(),
            accident_id=accident.id,
            first_name=w.firstName,
            last_name=w.lastName,
            address=None,
            contact=w.phone,
        )
        db.add(witness)
        if addr:
            # store string in witness.address if present
            witness.address = f"{addr.street or ''} {addr.house_number or ''} {addr.city or ''}".strip()

    # Machines
    if payload.circumstances.usedMachine:
        machine = AccidentMachine(
            id=default_uuid(),
            accident_id=accident.id,
            name=payload.circumstances.machineName or "Unknown machine",
            machine_type=payload.circumstances.machineType,
            is_operational=payload.circumstances.machineProperlyWorking,
            used_as_intended=payload.circumstances.machineUsedCorrectly,
        )
        db.add(machine)

    # Protective measures
    for item in payload.circumstances.protectiveEquipment or []:
        pm = AccidentProtectiveMeasure(
            id=default_uuid(),
            accident_id=accident.id,
            name=item,
            is_operational=None,
            requires_belaying=None,
            could_be_solo=None,
        )
        db.add(pm)

    # Proceedings
    _map_circumstances_to_proceedings(db, accident, payload.circumstances)

    # Explanation stub (optional open text)
    explanation_text = (
        payload.circumstances.freeTextDescription
        or payload.circumstances.directEvent
        or payload.circumstances.externalCause
    )
    if explanation_text:
        explanation = InjuredExplanation(
            id=default_uuid(),
            accident_id=accident.id,
            pre_accident_actions=payload.circumstances.activityBeforeAccident or "",
            event_sequence=payload.circumstances.directEvent or "",
            causes_description=payload.circumstances.externalCause or "",
            machinery_description=payload.circumstances.machineName,
            protective_measures_description=", ".join(payload.circumstances.protectiveEquipment or []),
            authorities_description=", ".join(payload.circumstances.reportedToAuthorities or []),
            medical_diagnosis=payload.injury.injuryType,
            hospitalization_period=None,
            sick_leave_info="unable_to_work" if payload.injury.unableToWork else None,
            sobriety_assessment=None,
        )
        db.add(explanation)

    db.commit()
    db.refresh(accident)
    return accident

