import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outline' | 'ghost' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'default' | 'lg' | 'organic-sm' | 'organic' | 'organic-lg' | 'organic-xl';
  hover?: boolean;
  children: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', rounded = 'default', hover = false, ...props }, ref) => {
    const roundedClasses: Record<NonNullable<CardProps['rounded']>, string> = {
      'default': 'rounded-lg',
      'lg': 'rounded-xl',
      'organic-sm': 'rounded-[22px]',
      'organic': 'rounded-[28px]',
      'organic-lg': 'rounded-[32px]',
      'organic-xl': 'rounded-[36px]',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'transition-all duration-300',
          roundedClasses[rounded],
          // Variant styles
          {
            'bg-white border border-coria-gray-200': variant === 'default',
            'bg-white border border-coria-gray-200 shadow-lg hover:shadow-xl': variant === 'elevated',
            'bg-transparent border-2 border-coria-primary': variant === 'outline',
            'bg-coria-gray-50 border-0': variant === 'ghost',
            'bg-[var(--foam)]/85 backdrop-blur-sm border border-[var(--foam)] shadow-lg': variant === 'glass',
          },
          // Padding styles
          {
            'p-0': padding === 'none',
            'p-4': padding === 'sm',
            'p-6': padding === 'md',
            'p-8': padding === 'lg',
          },
          // Hover effects
          {
            'hover:-translate-y-2 hover:shadow-xl': hover,
          },
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

// Card Header component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5', className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Content component
export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('pt-0', className)}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-center pt-0', className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Card Title component
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn('text-lg font-semibold leading-none tracking-tight', className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

// Card Description component
export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-muted-foreground', className)}
        {...props}
      />
    );
  }
);

CardDescription.displayName = 'CardDescription';

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription };