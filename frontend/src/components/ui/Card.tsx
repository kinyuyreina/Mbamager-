import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', hoverEffect = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-slate-900/90 border border-slate-800/60 shadow-sm rounded-2.5xl p-6 transition-all duration-300 hover:shadow-md ${
          hoverEffect ? 'hover:border-gold/30 hover:-translate-y-0.5' : ''
        } ${className}`}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`flex flex-col gap-1.5 mb-5 ${className}`} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-sm font-bold text-slate-100 tracking-tight flex items-center gap-2 ${className}`}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => (
    <p ref={ref} className={`text-xs text-slate-500 font-medium leading-relaxed ${className}`} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => <div ref={ref} className={`${className}`} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center justify-between pt-4 mt-4 border-t border-slate-800/60 ${className}`}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';
