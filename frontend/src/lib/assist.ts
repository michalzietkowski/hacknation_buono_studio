import { FormState } from '@/types/form';

export interface AssistMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AssistRequest {
  field_id: string;
  message: string;
  form_state: FormState;
  history: AssistMessage[];
  session_id: string;
}

export interface AssistResponse {
  reply: string;
  meta?: Record<string, unknown>;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export async function callFieldAssist(payload: AssistRequest): Promise<AssistResponse> {
  const res = await fetch(`${API_BASE}/assist/field`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      field_id: payload.field_id,
      message: payload.message,
      form_state: payload.form_state,
      history: payload.history,
      session_id: payload.session_id,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Assist API error (${res.status})`);
  }

  return (await res.json()) as AssistResponse;
}

