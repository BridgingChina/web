import { create } from 'zustand';
import type {
  QAOutlineEvent,
  QADetailEvent,
  QADeepDiveEvent,
  QASourcesEvent,
  QAErrorEvent,
  QAStartedEvent,
  QADoneEvent,
} from '../api/types';

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
  /** Locale the backend committed to answering in — set from `started`. */
  locale: 'zh-CN' | 'en-US' | null;
  /** Optional backend echo of the Chinese translation when locale === 'en-US'. */
  questionZh: string | null;
  /** True when English generation failed and the answer fell back to Chinese. */
  degraded: boolean;
  /** Machine-readable reason attached to `done.degraded`, e.g. `translate_answer_failed`. */
  degradedReason: string | null;
  outline: QAOutlineEvent | null;
  details: Record<string, QADetailEvent>;
  deepDive: QADeepDiveEvent | null;
  sources: QASourcesEvent | null;
  error: QAErrorEvent | null;
  /** Per-evidence-chunk toggle for the "Show original Chinese" disclosure. */
  showOriginal: Record<string, boolean>;
  open: (context: QAContext) => void;
  close: () => void;
  setQuestion: (q: string) => void;
  setStatus: (s: QAStatus) => void;
  setStarted: (e: QAStartedEvent) => void;
  setOutline: (o: QAOutlineEvent) => void;
  addDetail: (d: QADetailEvent) => void;
  setDeepDive: (dd: QADeepDiveEvent) => void;
  setSources: (s: QASourcesEvent) => void;
  setDone: (d: QADoneEvent) => void;
  setError: (e: QAErrorEvent) => void;
  toggleShowOriginal: (chunkKey: string) => void;
  reset: () => void;
}

const initialQA = {
  isOpen: false,
  status: 'idle' as QAStatus,
  context: { type: null } as QAContext,
  question: '',
  locale: null as 'zh-CN' | 'en-US' | null,
  questionZh: null as string | null,
  degraded: false,
  degradedReason: null as string | null,
  outline: null as QAOutlineEvent | null,
  details: {} as Record<string, QADetailEvent>,
  deepDive: null as QADeepDiveEvent | null,
  sources: null as QASourcesEvent | null,
  error: null as QAErrorEvent | null,
  showOriginal: {} as Record<string, boolean>,
};

export const useQAStore = create<QAState>((set) => ({
  ...initialQA,
  open: (context) => set({ ...initialQA, isOpen: true, context }),
  close: () => set({ isOpen: false, status: 'idle' }),
  setQuestion: (q) => set({ question: q }),
  setStatus: (s) => set({ status: s }),
  setStarted: (e) => set({ locale: e.locale, questionZh: e.question_zh ?? null }),
  setOutline: (o) => set({ outline: o, status: 'streaming' }),
  addDetail: (d) => set((state) => ({ details: { ...state.details, [d.key_point_id]: d } })),
  setDeepDive: (dd) => set({ deepDive: dd }),
  setSources: (s) => set({ sources: s }),
  setDone: (d) => set((state) => ({
    status: 'done',
    // `done` may carry an authoritative locale override (e.g. if the backend
    // downgraded to zh during streaming); prefer it when present but keep
    // the `started` value as a safe default.
    locale: d.locale ?? state.locale,
    degraded: d.degraded ?? false,
    degradedReason: d.reason ?? null,
  })),
  setError: (e) => set({ error: e, status: 'error' }),
  toggleShowOriginal: (chunkKey) =>
    set((state) => ({
      showOriginal: { ...state.showOriginal, [chunkKey]: !state.showOriginal[chunkKey] },
    })),
  reset: () => set(initialQA),
}));
