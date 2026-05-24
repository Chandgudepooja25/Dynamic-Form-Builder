/**
 * Thin cross-origin fetch wrapper used by every client component.
 * Attaches the JWT from localStorage automatically on each call.
 *
 * The backend lives on a separate host/port (configurable via
 * `NEXT_PUBLIC_API_BASE_URL`); we always prefix paths with that base so
 * the frontend doesn't accidentally hit its own origin.
 */

import type {
  Answer,
  AuthUser,
  Form,
  FormResponse,
  FormSummary,
} from '@shared/types';

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000'
).replace(/\/$/, '');

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

async function request<T = unknown>(
  path: string,
  opts: RequestInit & { raw?: boolean } = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers ?? {}),
    },
  });

  if (opts.raw) return res as unknown as T;

  const isJson = (res.headers.get('content-type') ?? '').includes('application/json');
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message =
      (data && (data.message ?? data)) || `Request failed (${res.status})`;
    const err = new Error(message) as Error & {
      status?: number;
      data?: unknown;
    };
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: AuthUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role?: 'user' | 'admin';
  }) =>
    request<{ user: AuthUser; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  me: () => request<AuthUser | null>('/api/auth/me'),
};

export const formApi = {
  list: () => request<FormSummary[]>('/api/forms'),
  get: (id: string) => request<Form>(`/api/forms/${id}`),
  create: (payload: Partial<Form>) =>
    request<Form>('/api/forms', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<Form>) =>
    request<Form>(`/api/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  remove: (id: string) =>
    request<Response>(`/api/forms/${id}`, { method: 'DELETE', raw: true }),
  responses: (id: string) =>
    request<FormResponse[]>(`/api/forms/${id}/responses`),
};

export const responseApi = {
  save: (payload: {
    formId: string;
    sessionId?: string;
    email?: string;
    answers: Answer[];
    status?: 'draft' | 'submitted';
  }) =>
    request<{ status: string; response: FormResponse }>('/api/responses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getDraft: (formId: string, sessionId: string) =>
    request<FormResponse | null>(
      `/api/responses/draft?formId=${encodeURIComponent(formId)}&sessionId=${encodeURIComponent(sessionId)}`
    ),
};

export async function downloadCsv(formId: string, filename = 'responses.csv') {
  const token = getToken();
  const res = await fetch(`${API_BASE_URL}/api/forms/${formId}/export`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Export failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
