import * as React from 'react';
import { Coins } from 'lucide-react';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950 pointer-events-none" />
      
      <div className="relative flex flex-col items-center gap-6">
        {/* Animated Brand Header */}
        <div className="flex items-center gap-2.5 animate-pulse">
          <span className="p-2 bg-gradient-to-tr from-emerald-600 to-teal-400 rounded-lg shadow-lg shadow-emerald-950/40">
            <Coins className="w-5 h-5 text-slate-950" />
          </span>
          <span className="text-base font-extrabold tracking-tight text-white">
            Mbamager
          </span>
        </div>
        
        {/* Elegant circular progress indicator */}
        <LoadingSpinner size="md" />
        
        <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase animate-pulse">
          Securing Connection & Restoring Session
        </p>
      </div>
    </div>
  );
}
