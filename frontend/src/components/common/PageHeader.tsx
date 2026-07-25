import * as React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-900 pb-5 mb-6 gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-slate-400 font-medium mt-1 leading-relaxed">{description}</p>
        )}
      </div>
      
      {action && <div className="flex items-center gap-2.5">{action}</div>}
    </div>
  );
}
