export type UserRole = 'injured' | 'representative';

export type DocumentType = 'notification' | 'explanation' | 'both';

export interface Address {
  street: string;
  houseNumber: string;
  apartmentNumber?: string;
  postalCode: string;
  city: string;
  country: string;
}

export interface PersonData {
  pesel?: string;
  documentType?: string;
  documentSeries?: string;
  documentNumber?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace?: string;
  phone?: string;
  address: Address;
  correspondenceAddress?: Address;
  useCorrespondenceAddress?: boolean;
}

export interface BusinessData {
  nip: string;
  regon?: string;
  companyName: string;
  pkd?: string;
  businessScope?: string;
  address: Address;
  phone?: string;
  ceidgVerified?: boolean;
}

export interface AccidentBasicData {
  accidentDate: string;
  accidentTime: string;
  accidentPlace: string;
  plannedWorkStart: string;
  plannedWorkEnd: string;
  accidentContext: 'during_work' | 'commute_to' | 'commute_from' | 'other';
}

export interface InjuryData {
  injuryType: string;
  injuryDescription: string;
  firstAidProvided: boolean;
  medicalFacilityName?: string;
  medicalFacilityAddress?: string;
  hospitalizationDates?: {
    from: string;
    to: string;
  };
  unableToWork: boolean;
  unableToWorkPeriod?: {
    from: string;
    to: string;
  };
}

export interface AccidentCircumstances {
  activityBeforeAccident: string;
  directEvent: string;
  externalCause: string;
  usedMachine: boolean;
  machineName?: string;
  machineType?: string;
  machineProperlyWorking?: boolean;
  machineUsedCorrectly?: boolean;
  protectiveEquipment: string[];
  protectiveEquipmentOther?: string;
  reportedToAuthorities: string[];
  authorityReferenceNumber?: string;
  freeTextDescription?: string;
  useOpenMode?: boolean;
}

export interface Witness {
  id: string;
  firstName: string;
  lastName: string;
  address?: Address;
  phone?: string;
}

export interface DocumentStatus {
  documentType: string;
  status: 'have' | 'dont_have' | 'will_send_later';
}

export interface ValidationOverride {
  field: string;
  reason: string;
  overriddenAt: string;
}

export interface FormState {
  currentStep: number;
  userRole: UserRole | null;
  documentType: DocumentType | null;
  injuredPerson: PersonData;
  representative?: PersonData;
  business: BusinessData;
  accidentBasic: AccidentBasicData;
  injury: InjuryData;
  circumstances: AccidentCircumstances;
  witnesses: Witness[];
  hasWitnesses: 'yes' | 'no' | 'unknown' | null;
  documents: DocumentStatus[];
  validationOverrides: ValidationOverride[];
  completedSteps: number[];
}

export const initialFormState: FormState = {
  currentStep: 0,
  userRole: null,
  documentType: null,
  injuredPerson: {
    firstName: '',
    lastName: '',
    birthDate: '',
    address: {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: 'Polska',
    },
  },
  business: {
    nip: '',
    companyName: '',
    address: {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: 'Polska',
    },
  },
  accidentBasic: {
    accidentDate: '',
    accidentTime: '',
    accidentPlace: '',
    plannedWorkStart: '',
    plannedWorkEnd: '',
    accidentContext: 'during_work',
  },
  injury: {
    injuryType: '',
    injuryDescription: '',
    firstAidProvided: false,
    unableToWork: false,
  },
  circumstances: {
    activityBeforeAccident: '',
    directEvent: '',
    externalCause: '',
    usedMachine: false,
    protectiveEquipment: [],
    reportedToAuthorities: [],
    useOpenMode: false,
  },
  witnesses: [],
  hasWitnesses: null,
  documents: [],
  validationOverrides: [],
  completedSteps: [],
};
