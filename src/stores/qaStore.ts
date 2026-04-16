import { create } from 'zustand';
import type { QAOutlineEvent, QADetailEvent, QADeepDiveEvent, QASourcesEvent, QAErrorEvent } from '../api/types';

type QAStatus = 'idle' | 'connecting' | 'streaming' | 'done' | 'error';

interface QAContext {
  type: 'bridge' | 'knowledge_point' | 'search' | 'map' | null;
  id?: string;
  label?: string;
  filters?: Record<string, unknown>;
}

interface QAState {
  isOpen: boolean;
  status: QAStatus;
  context: QAContext;
  question: string;
  outline: QAOutlineEvent | null;
  details: Record<string, QADetailEvent>;
  deepDive: QADeepDiveEvent | null;
  sources: QASourcesEvent | null;
  error: QAErrorEvent | null;
  open: (context: QAContext) => void;
  close: () => void;
  setQuestion: (q: string) => void;
  setStatus: (s: QAStatus) => void;
  setOutline: (o: QAOutlineEvent) => void;
  addDetail: (d: QADetailEvent) => void;
  setDeepDive: (dd: QADeepDiveEvent) => void;
  setSources: (s: QASourcesEvent) => void;
  setError: (e: QAErrorEvent) => void;
  reset: () => void;
}

const initialQA = {
  isOpen: false,
  status: 'idle' as QAStatus,
  context: { type: null } as QAContext,
  question: '',
  outline: null as QAOutlineEvent | null,
  details: {} as Record<string, QADetailEvent>,
  deepDive: null as QADeepDiveEvent | null,
  sources: null as QASourcesEvent | null,
  error: null as QAErrorEvent | null,
};

export const useQAStore = create<QAState>((set) => ({
  ...initialQA,
  open: (context) => set({ ...initialQA, isOpen: true, context }),
  close: () => set({ isOpen: false, status: 'idle' }),
  setQuestion: (q) => set({ question: q }),
  setStatus: (s) => set({ status: s }),
  setOutline: (o) => set({ outline: o, status: 'streaming' }),
  addDetail: (d) => set((state) => ({ details: { ...state.details, [d.key_point_id]: d } })),
  setDeepDive: (dd) => set({ deepDive: dd }),
  setSources: (s) => set({ sources: s }),
  setError: (e) => set({ error: e, status: 'error' }),
  reset: () => set(initialQA),
}));
