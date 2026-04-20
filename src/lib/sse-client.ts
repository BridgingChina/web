import { useDeviceStore } from '@/stores/deviceStore';

export type SSEEvent = { event: string; data: unknown };

export interface AskRequest {
  question: string;
  context?: { type: string | null; id?: string; filters?: Record<string, unknown> };
}

const DEFAULT_LOCALE = 'zh-CN';

// Mirror of `src/api/client.ts#readLocaleCookie` — pulled inline because the
// SSE code path used to read a device-local preference and we don't want to
// take a dependency on the whole API client module. Keep the two readers in
// sync: both resolve `NEXT_LOCALE` on client runtime and return null on SSR.
function readLocaleCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Resolve the active locale for SSE requests. Phase 4 makes the browser's
 * locale cookie (set by next-intl middleware) the source of truth so that the
 * QA backend can branch on `Accept-Language: en-US` without the user having
 * to flip a separate deviceStore toggle. Falls back to `deviceStore.language`
 * (normalised to the BCP-47 form) so that any legacy caller that sets the
 * store still gets a sensible header.
 */
function resolveLocale(): string {
  const cookie = readLocaleCookie();
  if (cookie) return cookie;
  const { language } = useDeviceStore.getState();
  if (language === 'en') return 'en-US';
  return language ?? DEFAULT_LOCALE;
}

export function parseSSEFrames(buf: string): { events: SSEEvent[]; remainder: string } {
  const out: SSEEvent[] = [];
  const parts = buf.split('\n\n');
  const remainder = parts.pop() ?? '';
  for (const block of parts) {
    if (!block.trim() && block !== '') continue;
    let event = 'message';
    const dataLines: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    const raw = dataLines.join('\n');
    let data: unknown = raw;
    try { data = raw === '' ? '' : JSON.parse(raw); } catch { /* keep raw */ }
    out.push({ event, data });
  }
  return { events: out, remainder };
}

export async function* askQuestion(req: AskRequest, signal?: AbortSignal): AsyncGenerator<SSEEvent> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    'Accept-Language': resolveLocale(),
  };

  let res: Response;
  try {
    res = await fetch(`${baseUrl}/qa/ask`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
      signal,
    });
  } catch {
    // `message` is a code — QAResult translates via `t(\`errors.\${code}\`)`.
    yield {
      event: 'error',
      data: { code: 'SSE_CONNECT_FAILED', message: 'SSE_CONNECT_FAILED', fallback_actions: [] },
    };
    return;
  }

  if (!res.ok || !res.body) {
    yield {
      event: 'error',
      data: { code: 'HTTP_ERROR', message: 'HTTP_ERROR', status: res.status, fallback_actions: [] },
    };
    return;
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += value;
    const { events, remainder } = parseSSEFrames(buf);
    for (const ev of events) yield ev;
    buf = remainder;
  }
}
