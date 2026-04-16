import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../client';
import { QUERY_DEFAULTS } from '../../constants/config';
import type { ApiResponse, AppConfig } from '../types';

export function useConfig() {
  return useQuery({
    queryKey: ['config'],
    queryFn: () => apiClient.get<ApiResponse<AppConfig>>('/config'),
    staleTime: QUERY_DEFAULTS.config.staleTime,
    select: (res) => res.data,
  });
}
