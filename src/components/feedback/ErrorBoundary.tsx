'use client';
import { Component, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { ErrorState } from './ErrorState';

interface Props { children: ReactNode; fallback?: (error: Error, reset: () => void) => ReactNode; }
interface State { error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State { return { error }; }

  componentDidCatch(error: Error) {
    console.error('[ErrorBoundary]', error);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback(this.state.error, this.reset);
      return <BoundaryFallback error={this.state.error} onReset={this.reset} />;
    }
    return this.props.children;
  }
}

// Extracted so we can call `useTranslations` (hook) — class `render` cannot.
function BoundaryFallback({ error, onReset }: { error: Error; onReset: () => void }) {
  const t = useTranslations('errors');
  return (
    <ErrorState
      title={t('boundary_title')}
      message={error.message || t('boundary_fallback')}
      onRetry={onReset}
    />
  );
}
