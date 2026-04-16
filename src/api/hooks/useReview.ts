import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { QUERY_DEFAULTS } from '../../constants/config';
import type { ApiResponse, ReviewTodayResponse, ReviewCard } from '../types';

export function useReviewToday() {
  return useQuery({
    queryKey: ['reviewToday'],
    queryFn: () => apiClient.get<ApiResponse<ReviewTodayResponse>>('/review/today'),
    staleTime: QUERY_DEFAULTS.reviewToday.staleTime,
    select: (res) => res.data,
  });
}

export function useReviewCards(page = 1) {
  return useQuery({
    queryKey: ['reviewCards', page],
    queryFn: () => apiClient.get<ApiResponse<{ cards: ReviewCard[] }>>('/review/cards', { page, page_size: 20 }),
  });
}

export function useUpdateReviewProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { flashcardId: string; mastery: 'mastered' | 'needs_review' }) =>
      apiClient.put(`/review/progress/${input.flashcardId}`, { mastery: input.mastery }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviewToday'] });
      queryClient.invalidateQueries({ queryKey: ['reviewCards'] });
    },
  });
}
