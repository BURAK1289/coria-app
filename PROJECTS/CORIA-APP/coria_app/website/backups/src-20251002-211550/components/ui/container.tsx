import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'lg', padding = 'md', ...props }, ref) => {
    return (
      <div
        className={cn(
          'mx-auto',
          // Size styles
          {
            'max-w-3xl': size === 'sm',
            'max-w-5xl': size === 'md',
            'max-w-7xl': size === 'lg',
            'max-w-screen-2xl': size === 'xl',
            'max-w-none': size === 'full',
          },
          // Padding styles
          {
            'px-0': padding === 'none',
            'px-2 sm:px-4': padding === 'sm',
            'px-4 sm:px-6 lg:px-8': padding === 'md',
            'px-6 sm:px-8 lg:px-12': padding === 'lg',
            'px-8 sm:px-12 lg:px-16': padding === 'xl',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Container.displayName = 'Container';

export { Container };