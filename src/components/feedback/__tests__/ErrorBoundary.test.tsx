import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import messages from '@/messages/zh-CN.json';
import { ErrorBoundary } from '../ErrorBoundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('boom');
  return <p>safe</p>;
}

function wrap(ui: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="zh-CN" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(wrap(<ErrorBoundary><Bomb shouldThrow={false} /></ErrorBoundary>));
    expect(screen.getByText('safe')).toBeInTheDocument();
  });

  it('renders fallback ErrorState when child throws', () => {
    // Suppress React's error log noise in test output
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(wrap(<ErrorBoundary><Bomb shouldThrow={true} /></ErrorBoundary>));
    // Title comes from messages.errors.boundary_title (zh-CN).
    expect(screen.getByText(messages.errors.boundary_title)).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
    errSpy.mockRestore();
  });
});
