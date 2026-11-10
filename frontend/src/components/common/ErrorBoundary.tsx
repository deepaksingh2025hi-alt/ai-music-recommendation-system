import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen bg-[#121118] text-white flex flex-col items-center justify-center p-6 select-none">
          <div className="glass-window max-w-md w-full p-8 rounded-3xl text-center space-y-4 border border-white/20 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 mx-auto flex items-center justify-center border border-rose-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">Something went wrong</h2>
            <p className="text-xs text-white/60 leading-relaxed">
              AuraPulse encountered an unexpected interface error. Click below to refresh your session.
            </p>
            {this.state.error?.message && (
              <p className="text-[11px] font-mono text-rose-300/80 bg-black/40 p-2.5 rounded-xl border border-white/10 break-words">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-white text-black text-xs font-bold shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload AuraPulse</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

