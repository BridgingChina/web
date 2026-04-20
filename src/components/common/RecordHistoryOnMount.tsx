'use client';
import { useEffect } from 'react';
import { useRecordHistory } from '@/api/hooks/useHistory';
import { useSession } from '@/lib/auth-client';

export function RecordHistoryOnMount({ targetType, targetId }: { targetType: 'bridge' | 'knowledge_point'; targetId: string }) {
  const { data: session } = useSession();
  const { mutate } = useRecordHistory();
  useEffect(() => {
    if (!session || !targetId) return;
    mutate({ target_type: targetType, target_id: targetId });
  }, [session, targetType, targetId, mutate]);
  return null;
}
