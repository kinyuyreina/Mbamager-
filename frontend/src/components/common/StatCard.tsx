import * as React from 'react';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card } from '../ui/Card';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: StatCardProps) {
  return (
    <Card hoverEffect>
      <div className="flex justify-between items-start mb-3">
        <span className="text-[10px] text-slate-400 font-mono font-semibold tracking-wider uppercase">
          {title}
        </span>
        <span className="p-2 bg-slate-950/60 border border-slate-800/60 rounded-xl text-slate-400 shadow-inner">
          <Icon className="w-4 h-4" />
        </span>
      </div>
      
      <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      
      {trend || description ? (
        <div className="flex items-center gap-1.5 mt-2 text-[10px]">
          {trend ? (
            <span
              className={`flex items-center font-mono font-semibold ${
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              )}
              {trend.value}%
            </span>
          ) : null}
          {description ? (
            <span className="text-slate-500 font-medium">{description}</span>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
