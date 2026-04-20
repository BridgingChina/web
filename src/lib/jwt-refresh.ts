import { useAuthStore } from '@/stores/authStore';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.bridgingchina.net';
const REFRESH_BUFFER_SECONDS = 60;

let inFlight: Promise<string | null> | null = null;

export function decodeJwtExp(jwt: string): number | null {
  const parts = jwt.split('.');
  if (parts.length !== 3) return null;
  try {
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payloadB64 + '='.repeat((4 - (payloadB64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as { exp?: unknown };
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

async function doRefresh(): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch(`${AUTH_URL}/api/auth/token`, { credentials: 'include' });
  } catch {
    useAuthStore.getState().clear();
    return null;
  }

  if (!res.ok) {
    useAuthStore.getState().clear();
    return null;
  }

  const body = (await res.json().catch(() => null)) as { token?: unknown } | null;
  const token = body && typeof body.token === 'string' ? body.token : null;
  if (!token) {
    useAuthStore.getState().clear();
    return null;
  }

  const exp = decodeJwtExp(token);
  if (exp === null) {
    useAuthStore.getState().clear();
    return null;
  }

  useAuthStore.getState().setJwt(token, exp);
  return token;
}

export function refreshJwt(): Promise<string | null> {
  if (inFlight) return inFlight;
  inFlight = doRefresh().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

export async function ensureFreshJwt(): Promise<string | null> {
  const { jwt, jwtExpiresAt } = useAuthStore.getState();
  const nowSec = Math.floor(Date.now() / 1000);
  if (jwt && jwtExpiresAt && jwtExpiresAt - nowSec > REFRESH_BUFFER_SECONDS) return jwt;
  return refreshJwt();
}
