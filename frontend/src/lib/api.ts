import { FormState } from '@/types/form';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8000/api/v1';

function buildPayload(state: FormState) {
  return {
    userRole: state.userRole,
    documentType: state.documentType,
    injuredPerson: state.injuredPerson,
    representative: state.representative,
    business: state.business,
    accidentBasic: state.accidentBasic,
    injury: state.injury,
    circumstances: state.circumstances,
    witnesses: state.witnesses,
    hasWitnesses: state.hasWitnesses,
    documents: state.documents,
  };
}

export async function submitAccidentForm(state: FormState, token?: string) {
  const payload = buildPayload(state);
  const bearer =
    token ||
    import.meta.env.VITE_API_TOKEN ||
    (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);

  const res = await fetch(`${API_BASE}/forms/accident`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Request failed');
  }

  return res.json();
}

