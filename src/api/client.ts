import { API_BASE_URL, API_TIMEOUT } from '@/constants/config';
import { useDeviceStore } from '@/stores/deviceStore';
import type { ApiError } from './types';

// Read env lazily so vi.stubEnv in tests takes effect after module load.
function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? API_BASE_URL;
}

const DEVICE_ID_ENDPOINTS = ['/favorites', '/review', '/history'];

function needsDeviceId(path: string): boolean {
  return DEVICE_ID_ENDPOINTS.some((ep) => path.startsWith(ep));
}

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
  } = {},
): Promise<T> {
  const { deviceId, language } = useDeviceStore.getState();
  const url = new URL(`${getApiBaseUrl()}${path}`);
  if (options.params) {
    Object.entries(options.params).forEach(([k, v]) => {
      if (v !== undefined) url.searchParams.set(k, String(v));
    });
  }
  const headers: Record<string, string> = {
    'Accept-Language': language,
    ...options.headers,
  };
  if (needsDeviceId(path) && deviceId) headers['X-Device-Id'] = deviceId;
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
      const errBody = await res.json().catch(() => ({
        error: { code: 'UNKNOWN', message: '请求失败' },
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
