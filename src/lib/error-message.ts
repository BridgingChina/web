'use client';
import { useTranslations } from 'next-intl';
import { ApiClientError } from '@/api/client';

/**
 * Resolve a thrown error into a user-facing string.
 *
 * - `ApiClientError` instances are translated by `errors.<code>` — falling back
 *   to `errors.UNKNOWN` when the code has no dedicated message. The original
 *   `error.message` is not shown because after Phase 2 Path A the API client
 *   stores only codes in `message` (server-supplied Chinese copy never reaches
 *   the UI verbatim).
 * - Any other `Error` falls through to `error.message` (developer/runtime
 *   errors whose text is usually English/technical).
 */
export function useTranslateError(): (error: unknown) => string {
  const t = useTranslations('errors');
  return (error: unknown) => {
    if (error instanceof ApiClientError) {
      try {
        // `t(code)` resolves `errors.<code>`. Codes without a dedicated entry
        // fall back to `errors.UNKNOWN`.
        return t(error.code, { status: error.status });
      } catch {
        return t('UNKNOWN');
      }
    }
    if (error instanceof Error && error.message) return error.message;
    return t('UNKNOWN');
  };
}
