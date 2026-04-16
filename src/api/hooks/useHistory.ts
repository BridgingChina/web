import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { ApiResponse, HistoryItem } from '../types';

export function useHistory(page = 1) {
  return useQuery({
    queryKey: ['history', page],
    queryFn: () => apiClient.get<ApiResponse<{ items: HistoryItem[] }>>('/history', { page, page_size: 20 }),
  });
}

export function useRecordHistory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { target_type: string; target_id: string }) => apiClient.post('/history', input),
    onError: (error) => {
      // History recording is non-critical — log but don't show Alert
      console.warn('[RecordHistory]', error);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['history'] }); },
  });
}
