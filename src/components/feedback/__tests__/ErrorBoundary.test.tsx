import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';

function Bomb({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error('boom');
  return <p>safe</p>;
}

describe('ErrorBoundary', () => {
  it('renders children when no error', () => {
    render(<ErrorBoundary><Bomb shouldThrow={false} /></ErrorBoundary>);
    expect(screen.getByText('safe')).toBeInTheDocument();
  });

  it('renders fallback ErrorState when child throws', () => {
    // Suppress React's error log noise in test output
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<ErrorBoundary><Bomb shouldThrow={true} /></ErrorBoundary>);
    expect(screen.getByText('界面渲染出错')).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
    errSpy.mockRestore();
  });
});
