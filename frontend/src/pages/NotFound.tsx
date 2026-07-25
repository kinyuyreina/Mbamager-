import * as React from 'react';
import { Link } from 'react-router';
import { Compass, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/40 via-slate-950 to-slate-950 pointer-events-none" />
      
      <div className="relative max-w-md flex flex-col items-center">
        <div className="p-4 rounded-full bg-slate-900/80 border border-slate-800 text-slate-500 mb-6 shadow-inner animate-pulse">
          <Compass className="h-10 w-10 text-emerald-400" />
        </div>
        
        <h1 className="text-4xl font-extrabold text-white tracking-tight font-mono mb-2">404</h1>
        <h2 className="text-base font-bold text-slate-200 tracking-tight mb-2">
          Page not registered
        </h2>
        
        <p className="text-xs text-slate-400 font-medium leading-relaxed mb-8 max-w-xs">
          The link or route destination you followed is either under construction or has been relocated securely.
        </p>

        <Link to="/dashboard">
          <Button variant="primary" size="sm" className="gap-2">
            Return to Dashboard
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
