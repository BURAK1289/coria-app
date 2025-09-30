import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, children, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';

    const variantClasses: Record<Required<ButtonProps>['variant'], string> = {
      primary:
        'bg-gradient-coria text-white shadow-soft hover:shadow-lg hover:brightness-105 active:brightness-95',
      secondary:
        'bg-white/70 text-coria-primary border border-coria-primary/20 shadow-sm hover:border-coria-primary/30 hover:bg-white',
      outline:
        'border border-coria-primary text-coria-primary hover:bg-coria-primary/10 active:bg-coria-primary/15',
      ghost:
        'text-coria-primary hover:bg-coria-primary/5 active:bg-coria-primary/10',
    };

    const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-9 px-4 text-sm rounded-full',
      md: 'h-11 px-6 text-base rounded-full',
      lg: 'h-12 px-7 text-lg rounded-full',
    };

    const buttonClasses = cn(
      'inline-flex items-center justify-center font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coria-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-60',
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    return (
      <Component ref={ref} className={buttonClasses} {...props}>
        {children}
      </Component>
    );
  }
);

Button.displayName = 'Button';

export { Button };
