import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  emailVerified: boolean;
  role: string;
  isActive: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  expiresAt: number;
}

interface AuthState {
  session: AuthSession | null;
  user: AuthUser | null;
  jwt: string | null;
  jwtExpiresAt: number | null;
  setSession: (session: AuthSession | null, user: AuthUser | null) => void;
  setJwt: (jwt: string, expiresAt: number) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  jwt: null,
  jwtExpiresAt: null,
  setSession: (session, user) => set({ session, user }),
  setJwt: (jwt, jwtExpiresAt) => set({ jwt, jwtExpiresAt }),
  clear: () => set({ session: null, user: null, jwt: null, jwtExpiresAt: null }),
}));
