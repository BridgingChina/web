import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askQuestion, parseSSEFrames } from '../sse-client';
import { useDeviceStore } from '@/stores/deviceStore';

describe('parseSSEFrames', () => {
  it('parses well-formed event blocks', () => {
    const input = 'event: outline\ndata: {"key_points":[]}\n\nevent: done\ndata: {"qa_id":"x"}\n\n';
    const { events, remainder } = parseSSEFrames(input);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ event: 'outline', data: { key_points: [] } });
    expect(events[1]).toEqual({ event: 'done', data: { qa_id: 'x' } });
    expect(remainder).toBe('');
  });

  it('keeps partial frame in remainder', () => {
    const input = 'event: outline\ndata: {"key_points":[]}\n\nevent: detail\ndata: {"key';
    const { events, remainder } = parseSSEFrames(input);
    expect(events).toHaveLength(1);
    expect(remainder.startsWith('event: detail')).toBe(true);
  });

  it('defaults event name to "message" when omitted', () => {
    const input = 'data: {"x":1}\n\n';
    const { events } = parseSSEFrames(input);
    expect(events[0].event).toBe('message');
    expect(events[0].data).toEqual({ x: 1 });
  });

  it('keeps non-JSON data as raw string', () => {
    const input = 'event: ping\ndata: \n\n';
    const { events } = parseSSEFrames(input);
    expect(events[0].event).toBe('ping');
    // Empty data parses as empty string (JSON.parse of "" throws → fallback to raw)
    expect(events[0].data).toBe('');
  });
});

describe('askQuestion', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.stubEnv('NEXT_PUBLIC_API_BASE_URL', 'http://test/v1');
    useDeviceStore.setState({ deviceId: '', language: 'zh-CN' });
  });

  it('yields parsed events from a stream response', async () => {
    const sse =
      'event: started\ndata: {"qa_id":"q1"}\n\n' +
      'event: outline\ndata: {"key_points":[{"id":"k1","summary":"s","order":1}]}\n\n' +
      'event: done\ndata: {"qa_id":"q1"}\n\n';
    vi.stubGlobal('fetch', vi.fn(async () => new Response(sse, { status: 200 })));

    const out: { event: string; data: unknown }[] = [];
    for await (const ev of askQuestion({ question: 'hi' })) out.push(ev);
    expect(out.map(e => e.event)).toEqual(['started', 'outline', 'done']);
  });

  it('yields error event when response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('x', { status: 500 })));

    const out: { event: string }[] = [];
    for await (const ev of askQuestion({ question: 'hi' })) out.push(ev);
    expect(out).toHaveLength(1);
    expect(out[0].event).toBe('error');
  });

  it('does NOT send X-Device-Id header (QA endpoint is anonymous, header dropped Phase 4)', async () => {
    let captured: RequestInit | null = null;
    const sse = 'event: done\ndata: {}\n\n';
    vi.stubGlobal('fetch', vi.fn(async (_url: string, init: RequestInit) => {
      captured = init;
      return new Response(sse, { status: 200 });
    }));

    for await (const _ of askQuestion({ question: 'hi' })) { /* drain */ }
    const headers = captured!.headers as Record<string, string>;
    expect(headers['X-Device-Id']).toBeUndefined();
    expect(headers['Accept']).toBe('text/event-stream');
    expect(headers['Accept-Language']).toBe('zh-CN');
  });
});
