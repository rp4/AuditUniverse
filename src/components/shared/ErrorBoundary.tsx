/**
 * Error Boundary Component
 *
 * Catches and displays errors gracefully
 */

import { Component, ReactNode } from 'react';
import { logger } from '../../lib/logger';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logger.error('ErrorBoundary caught error', error, {
      component: 'ErrorBoundary',
      errorInfo: errorInfo?.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-av-background flex items-center justify-center p-8">
          <div className="glass-panel p-8 border border-red-500/30 max-w-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <h2 className="text-2xl font-bold text-red-500">Something went wrong</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">
                An unexpected error occurred while rendering the application.
              </p>

              {this.state.error && (
                <div className="bg-av-panel-dark p-4 rounded border border-av-border">
                  <div className="text-sm font-mono text-red-400">
                    {this.state.error.message}
                  </div>
                </div>
              )}

              <button
                onClick={() => window.location.reload()}
                className="btn-primary px-6 py-3 rounded font-semibold"
              >
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
