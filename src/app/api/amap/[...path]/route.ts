import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

type AmapEnv = { AMAP_SECURITY_CODE?: string };

function getJscode(): string {
  try {
    const { env } = getCloudflareContext();
    const v = (env as unknown as AmapEnv).AMAP_SECURITY_CODE;
    if (v) return v;
  } catch {
    // Not in Worker runtime (test/build-time) — fall through to process.env.
  }
  return process.env.AMAP_SECURITY_CODE ?? '';
}

// AMap 官方 serviceHost 代理约定：
// - 底图样式：webapi.amap.com/v4/map/styles/*
// - 其余服务：restapi.amap.com/*
function resolveUpstream(segments: string[]): string {
  if (segments[0] === 'v4' && segments[1] === 'map' && segments[2] === 'styles') {
    return 'https://webapi.amap.com';
  }
  return 'https://restapi.amap.com';
}

const HOP_BY_HOP = new Set([
  'host',
  'connection',
  'cookie',
  'content-length',
  'accept-encoding',
]);

function forwardHeaders(src: Headers): Headers {
  const out = new Headers();
  src.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) out.set(key, value);
  });
  return out;
}

async function proxy(req: NextRequest, segments: string[]): Promise<Response> {
  if (!segments || segments.length === 0) {
    return new Response('bad path', { status: 400 });
  }

  const upstream = new URL(`${resolveUpstream(segments)}/${segments.join('/')}`);
  new URL(req.url).searchParams.forEach((v, k) => upstream.searchParams.set(k, v));

  const jscode = getJscode();
  if (jscode) upstream.searchParams.set('jscode', jscode);

  const init: RequestInit = {
    method: req.method,
    headers: forwardHeaders(req.headers),
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer();
  }

  const res = await fetch(upstream.toString(), init);
  return new Response(res.body, { status: res.status, headers: res.headers });
}

type RouteCtx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: RouteCtx) {
  return proxy(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: RouteCtx) {
  return proxy(req, (await params).path);
}
