import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    return (
      <div
        className={cn(
          // Base styles
          'inline-flex items-center rounded-full font-medium transition-colors',
          // Variant styles
          {
            'bg-coria-primary text-white': variant === 'default',
            'bg-coria-gray-100 text-coria-gray-700': variant === 'secondary',
            'border border-coria-primary text-coria-primary bg-transparent': variant === 'outline',
            'bg-green-100 text-green-800': variant === 'success',
            'bg-yellow-100 text-yellow-800': variant === 'warning',
            'bg-red-100 text-red-800': variant === 'error',
          },
          // Size styles
          {
            'px-2 py-0.5 text-xs': size === 'sm',
            'px-2.5 py-1 text-sm': size === 'md',
            'px-3 py-1.5 text-base': size === 'lg',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };