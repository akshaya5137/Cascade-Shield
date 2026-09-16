import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Cascade Shield ErrorBoundary caught:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-900 border border-rose-800/80 rounded-2xl text-slate-200 m-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-700 text-rose-400">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-mono">
                {this.props.fallbackTitle || 'Panel Render Exception Handled'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                The application prevented a black screen crash.
              </p>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-rose-300 break-all">
            {this.state.error?.message || 'Unknown runtime error'}
          </div>

          <button
            onClick={this.handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-mono text-xs font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset View</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
