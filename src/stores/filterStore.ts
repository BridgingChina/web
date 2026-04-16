import { create } from 'zustand';

interface FilterState {
  bridgeType: string[];
  era: string[];
  region: string | null;
  searchType: 'all' | 'knowledge_point' | 'bridge';
  knowledgeLine: string | null;
  knowledgeCategory: string | null;
  setBridgeType: (types: string[]) => void;
  setEra: (eras: string[]) => void;
  setRegion: (region: string | null) => void;
  setSearchType: (type: 'all' | 'knowledge_point' | 'bridge') => void;
  setKnowledgeLine: (line: string | null) => void;
  setKnowledgeCategory: (category: string | null) => void;
  resetFilters: () => void;
}

const initialState = {
  bridgeType: [] as string[],
  era: [] as string[],
  region: null as string | null,
  searchType: 'all' as const,
  knowledgeLine: null as string | null,
  knowledgeCategory: null as string | null,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  setBridgeType: (types) => set({ bridgeType: types }),
  setEra: (eras) => set({ era: eras }),
  setRegion: (region) => set({ region }),
  setSearchType: (type) => set({ searchType: type }),
  setKnowledgeLine: (line) => set({ knowledgeLine: line, knowledgeCategory: null }),
  setKnowledgeCategory: (category) => set({ knowledgeCategory: category }),
  resetFilters: () => set(initialState),
}));
