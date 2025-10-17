import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'full' | 'organic';
  asChild?: boolean;
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', rounded = 'full', asChild = false, children, ...props }, ref) => {
    const Component = asChild ? Slot : 'button';

    const variantClasses: Record<Required<ButtonProps>['variant'], string> = {
      primary:
        'bg-gradient-primary text-white shadow-lg shadow-coria-primary/20 hover:shadow-xl hover:shadow-coria-primary/30 hover:-translate-y-1 active:brightness-95',
      secondary:
        'bg-white/70 text-coria-primary border border-coria-primary/20 shadow-sm hover:border-coria-primary/30 hover:bg-white',
      outline:
        'border border-coria-primary text-coria-primary hover:bg-coria-primary/10 active:bg-coria-primary/15',
      ghost:
        'text-coria-primary hover:bg-coria-primary/5 active:bg-coria-primary/10',
      glass:
        'border-2 border-coria-primary/15 text-coria-primary bg-white/70 backdrop-blur-md hover:border-coria-primary/25 hover:bg-white hover:-translate-y-1',
    };

    const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-12 px-7 text-lg',
      xl: 'h-14 px-8 text-lg',
    };

    const roundedClasses: Record<NonNullable<ButtonProps['rounded']>, string> = {
      full: 'rounded-full',
      organic: 'rounded-[28px]',
    };

    const buttonClasses = cn(
      'inline-flex items-center justify-center font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coria-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-60',
      variantClasses[variant],
      sizeClasses[size],
      roundedClasses[rounded],
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
