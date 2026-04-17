import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { QUERY_DEFAULTS } from '../../constants/config';
import type { ApiResponse, KnowledgeTree, KnowledgePointDetail, BridgeListItem, FlashCard } from '../types';

const KNOWLEDGE_TREE_SCHEMA_VERSION = 'v2-3layer';

export function useKnowledgeTree(depth?: number) {
  return useQuery({
    queryKey: ['knowledgeTree', KNOWLEDGE_TREE_SCHEMA_VERSION, depth],
    queryFn: () => apiClient.get<ApiResponse<KnowledgeTree>>('/knowledge/tree', { depth }),
    staleTime: QUERY_DEFAULTS.knowledgeTree.staleTime,
    select: (res) => res.data,
  });
}

export function useKnowledgePointDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['knowledgePoint', id],
    queryFn: () => apiClient.get<ApiResponse<KnowledgePointDetail>>(`/knowledge/points/${id}`),
    enabled: !!id,
    staleTime: QUERY_DEFAULTS.detail.staleTime,
    select: (res) => res.data,
  });
}

export function useKnowledgePointBridges(id: string | undefined, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['knowledgePointBridges', id, page],
    queryFn: () => apiClient.get<ApiResponse<{ bridges: BridgeListItem[] }>>(`/knowledge/points/${id}/bridges`, { page, page_size: pageSize }),
    enabled: !!id,
    staleTime: QUERY_DEFAULTS.detail.staleTime,
  });
}

export function useKnowledgePointFlashcards(id: string | undefined, cardType?: string) {
  return useQuery({
    queryKey: ['knowledgePointFlashcards', id, cardType],
    queryFn: () => apiClient.get<ApiResponse<{ cards: FlashCard[] }>>(`/knowledge/points/${id}/flashcards`, { card_type: cardType }),
    enabled: !!id,
    staleTime: QUERY_DEFAULTS.detail.staleTime,
    select: (res) => res.data.cards,
  });
}
