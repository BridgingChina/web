import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '../client';
import { QUERY_DEFAULTS } from '../../constants/config';
import type { ApiResponse, BridgeListItem, ClustersResponse, BridgeDetail } from '../types';

interface BridgeListParams {
  bridge_type?: string;
  era?: string;
  region?: string;
  keyword?: string;
  near_lat?: number;
  near_lng?: number;
  near_radius?: number;
  sort?: string;
  page?: number;
  page_size?: number;
}

export function useBridgeList(params: BridgeListParams) {
  return useQuery({
    queryKey: ['bridges', params],
    queryFn: () => apiClient.get<ApiResponse<{ bridges: BridgeListItem[] }>>('/bridges', params as Record<string, string | number | undefined>),
    staleTime: QUERY_DEFAULTS.bridgeList.staleTime,
    placeholderData: keepPreviousData,
  });
}

interface ClusterParams {
  bounds_ne_lat: number;
  bounds_ne_lng: number;
  bounds_sw_lat: number;
  bounds_sw_lng: number;
  zoom: number;
  bridge_type?: string;
  era?: string;
  region?: string;
}

export function useBridgeClusters(params: ClusterParams | null) {
  return useQuery({
    queryKey: ['bridgeClusters', params],
    queryFn: () => apiClient.get<ApiResponse<ClustersResponse>>('/bridges/clusters', params as unknown as Record<string, string | number | undefined>),
    enabled: !!params,
    staleTime: QUERY_DEFAULTS.realtime.staleTime,
    select: (res) => res.data,
  });
}

export function useBridgeDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['bridge', id],
    queryFn: () => apiClient.get<ApiResponse<BridgeDetail>>(`/bridges/${id}`),
    enabled: !!id,
    staleTime: QUERY_DEFAULTS.detail.staleTime,
    select: (res) => res.data,
  });
}

export function useBridgeKnowledgePoints(id: string | undefined) {
  return useQuery({
    queryKey: ['bridgeKnowledgePoints', id],
    queryFn: () => apiClient.get<ApiResponse<{ knowledge_points: { id: string; name: string; line: string; relevance: string }[] }>>(`/bridges/${id}/knowledge-points`),
    enabled: !!id,
    staleTime: QUERY_DEFAULTS.detail.staleTime,
    select: (res) => res.data.knowledge_points,
  });
}
