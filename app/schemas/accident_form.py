from datetime import date, time
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class AddressPayload(BaseModel):
    street: str | None = None
    houseNumber: str | None = None
    apartmentNumber: str | None = None
    postalCode: str | None = None
    city: str | None = None
    country: str | None = Field(default="Polska")


class PersonPayload(BaseModel):
    pesel: str | None = None
    documentType: str | None = None
    documentSeries: str | None = None
    documentNumber: str | None = None
    firstName: str
    lastName: str
    birthDate: str
    birthPlace: str | None = None
    phone: str | None = None
    address: AddressPayload
    correspondenceAddress: AddressPayload | None = None
    useCorrespondenceAddress: bool | None = None


class BusinessPayload(BaseModel):
    nip: str
    regon: str | None = None
    companyName: str
    pkd: str | None = None
    businessScope: str | None = None
    address: AddressPayload
    phone: str | None = None
    ceidgVerified: bool | None = None


class AccidentBasicPayload(BaseModel):
    accidentDate: str
    accidentTime: str
    accidentPlace: str
    plannedWorkStart: str | None = None
    plannedWorkEnd: str | None = None
    accidentContext: str | None = None


class InjuryPayload(BaseModel):
    injuryType: str | None = None
    injuryDescription: str | None = None
    firstAidProvided: bool = False
    medicalFacilityName: str | None = None
    medicalFacilityAddress: str | None = None
    hospitalizationDates: dict | None = None  # { from, to }
    unableToWork: bool = False
    unableToWorkPeriod: dict | None = None  # { from, to }


class CircumstancesPayload(BaseModel):
    activityBeforeAccident: str | None = None
    directEvent: str | None = None
    externalCause: str | None = None
    usedMachine: bool = False
    machineName: str | None = None
    machineType: str | None = None
    machineProperlyWorking: bool | None = None
    machineUsedCorrectly: bool | None = None
    protectiveEquipment: List[str] = []
    protectiveEquipmentOther: str | None = None
    reportedToAuthorities: List[str] = []
    authorityReferenceNumber: str | None = None
    freeTextDescription: str | None = None
    useOpenMode: bool | None = None


class WitnessPayload(BaseModel):
    id: str | None = None
    firstName: str
    lastName: str
    address: AddressPayload | None = None
    phone: str | None = None


class DocumentStatusPayload(BaseModel):
    documentType: str
    status: str


class AccidentFormPayload(BaseModel):
    userRole: str
    documentType: str | None = None
    injuredPerson: PersonPayload
    representative: PersonPayload | None = None
    business: BusinessPayload
    accidentBasic: AccidentBasicPayload
    injury: InjuryPayload
    circumstances: CircumstancesPayload
    witnesses: List[WitnessPayload] = []
    hasWitnesses: str | None = None
    documents: List[DocumentStatusPayload] = []


class AccidentCreateResponse(BaseModel):
    id: UUID
    message: str = "ok"

    model_config = {"from_attributes": True}

