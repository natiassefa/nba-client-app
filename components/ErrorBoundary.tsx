'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="text-[var(--color-ios-red)] text-lg font-semibold mb-2">
              Something went wrong
            </div>
            <div className="text-[var(--color-system-gray-2)] text-sm text-center">
              {this.state.error?.message || 'An unexpected error occurred'}
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

