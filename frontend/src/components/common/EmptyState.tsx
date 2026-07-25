import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/10 border border-dashed border-slate-800 rounded-3xl min-h-[300px]">
      <div className="p-4 rounded-full bg-slate-900/60 border border-slate-800/60 text-slate-500 mb-4 shadow-inner">
        <Icon className="h-8 w-8" />
      </div>
      
      <h3 className="text-base font-bold text-slate-200 tracking-tight mb-1.5">{title}</h3>
      <p className="text-xs text-slate-400 font-medium max-w-sm mb-5 leading-relaxed">{description}</p>
      
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
