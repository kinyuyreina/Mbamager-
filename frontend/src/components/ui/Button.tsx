import * as React from 'react';
import { motion } from 'motion/react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-sans font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50 cursor-pointer';
    
    const variants = {
      primary: 'bg-gold-400 text-white hover:bg-gold-500 active:bg-gold-600 shadow-sm hover:shadow shadow-gold-500/15',
      secondary: 'bg-white text-gold border border-gold hover:bg-gold-50 active:bg-gold-100 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
      outline: 'bg-transparent text-slate-300 border border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-100',
      ghost: 'bg-transparent text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-200',
      danger: 'bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700 shadow-md shadow-rose-500/15',
      success: 'bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-md shadow-emerald-500/15',
    };

    const sizes = {
      sm: 'h-9 px-3.5 text-xs rounded-lg',
      md: 'h-10.5 px-5 text-sm',
      lg: 'h-12 px-7 text-base rounded-2xl',
      icon: 'h-10 w-10 p-0',
    };

    return (
      <motion.button
        ref={ref}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.015 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...(props as any)}
      >
        {isLoading ? (
          <svg
            className="mr-2 h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
