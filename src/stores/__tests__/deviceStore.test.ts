import { describe, it, expect, beforeEach } from 'vitest';
import { useDeviceStore } from '../deviceStore';

describe('deviceStore', () => {
  beforeEach(() => {
    useDeviceStore.setState({ language: 'zh-CN' });
  });

  it('starts with zh-CN language', () => {
    const state = useDeviceStore.getState();
    expect(state.language).toBe('zh-CN');
  });

  it('setLanguage updates language', () => {
    useDeviceStore.getState().setLanguage('en');
    expect(useDeviceStore.getState().language).toBe('en');
  });
});
