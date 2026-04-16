'use client';
import { useEffect } from 'react';
import { useRecordHistory } from '@/api/hooks/useHistory';

export function RecordHistoryOnMount({ targetType, targetId }: { targetType: 'bridge' | 'knowledge_point'; targetId: string }) {
  const { mutate } = useRecordHistory();
  useEffect(() => {
    if (!targetId) return;
    mutate({ target_type: targetType, target_id: targetId });
  }, [targetType, targetId, mutate]);
  return null;
}
