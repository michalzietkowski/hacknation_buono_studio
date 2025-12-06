import { FormState } from './form';

export type CaseStatus = 'new' | 'in_progress' | 'ready_for_decision' | 'closed';
export type CaseType = 'standard' | 'fatal' | 'abroad';

export interface AccidentCase {
  id: string;
  caseNumber: string;
  submissionDate: string;
  zusUnit: string;
  injuredLastName: string;
  injuredFirstName: string;
  caseType: CaseType;
  status: CaseStatus;
  daysRemaining: number;
  formData: FormState;
  analysis?: CaseAnalysis;
  discrepancies?: Discrepancy[];
  missingDocuments?: MissingDocument[];
  suggestedActions?: SuggestedAction[];
  opinionDraft?: string;
  accidentCardDraft?: AccidentCardDraft;
  sourceDocuments?: SourceDocument[];
  lastModified?: string;
  modifiedBy?: string;
  history?: HistoryEntry[];
  comments?: CaseComment[];
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: 'created' | 'status_changed' | 'field_updated' | 'document_added' | 'comment_added' | 'analysis_changed';
  description: string;
  details?: {
    field?: string;
    oldValue?: string;
    newValue?: string;
  };
}

export interface CaseComment {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  content: string;
  isInternal: boolean;
}

export interface CaseAnalysis {
  suddenness: DefinitionElement;
  externalCause: DefinitionElement;
  injury: DefinitionElement;
  workRelation: DefinitionElement;
  overallRecommendation: 'meets_definition' | 'does_not_meet' | 'unclear';
  confidenceLevel: 'high' | 'medium' | 'low';
}

export interface DefinitionElement {
  status: 'met' | 'not_met' | 'unclear';
  justification: string;
  sources: DocumentReference[];
  workerNote?: string;
  workerAgreement?: boolean;
}

export interface DocumentReference {
  documentId: string;
  documentName: string;
  excerpt: string;
  pageNumber?: number;
}

export interface Discrepancy {
  id: string;
  field: string;
  valueA: { source: string; value: string };
  valueB: { source: string; value: string };
  valueC?: { source: string; value: string };
  severity: 'critical' | 'significant' | 'minor';
  resolved: boolean;
  resolutionNote?: string;
}

export interface MissingDocument {
  id: string;
  documentType: string;
  required: boolean;
  status: 'missing' | 'requested' | 'not_required' | 'received';
  requestDate?: string;
}

export interface SuggestedAction {
  id: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  completedDate?: string;
}

export interface AccidentCardDraft {
  injuredData: string;
  accidentData: string;
  circumstances: string;
  injury: string;
  documents: string;
  qualification: string;
  justification: string;
  delayReason?: string;
}

export interface SourceDocument {
  id: string;
  type: 'notification' | 'explanation' | 'accident_card' | 'opinion' | 'medical' | 'police' | 'other';
  name: string;
  source: 'system' | 'upload';
  uploadDate: string;
  ocrStatus: 'read' | 'partial' | 'unreadable';
  pageCount?: number;
}

export interface CaseFilters {
  status?: CaseStatus;
  caseType?: CaseType;
  zusUnit?: string;
  dateFrom?: string;
  dateTo?: string;
  highRisk?: boolean;
}
