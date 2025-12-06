// Types for ZUS Worker module flow

export type DocumentType = 
  | 'notification' 
  | 'explanation' 
  | 'medical' 
  | 'police' 
  | 'prosecutor' 
  | 'other';

export type DocumentForm = 'handwritten' | 'printed';

export interface UploadedDocument {
  id: string;
  file: File;
  name: string;
  type: DocumentType;
  form: DocumentForm;
  otherDescription?: string; // When type is 'other'
}

export type ProcessingStage = 'ocr' | 'analysis' | 'generation';
export type ProcessingStatus = 'pending' | 'in_progress' | 'completed' | 'error';

export interface ProcessingState {
  ocr: ProcessingStatus;
  analysis: ProcessingStatus;
  generation: ProcessingStatus;
  error?: string;
}

export interface AnalysisResult {
  caseId: string;
  timestamp: string;
  accidentCard: AccidentCardContent;
  opinion: OpinionContent;
  qualityWarnings?: string[];
}

export interface AccidentCardContent {
  // Section I - Injured person data
  injuredPerson: {
    firstName: string;
    lastName: string;
    pesel: string;
    birthDate: string;
    address: string;
    position: string;
  };
  // Section II - Business/Employer data
  employer: {
    name: string;
    nip: string;
    regon: string;
    address: string;
    pkd: string;
  };
  // Section III - Accident data
  accident: {
    date: string;
    time: string;
    place: string;
    placeType: string;
    activityDuringAccident: string;
    directEvent: string;
    externalCause: string;
  };
  // Section IV - Injury
  injury: {
    type: string;
    bodyPart: string;
    description: string;
    firstAidProvided: boolean;
  };
  // Section V - Witnesses
  witnesses: Array<{
    name: string;
    address: string;
  }>;
  // Section VI - Qualification
  qualification: {
    isWorkAccident: boolean;
    justification: string;
    legalBasis: string;
  };
  // Raw text for display
  htmlContent?: string;
}

export interface OpinionContent {
  // Factual state
  factualState: string;
  // Evidence material
  evidenceMaterial: string;
  // Analysis of accident definition elements
  definitionAnalysis: {
    suddenness: { met: boolean; justification: string };
    externalCause: { met: boolean; justification: string };
    injury: { met: boolean; justification: string };
    workRelation: { met: boolean; justification: string };
  };
  // Final conclusion
  conclusion: {
    isWorkAccident: boolean;
    summary: string;
  };
  // Full text for display
  htmlContent?: string;
}

export const documentTypeLabels: Record<DocumentType, string> = {
  notification: 'Zawiadomienie o wypadku',
  explanation: 'Wyjaśnienia poszkodowanego',
  medical: 'Dokumentacja medyczna',
  police: 'Dokumenty policji',
  prosecutor: 'Dokumenty prokuratury',
  other: 'Inne',
};

export const documentFormLabels: Record<DocumentForm, string> = {
  handwritten: 'Odręczne',
  printed: 'Drukowane',
};
