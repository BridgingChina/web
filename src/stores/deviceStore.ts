import { create } from 'zustand';

interface DeviceState {
  language: 'zh-CN' | 'en';
  setLanguage: (lang: 'zh-CN' | 'en') => void;
}

export const useDeviceStore = create<DeviceState>((set) => ({
  language: 'zh-CN',
  setLanguage: (language) => set({ language }),
}));
