import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { QUERY_DEFAULTS } from '../../constants/config';
import type { ApiResponse, FavoriteItem, FavoriteCheckResult } from '../types';

export function useFavoriteList(type?: string, page = 1) {
  return useQuery({
    queryKey: ['favorites', type, page],
    queryFn: () => apiClient.get<ApiResponse<{ items: FavoriteItem[] }>>('/favorites', { type, page, page_size: 20 }),
    staleTime: QUERY_DEFAULTS.realtime.staleTime,
  });
}

export function useFavoriteCheck(targets: { type: string; id: string }[] | null) {
  return useQuery({
    queryKey: ['favoriteCheck', targets],
    queryFn: () => apiClient.post<ApiResponse<{ results: FavoriteCheckResult }>>('/favorites/check', { targets }),
    enabled: !!targets && targets.length > 0,
    select: (res) => res.data.results,
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { target_type: string; target_id: string }) => apiClient.post('/favorites', input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favoriteCheck'] });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (favoriteId: string) => apiClient.delete(`/favorites/${favoriteId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favoriteCheck'] });
    },
  });
}
