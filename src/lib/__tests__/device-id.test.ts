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
    expect(DEVICE_ID_KEY).toBe('archtrail.device_id');
  });
});
