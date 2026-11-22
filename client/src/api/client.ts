import type { ApiResponse } from '@elitequest/shared';

const API_BASE = '/api/v1';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });

  const text = await response.text();
  // 204 No Content responses (e.g. deletes) have an empty body
  const json = text
    ? (JSON.parse(text) as ApiResponse<T>)
    : ({ data: null } as ApiResponse<T>);

  if (!response.ok || !('data' in json)) {
    const message = 'message' in json ? json.message : 'Request failed';
    throw new Error(message);
  }

  return json.data;
}

export const api = {
  get: <T>(path: string): Promise<T> => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown): Promise<T> =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(path: string): Promise<T> => request<T>(path, { method: 'DELETE' }),
};
