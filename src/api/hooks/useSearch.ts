import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { apiClient } from '../client';
import { QUERY_DEFAULTS } from '../../constants/config';
import type { ApiResponse, SearchResponse } from '../types';

interface SearchParams {
  q: string;
  type?: string;
  bridge_type?: string;
  era?: string;
  region?: string;
  line?: string;
  category?: string;
  page?: number;
  page_size?: number;
}

export function useSearch(params: SearchParams | null) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => apiClient.get<ApiResponse<SearchResponse>>('/search', params as unknown as Record<string, string | number | undefined>),
    enabled: !!params?.q,
    staleTime: QUERY_DEFAULTS.realtime.staleTime,
    placeholderData: keepPreviousData,
  });
}
