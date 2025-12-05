const sanitizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, '');

export const API_BASE_URL =
  sanitizeBaseUrl(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1');

type HealthResponse = {
  status: string;
  env: string;
};

type ChatResponse = {
  reply: string;
  meta?: Record<string, unknown> | null;
};

type ChatPayload = {
  message: string;
  history?: string[];
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}): ${text || response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchHealth(): Promise<HealthResponse> {
  return fetchJson<HealthResponse>('/health/');
}

export async function sendChat(payload: ChatPayload): Promise<ChatResponse> {
  return fetchJson<ChatResponse>('/chat/completion', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

