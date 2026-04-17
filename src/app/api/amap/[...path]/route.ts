import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const dynamic = 'force-dynamic';

type AmapEnv = { AMAP_SECURITY_CODE?: string };

// Diagnostic-only metadata. Only booleans / lengths / key names are exposed —
// the secret value itself is never returned to the caller.
type JscodeMeta = {
  ctxEnvKeyCount: number;
  ctxHasSecret: boolean;
  ctxSecretLen: number;
  procEnvHasSecret: boolean;
  procEnvSecretLen: number;
};

async function readJscode(): Promise<{ jscode: string; meta: JscodeMeta }> {
  let ctxEnvKeyCount = -1;
  let ctxSecret = '';
  try {
    const { env } = await getCloudflareContext({ async: true });
    ctxEnvKeyCount = Object.keys(env as object).length;
    const v = (env as unknown as AmapEnv).AMAP_SECURITY_CODE;
    if (v) ctxSecret = v;
  } catch {
    // fall through
  }
  const procSecret = process.env.AMAP_SECURITY_CODE ?? '';
  return {
    jscode: ctxSecret || procSecret,
    meta: {
      ctxEnvKeyCount,
      ctxHasSecret: !!ctxSecret,
      ctxSecretLen: ctxSecret.length,
      procEnvHasSecret: !!procSecret,
      procEnvSecretLen: procSecret.length,
    },
  };
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

  const { jscode, meta } = await readJscode();
  if (jscode) upstream.searchParams.set('jscode', jscode);

  const init: RequestInit = {
    method: req.method,
    headers: forwardHeaders(req.headers),
  };
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    init.body = await req.arrayBuffer();
  }

  const res = await fetch(upstream.toString(), init);
  const outHeaders = new Headers(res.headers);
  // Temporary diagnostic — value never exposed, only metadata.
  outHeaders.set(
    'x-amap-jscode-probe',
    `ctxKeys=${meta.ctxEnvKeyCount};ctxHas=${meta.ctxHasSecret ? 1 : 0};ctxLen=${meta.ctxSecretLen};procHas=${meta.procEnvHasSecret ? 1 : 0};procLen=${meta.procEnvSecretLen}`,
  );
  return new Response(res.body, { status: res.status, headers: outHeaders });
}

type RouteCtx = { params: Promise<{ path: string[] }> };

export async function GET(req: NextRequest, { params }: RouteCtx) {
  return proxy(req, (await params).path);
}
export async function POST(req: NextRequest, { params }: RouteCtx) {
  return proxy(req, (await params).path);
}
