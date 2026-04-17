import { describe, it, expect, beforeEach } from 'vitest';
import { getOrCreateDeviceId, DEVICE_ID_KEY } from '../device-id';

describe('device-id', () => {
  beforeEach(() => { localStorage.clear(); });

  it('creates and persists a UUID v4 on first call', () => {
    const id = getOrCreateDeviceId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(localStorage.getItem(DEVICE_ID_KEY)).toBe(id);
  });

  it('returns the same id on subsequent calls', () => {
    const a = getOrCreateDeviceId();
    const b = getOrCreateDeviceId();
    expect(a).toBe(b);
  });

  it('exports a stable storage key constant', () => {
    expect(DEVICE_ID_KEY).toBe('bridgingchina.device_id');
  });

  it('migrates legacy archtrail.device_id key to new key', () => {
    const legacyId = '11111111-2222-4333-8444-555555555555';
    localStorage.setItem('archtrail.device_id', legacyId);
    const id = getOrCreateDeviceId();
    expect(id).toBe(legacyId);
    expect(localStorage.getItem(DEVICE_ID_KEY)).toBe(legacyId);
    expect(localStorage.getItem('archtrail.device_id')).toBeNull();
  });
});
