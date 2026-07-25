import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught in React ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950 pointer-events-none" />
          
          <div className="relative max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6 shadow-inner">
              <AlertTriangle className="h-8 w-8" />
            </div>
            
            <h1 className="text-lg font-bold text-white tracking-tight mb-2">
              Something went wrong
            </h1>
            
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
              An unexpected application error has crashed the screen view. This has been logged and the application state remains safe.
            </p>
            
            <div className="w-full bg-slate-950 border border-slate-800/80 p-4 rounded-xl mb-6 text-left overflow-auto max-h-36">
              <code className="text-[10px] font-mono text-rose-400 font-semibold leading-relaxed">
                {this.state.error?.toString()}
              </code>
            </div>

            <Button variant="primary" size="sm" onClick={this.handleReset} className="w-full gap-2">
              <RefreshCcw className="w-3.5 h-3.5" />
              Reload Application
            </Button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

