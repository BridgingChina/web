'use client';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useQAStore } from '@/stores/qaStore';
import { QAResult } from './QAResult';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { askQuestion } from '@/lib/sse-client';
import type {
  QAOutlineEvent, QADetailEvent, QADeepDiveEvent, QASourcesEvent, QAErrorEvent,
} from '@/api/types';

export function QASheet() {
  const { isOpen, close, context, status,
    setQuestion, setStatus, setOutline, addDetail, setDeepDive, setSources, setError,
  } = useQAStore();
  const [text, setText] = useState('');

  async function submit() {
    const q = text.trim();
    if (!q || status === 'connecting' || status === 'streaming') return;
    setQuestion(q);
    setStatus('connecting');
    try {
      for await (const ev of askQuestion({
        question: q,
        context: context.type ? { type: context.type, id: context.id, filters: context.filters } : undefined,
      })) {
        switch (ev.event) {
          case 'started': break;
          case 'outline':   setOutline(ev.data as QAOutlineEvent); break;
          case 'detail':    addDetail(ev.data as QADetailEvent); break;
          case 'deep_dive': setDeepDive(ev.data as QADeepDiveEvent); break;
          case 'sources':   setSources(ev.data as QASourcesEvent); break;
          case 'done':      setStatus('done'); break;
          case 'error':     setError(ev.data as QAErrorEvent); break;
          case 'ping': break;
        }
      }
      // If loop ended without explicit 'done' or 'error', mark done.
      const finalStatus = useQAStore.getState().status;
      if (finalStatus === 'connecting' || finalStatus === 'streaming') setStatus('done');
    } catch {
      setError({ code: 'NETWORK', message: '网络异常，请稍后重试', fallback_actions: [] });
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(v) => !v && close()}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>提问</SheetTitle>
          {context.label && <SheetDescription>关于：{context.label}</SheetDescription>}
        </SheetHeader>
        <div className="mt-4 flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }}
            placeholder="例如：赵州桥的敞肩拱有什么结构优势？"
            disabled={status === 'connecting' || status === 'streaming'}
          />
          <Button
            onClick={submit}
            disabled={!text.trim() || status === 'connecting' || status === 'streaming'}
          >
            {status === 'connecting' || status === 'streaming' ? '回答中…' : '提问'}
          </Button>
        </div>
        {status !== 'idle' && (
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{status}</Badge>
          </div>
        )}
        <div className="mt-4 flex-1 overflow-y-auto pr-2">
          <QAResult />
        </div>
      </SheetContent>
    </Sheet>
  );
}
