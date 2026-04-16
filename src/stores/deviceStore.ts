import { create } from 'zustand';
import { getOrCreateDeviceId } from '@/lib/device-id';

interface DeviceState {
  deviceId: string;
  language: 'zh-CN' | 'en';
  init: () => void;
  setLanguage: (lang: 'zh-CN' | 'en') => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  deviceId: '',
  language: 'zh-CN',
  init: () => set({ deviceId: getOrCreateDeviceId() }),
  setLanguage: (language) => set({ language }),
}));
