'use client';
import { Component, ReactNode } from 'react';
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
      return (
        <ErrorState
          title="界面渲染出错"
          message={this.state.error.message || '请刷新页面重试'}
          onRetry={this.reset}
        />
      );
    }
    return this.props.children;
  }
}
