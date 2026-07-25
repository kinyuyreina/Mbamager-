import * as React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
  className?: string;
}

export function Skeleton({ className = '', variant = 'rect', ...props }: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-slate-800/60 rounded';
  
  const variantClasses = {
    text: 'h-4 w-3/4 rounded-md',
    rect: 'h-24 w-full rounded-2xl',
    circle: 'h-10 w-10 rounded-full',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <Skeleton variant="text" className="w-1/3 h-3" />
        <Skeleton variant="circle" className="h-6 w-6" />
      </div>
      <Skeleton variant="text" className="w-1/2 h-6" />
      <Skeleton variant="text" className="w-2/3 h-3.5" />
    </div>
  );
}
