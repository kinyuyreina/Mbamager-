import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', label, error, helperText, disabled, ...props }, ref) => {
    const uniqueId = React.useId();
    
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label ? (
          <label
            htmlFor={uniqueId}
            className="text-[10px] text-slate-400 font-mono font-semibold tracking-wider uppercase"
          >
            {label}
          </label>
        ) : null}
        
        <input
          id={uniqueId}
          type={type}
          ref={ref}
          disabled={disabled}
          className={`w-full bg-slate-950/60 border text-sm text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold disabled:opacity-50 disabled:pointer-events-none ${
            error ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-800 focus:border-gold/60'
          } ${className}`}
          {...props}
        />
        
        {error ? (
          <span className="text-[10px] font-mono text-rose-500 font-semibold">{error}</span>
        ) : helperText ? (
          <span className="text-[10px] font-mono text-slate-500">{helperText}</span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
