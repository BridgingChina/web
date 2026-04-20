import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';

const mockUser = {
  id: 'u_123',
  email: 'test@example.com',
  name: 'Test',
  username: null,
  emailVerified: true,
  role: 'user',
  isActive: true,
};

const mockSession = {
  id: 's_456',
  userId: 'u_123',
  expiresAt: Date.now() + 3600_000,
};

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
  });

  it('starts with all fields null', () => {
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.jwt).toBeNull();
    expect(state.jwtExpiresAt).toBeNull();
  });

  it('setSession stores both session and user', () => {
    useAuthStore.getState().setSession(mockSession, mockUser);
    const state = useAuthStore.getState();
    expect(state.session).toEqual(mockSession);
    expect(state.user).toEqual(mockUser);
  });

  it('setJwt stores jwt and expiry', () => {
    const exp = Math.floor(Date.now() / 1000) + 900;
    useAuthStore.getState().setJwt('eyJ.fake.jwt', exp);
    const state = useAuthStore.getState();
    expect(state.jwt).toBe('eyJ.fake.jwt');
    expect(state.jwtExpiresAt).toBe(exp);
  });

  it('clear resets every field to null', () => {
    useAuthStore.getState().setSession(mockSession, mockUser);
    useAuthStore.getState().setJwt('jwt', 999);
    useAuthStore.getState().clear();
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.jwt).toBeNull();
    expect(state.jwtExpiresAt).toBeNull();
  });

  it('setSession(null, null) clears identity but keeps jwt independent', () => {
    useAuthStore.getState().setJwt('jwt', 999);
    useAuthStore.getState().setSession(null, null);
    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.jwt).toBe('jwt');
  });
});
