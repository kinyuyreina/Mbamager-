import * as React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 mb-4" aria-label="Breadcrumb">
      <div className="flex items-center gap-1">
        <Home className="w-3 h-3" />
        <span className="sr-only">Home</span>
      </div>
      
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.label}>
            <ChevronRight className="w-3 h-3 text-slate-700" />
            {isLast ? (
              <span className="text-slate-300 font-semibold">{item.label}</span>
            ) : (
              <span className="hover:text-slate-300 transition-colors cursor-pointer">
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
