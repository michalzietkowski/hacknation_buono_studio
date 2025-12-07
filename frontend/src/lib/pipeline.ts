import { AnalysisResult, UploadedDocument } from '@/types/zus-worker-flow';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export interface PipelineRunResponse {
  case_id: string;
  status: string;
  stage?: string;
  result?: any;
}

export interface PipelineStatusResponse {
  case_id: string;
  status: string;
  stage?: string;
  result?: any;
  error?: string | null;
}

export async function triggerPipelineAnalysis(documents: UploadedDocument[]): Promise<PipelineRunResponse> {
  const formData = new FormData();
  const meta = documents.map((doc) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    form: doc.form,
    otherDescription: doc.otherDescription,
  }));

  documents.forEach((doc) => formData.append('files', doc.file));
  formData.append('documents_meta', JSON.stringify(meta));

  const res = await fetch(`${API_BASE}/pipeline/run`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Pipeline API error (${res.status})`);
  }

  return (await res.json()) as PipelineRunResponse;
}

export async function fetchPipelineStatus(caseId: string): Promise<PipelineStatusResponse> {
  const res = await fetch(`${API_BASE}/pipeline/case/${caseId}/status`);
  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || `Pipeline status error (${res.status})`);
  }
  return (await res.json()) as PipelineStatusResponse;
}

const toBool = (value: unknown): boolean => {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    return ['tak', 'true', 'yes', '1'].includes(normalized);
  }
  return Boolean(value);
};

export function mapPipelineResultToAnalysisResult(
  response: PipelineRunResponse,
  documents: UploadedDocument[],
): AnalysisResult {
  const caseData = (response.result?.case as any) || {};
  const zdarzenie = caseData.zdarzenie || {};
  const poszkodowany = caseData.poszkodowany || {};
  const uraz = caseData.uraz || {};
  const witnesses = Array.isArray(caseData.swiadkowie) ? caseData.swiadkowie : [];
  const ocena = caseData.ocena_definicji || {};
  const rekomendacja = (caseData.rekomendacja || {}).uznanie_wypadku;
  const cardPayload = response.result?.card_payload || {};
  const opinionText = typeof response.result?.opinion === 'string' ? response.result.opinion : '';

  const qualityWarnings: string[] = [];
  if (documents.some((doc) => doc.form === 'handwritten')) {
    qualityWarnings.push('Niektóre dokumenty są odręczne – OCR może być mniej dokładny.');
  }

  const isWorkAccident = toBool(rekomendacja);
  const directEvent = zdarzenie.czynnosci_przed_wypadkiem || cardPayload.opis_okolicznosci || '-';
  const externalCause =
    Array.isArray(zdarzenie.czynniki_zewnetrzne) && zdarzenie.czynniki_zewnetrzne.length > 0
      ? zdarzenie.czynniki_zewnetrzne.join(', ')
      : cardPayload.rekomendacja || '-';

  return {
    caseId: response.case_id || caseData.case_id || `CASE-${Date.now()}`,
    timestamp: new Date().toISOString(),
    qualityWarnings: qualityWarnings.length ? qualityWarnings : undefined,
    accidentCard: {
      injuredPerson: {
        firstName: poszkodowany.imie || '-',
        lastName: poszkodowany.nazwisko || '-',
        pesel: poszkodowany.PESEL || '-',
        birthDate: poszkodowany.data_urodzenia || '-',
        address: poszkodowany.adres || '-',
        position: poszkodowany.rodzaj_dzialalnosci || '-',
      },
      employer: {
        name: '-',
        nip: '-',
        regon: '-',
        address: '-',
        pkd: '-',
      },
      accident: {
        date: zdarzenie.data_wypadku || cardPayload.data_wypadku || '-',
        time: zdarzenie.godzina_wypadku || '-',
        place: zdarzenie.miejsce_wypadku || cardPayload.miejsce_wypadku || '-',
        placeType: '-',
        activityDuringAccident: zdarzenie.opis_okolicznosci || directEvent || '-',
        directEvent: directEvent || '-',
        externalCause: externalCause,
      },
      injury: {
        type: uraz.rodzaj_urazu || cardPayload.rodzaj_urazu || '-',
        bodyPart: uraz.narzad_dotkniety || '-',
        description: uraz.opis_medyczny || '-',
        firstAidProvided: Boolean(uraz.hospitalizacja?.byla),
      },
      witnesses: witnesses.map((w: any) => ({
        name: [w.imie, w.nazwisko].filter(Boolean).join(' ').trim() || '-',
        address: w.adres || '-',
      })),
      qualification: {
        isWorkAccident,
        justification:
          ocena.zwiazek_z_praca ||
          ocena.przyczyna_zewnetrzna ||
          ocena.naglosc ||
          ocena.uraz ||
          recommendationFallback(opinionText),
        legalBasis: 'Rekomendacja generowana automatycznie (wymaga weryfikacji).',
      },
    },
    opinion: {
      factualState: zdarzenie.opis_okolicznosci || opinionText || 'Opis zdarzenia zostanie uzupełniony po weryfikacji.',
      evidenceMaterial: documents.map((d) => d.name).join('\n'),
      definitionAnalysis: {
        suddenness: { met: toBool(ocena.naglosc), justification: ocena.naglosc || 'Ocena automatyczna' },
        externalCause: {
          met: toBool(ocena.przyczyna_zewnetrzna),
          justification: ocena.przyczyna_zewnetrzna || 'Ocena automatyczna',
        },
        injury: { met: toBool(ocena.uraz), justification: ocena.uraz || 'Ocena automatyczna' },
        workRelation: {
          met: toBool(ocena.zwiazek_z_praca),
          justification: ocena.zwiazek_z_praca || 'Ocena automatyczna',
        },
      },
      conclusion: {
        isWorkAccident,
        summary: opinionText || rekomendacja || 'Rekomendacja zostanie uzupełniona po weryfikacji.',
      },
    },
  };
}

const recommendationFallback = (opinionText: string) =>
  opinionText || 'Brak szczegółowej rekomendacji – sprawdź wynik pipeline.';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Start pipeline and poll its status until completion/failure.
 * Calls onStageChange whenever backend reports a new stage.
 */
export async function runAnalysisWithPolling(
  documents: UploadedDocument[],
  onStageChange?: (stage: string) => void,
  pollIntervalMs = 1200,
): Promise<AnalysisResult> {
  const runResponse = await triggerPipelineAnalysis(documents);
  const caseId = runResponse.case_id;
  if (runResponse.stage && onStageChange) {
    onStageChange(runResponse.stage);
  }

  // Fast path: if backend already completed (unlikely), return immediately
  if (runResponse.status === 'completed' && runResponse.result) {
    return mapPipelineResultToAnalysisResult(runResponse, documents);
  }

  while (true) {
    await delay(pollIntervalMs);
    const status = await fetchPipelineStatus(caseId);
    if (status.stage && onStageChange) {
      onStageChange(status.stage);
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Pipeline failed');
    }
    if (status.status === 'completed' && status.result) {
      return mapPipelineResultToAnalysisResult(
        { case_id: status.case_id, status: status.status, stage: status.stage, result: status.result },
        documents,
      );
    }
  }
}

