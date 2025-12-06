from datetime import date, time
from uuid import UUID
from typing import Optional, List

from pydantic import BaseModel, Field


class OrganizationBase(BaseModel):
    name: str
    tax_id: Optional[str] = None
    stat_id: Optional[str] = None
    org_type: Optional[str] = None

    model_config = {"from_attributes": True}


class PersonBase(BaseModel):
    national_id: Optional[str] = Field(None, max_length=11)
    document_type: Optional[str] = None
    document_number: Optional[str] = None
    first_name: str
    last_name: str
    date_of_birth: Optional[date] = None
    place_of_birth: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    model_config = {"from_attributes": True}


class AddressBase(BaseModel):
    address_type: str
    street: Optional[str] = None
    house_number: Optional[str] = None
    apartment_number: Optional[str] = None
    postal_code: Optional[str] = None
    city: Optional[str] = None
    country: str
    correspondence_kind: Optional[str] = None
    facility_name: Optional[str] = None
    po_box_number: Optional[str] = None
    office_code: Optional[str] = None

    model_config = {"from_attributes": True}


class BusinessBase(BaseModel):
    tax_id: str
    stat_id: Optional[str] = None
    pkd_code: Optional[str] = None

    model_config = {"from_attributes": True}


class AccidentWitnessIn(BaseModel):
    first_name: str
    last_name: str
    address: Optional[str] = None
    contact: Optional[str] = None


class AccidentMachineIn(BaseModel):
    name: str
    machine_type: Optional[str] = None
    production_date: Optional[str] = None
    is_operational: Optional[bool] = None
    used_as_intended: Optional[bool] = None
    has_conformity_declaration: Optional[bool] = None
    recorded_in_fixed_assets: Optional[bool] = None


class AccidentProtectiveMeasureIn(BaseModel):
    name: str
    is_operational: Optional[bool] = None
    requires_belaying: Optional[bool] = None
    could_be_solo: Optional[bool] = None


class AccidentProceedingIn(BaseModel):
    authority_type: str
    authority_name: Optional[str] = None
    case_number: Optional[str] = None
    case_status: str


class AccidentBase(BaseModel):
    organization_id: UUID
    business_id: Optional[UUID] = None
    injured_person_id: UUID
    reporter_type: str
    reporter_id: UUID
    attorney_id: Optional[UUID] = None
    accident_date: date
    accident_time: time
    planned_start_time: Optional[time] = None
    planned_end_time: Optional[time] = None
    location_address_id: UUID
    activity_description: Optional[str] = None
    event_description: Optional[str] = None
    cause_description: Optional[str] = None
    place_description: Optional[str] = None
    injury_description: Optional[str] = None
    is_fatal: bool = False
    first_aid_given: bool = False
    medical_facility_address_id: Optional[UUID] = None
    medical_diagnosis: Optional[str] = None
    hospitalization_from: Optional[date] = None
    hospitalization_to: Optional[date] = None
    incapacity_days: Optional[int] = None
    on_sick_leave_that_day: Optional[bool] = None
    sick_leave_reason: Optional[str] = None
    alcohol_test_performed: Optional[bool] = None
    sobriety_result: Optional[str] = None
    sobriety_details: Optional[str] = None
    case_status: Optional[str] = None

    witnesses: List[AccidentWitnessIn] = []
    machines: List[AccidentMachineIn] = []
    protective_measures: List[AccidentProtectiveMeasureIn] = []
    proceedings: List[AccidentProceedingIn] = []

    model_config = {"from_attributes": True}


class InjuredExplanationIn(BaseModel):
    pre_accident_actions: str
    event_sequence: str
    causes_description: str
    machinery_description: Optional[str] = None
    protective_measures_description: Optional[str] = None
    authorities_description: Optional[str] = None
    medical_diagnosis: Optional[str] = None
    hospitalization_period: Optional[str] = None
    sick_leave_info: Optional[str] = None
    sobriety_assessment: Optional[str] = None


class DynamicAnswerIn(BaseModel):
    question_id: UUID
    accident_id: UUID
    explanation_id: Optional[UUID] = None
    value_text: Optional[str] = None
    value_json: Optional[dict] = None

    model_config = {"from_attributes": True}

