/**
 * Базовый API-клиент: fetch, refresh при 401, типизированные ошибки.
 * По плану: frontend/docs/BACKEND-INTEGRATION-PLAN.md § 2.3
 */

import { ApiError, ApiErrorPayload } from './types/errors';

export { ApiError } from './types/errors';

const getBaseUrl = (): string => {
  const url = import.meta.env.VITE_API_BASE_URL;
  if (typeof url !== 'string' || !url) {
    return ''; // относительные пути при proxy
  }
  return url.replace(/\/$/, '');
};

let onUnauthorized: (() => void) | null = null;

/**
 * Регистрирует колбэк при повторном 401 после неудачного refresh (редирект на логин).
 */
export function setOnUnauthorized(callback: () => void): void {
  onUnauthorized = callback;
}

async function doRefresh(): Promise<boolean> {
  const base = getBaseUrl();
  const url = base ? `${base}/auth/refresh/` : '/api/v1/auth/refresh/';
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  return res.ok;
}

async function parseErrorResponse(response: Response): Promise<ApiError> {
  let body: { error?: ApiErrorPayload } = {};
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text) as { error?: ApiErrorPayload };
    } catch {
      body = {};
    }
  }
  return ApiError.fromResponse(response.status, body);
}

export interface RequestOptions {
  skipRefresh?: boolean;
}

/**
 * Выполняет запрос к API с автоматическим refresh при 401 и повторной попыткой.
 */
export async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestOptions = {}
): Promise<T> {
  const base = getBaseUrl();
  const url = base ? `${base}/${path.replace(/^\//, '')}` : `/api/v1/${path.replace(/^\//, '')}`;

  const doRequest = async (): Promise<Response> => {
    return fetch(url, {
      method,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...(body !== undefined && body !== null && { body: JSON.stringify(body) }),
    });
  };

  let response = await doRequest();

  if (response.status === 401 && !options.skipRefresh) {
    const refreshed = await doRefresh();
    if (refreshed) {
      response = await doRequest();
    }
    if (response.status === 401) {
      onUnauthorized?.();
      throw new ApiError('UNAUTHORIZED', 'Требуется авторизация', 401);
    }
  }

  if (!response.ok) {
    throw await parseErrorResponse(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const contentType = response.headers.get('Content-Type');
  if (contentType?.includes('application/json') && text) {
    return JSON.parse(text) as T;
  }
  return undefined as T;
}
