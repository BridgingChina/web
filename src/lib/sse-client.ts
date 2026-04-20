import { useDeviceStore } from '@/stores/deviceStore';

export type SSEEvent = { event: string; data: unknown };

export interface AskRequest {
  question: string;
  context?: { type: string | null; id?: string; filters?: Record<string, unknown> };
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
  const { language } = useDeviceStore.getState();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'text/event-stream',
    'Accept-Language': language,
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
