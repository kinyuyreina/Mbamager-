import * as React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Failed to load content',
  message = 'A connection failure occurred while contacting the server.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-500/5 border border-rose-500/10 rounded-3xl min-h-[250px]">
      <div className="p-3.5 rounded-full bg-rose-950/20 border border-rose-900/30 text-rose-400 mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      
      <h3 className="text-sm font-bold text-slate-200 tracking-tight mb-1">{title}</h3>
      <p className="text-xs text-slate-400 font-medium max-w-sm mb-5 leading-relaxed">{message}</p>
      
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCcw className="w-3.5 h-3.5" />
          Retry Connection
        </Button>
      )}
    </div>
  );
}
