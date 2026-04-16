'use client';
import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png'];

interface Props {
  onSelect: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onSelect, disabled }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError('仅支持 JPEG / PNG 图片');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('图片不能超过 5MB');
      return;
    }
    onSelect(file);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0]);
  }

  return (
    <div className="space-y-2">
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'flex flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed p-12 transition-colors',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-accent/30',
          dragOver && 'border-primary bg-accent/40',
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">拖拽图片到此处，或点击选择文件</p>
        <p className="text-xs text-muted-foreground">JPEG / PNG · 最大 5MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={onChange}
          disabled={disabled}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
