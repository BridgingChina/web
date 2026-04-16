import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../client';
import type { ApiResponse, RecognitionResponse } from '../types';

interface RecognitionInput {
  image: File;
  latitude?: number;
  longitude?: number;
}

export function useRecognition() {
  return useMutation({
    mutationFn: async (input: RecognitionInput) => {
      const formData = new FormData();
      formData.append('image', input.image, input.image.name);
      if (input.latitude != null) formData.append('latitude', String(input.latitude));
      if (input.longitude != null) formData.append('longitude', String(input.longitude));
      return apiClient.upload<ApiResponse<RecognitionResponse>>('/recognition', formData);
    },
  });
}
