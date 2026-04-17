export const DEVICE_ID_KEY = 'bridgingchina.device_id';
const LEGACY_DEVICE_ID_KEY = 'archtrail.device_id';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  const existing = window.localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const legacy = window.localStorage.getItem(LEGACY_DEVICE_ID_KEY);
  if (legacy) {
    window.localStorage.setItem(DEVICE_ID_KEY, legacy);
    window.localStorage.removeItem(LEGACY_DEVICE_ID_KEY);
    return legacy;
  }
  const id = crypto.randomUUID();
  window.localStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}
