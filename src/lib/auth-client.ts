import { createAuthClient } from 'better-auth/react';

const baseURL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.bridgingchina.net';

export const authClient = createAuthClient({ baseURL });

export const { useSession, signIn, signOut, getSession } = authClient;
