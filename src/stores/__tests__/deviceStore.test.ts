import { describe, it, expect, beforeEach } from 'vitest';
import { useDeviceStore } from '../deviceStore';

describe('deviceStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useDeviceStore.setState({ deviceId: '', language: 'zh-CN' });
  });

  it('starts with empty deviceId and zh-CN language', () => {
    const state = useDeviceStore.getState();
    expect(state.deviceId).toBe('');
    expect(state.language).toBe('zh-CN');
  });

  it('init() generates and stores deviceId via getOrCreateDeviceId', () => {
    useDeviceStore.getState().init();
    const id = useDeviceStore.getState().deviceId;
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(localStorage.getItem('bridgingchina.device_id')).toBe(id);
  });

  it('init() is idempotent (calling twice returns same id)', () => {
    useDeviceStore.getState().init();
    const first = useDeviceStore.getState().deviceId;
    useDeviceStore.getState().init();
    const second = useDeviceStore.getState().deviceId;
    expect(first).toBe(second);
  });

  it('setLanguage updates language', () => {
    useDeviceStore.getState().setLanguage('en');
    expect(useDeviceStore.getState().language).toBe('en');
  });
});
