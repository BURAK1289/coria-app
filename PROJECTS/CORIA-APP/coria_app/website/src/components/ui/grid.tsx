import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
  children: React.ReactNode;
}

const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols = 1, gap = 'md', responsive = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid',
          // Column styles
          {
            'grid-cols-1': cols === 1,
            'grid-cols-1 md:grid-cols-2': cols === 2 && responsive,
            'grid-cols-2': cols === 2 && !responsive,
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': cols === 3 && responsive,
            'grid-cols-3': cols === 3 && !responsive,
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': cols === 4 && responsive,
            'grid-cols-4': cols === 4 && !responsive,
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6': cols === 6 && responsive,
            'grid-cols-6': cols === 6 && !responsive,
            'grid-cols-12': cols === 12,
          },
          // Gap styles
          {
            'gap-0': gap === 'none',
            'gap-2': gap === 'sm',
            'gap-4': gap === 'md',
            'gap-6': gap === 'lg',
            'gap-8': gap === 'xl',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Grid.displayName = 'Grid';

// Grid Item component for more control
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  colSpan?: 1 | 2 | 3 | 4 | 6 | 12;
  colStart?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  children: React.ReactNode;
}

const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({ className, colSpan, colStart, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Column span styles
          {
            'col-span-1': colSpan === 1,
            'col-span-2': colSpan === 2,
            'col-span-3': colSpan === 3,
            'col-span-4': colSpan === 4,
            'col-span-6': colSpan === 6,
            'col-span-12': colSpan === 12,
          },
          // Column start styles
          {
            'col-start-1': colStart === 1,
            'col-start-2': colStart === 2,
            'col-start-3': colStart === 3,
            'col-start-4': colStart === 4,
            'col-start-5': colStart === 5,
            'col-start-6': colStart === 6,
            'col-start-7': colStart === 7,
            'col-start-8': colStart === 8,
            'col-start-9': colStart === 9,
            'col-start-10': colStart === 10,
            'col-start-11': colStart === 11,
            'col-start-12': colStart === 12,
          },
          className
        )}
        {...props}
      />
    );
  }
);

GridItem.displayName = 'GridItem';

export { Grid, GridItem };