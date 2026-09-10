import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[160px] p-6 bg-[#18181b] border border-[#ff4444]/40 rounded flex flex-col items-center justify-center text-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff4444] animate-ping mb-3" />
          <h4 className="text-xs font-mono font-bold text-[#ff4444] uppercase tracking-wider mb-1">
            {this.props.fallbackTitle || 'Component Telemetry Interrupted'}
          </h4>
          <p className="text-[10px] font-mono text-[#a1a1aa] max-w-sm mb-3">
            {this.state.error?.message || 'Recovering visual subsystem...'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-3 py-1 bg-[#27272a] hover:bg-[#3f3f46] text-[#00e5ff] text-[10px] font-mono rounded border border-[#3f3f46] cursor-pointer transition-colors"
          >
            Reinitialize Module
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
