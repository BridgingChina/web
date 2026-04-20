import { API_BASE_URL, API_TIMEOUT } from '@/constants/config';
import { useAuthStore } from '@/stores/authStore';
import { ensureFreshJwt } from '@/lib/jwt-refresh';
import type { ApiError } from './types';

function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? API_BASE_URL;
}

const AUTHED_ENDPOINTS = ['/favorites', '/review', '/history'];

function needsAuth(path: string): boolean {
  return AUTHED_ENDPOINTS.some((ep) => path.startsWith(ep));
}

// Read NEXT_LOCALE cookie on client runtime. Returns null if not running in a
// browser or the cookie is absent. Server runtime (RSC / Server Actions) should
// pass `locale` explicitly via request options — this fallback exists so legacy
// client callsites don't regress after Phase 1 dropped deviceStore.language as
// the Accept-Language source.
function readLocaleCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const DEFAULT_LOCALE = 'zh-CN';

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(status: number, error: ApiError['error']) {
    super(error.message);
    this.name = 'ApiClientError';
    this.code = error.code;
    this.status = status;
    this.details = error.details;
  }
}

async function request<T>(
  method: string,
  path: string,
  options: {
    body?: unknown;
    params?: Record<string, string | number | undefined>;
    headers?: Record<string, string>;
    timeout?: number;
    locale?: string;
  } = {},
): Promise<T> {
  const url = new URL(`${getApiBaseUrl()}${path}`);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  const headers: Record<string, string> = {
    'Accept-Language': options.locale ?? readLocaleCookie() ?? DEFAULT_LOCALE,
    ...options.headers,
  };
  if (needsAuth(path)) {
    const token = await ensureFreshJwt();
    if (!token) {
      // Message stays empty — consumers should translate by `err.code`.
      // Kept in `message` for log/debug readability only; UI never renders raw.
      throw new ApiClientError(401, { code: 'UNAUTHENTICATED', message: 'UNAUTHENTICATED' });
    }
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout ?? API_TIMEOUT);
  try {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: options.body instanceof FormData
        ? options.body
        : options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    if (!res.ok) {
      if (res.status === 401) {
        useAuthStore.getState().clear();
      }
      const errBody = await res.json().catch(() => ({
        // No user-visible copy here — the code is the translation key. The
        // component layer resolves via `t(\`errors.\${err.code}\`)`.
        error: { code: 'UNKNOWN', message: 'UNKNOWN' },
      }));
      throw new ApiClientError(res.status, errBody.error);
    }
    if (res.status === 204) return undefined as T;
    return await res.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  get: <T = unknown>(path: string, params?: Record<string, string | number | undefined>) =>
    request<T>('GET', path, { params }),
  post: <T = unknown>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  put: <T = unknown>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  delete: <T = unknown>(path: string) => request<T>('DELETE', path),
  upload: <T = unknown>(path: string, formData: FormData) => request<T>('POST', path, { body: formData }),
};
