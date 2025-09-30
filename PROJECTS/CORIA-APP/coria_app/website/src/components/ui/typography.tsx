import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// Heading component
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  variant?: 'heading' | 'technical';
  children: React.ReactNode;
}

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as: Component = 'h2', size = 'lg', weight = 'semibold', variant = 'heading', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'text-koyu-gri leading-tight tracking-tight',
          // Font family based on variant - yeni-tasarım.md v2.0
          {
            'font-sans': variant === 'heading', // Inter for headings
            'font-technical': variant === 'technical', // IBM Plex Sans for technical content
          },
          // Size styles (Desktop/Mobile) - yeni-tasarım.md v2.0
          {
            'text-xs': size === 'xs',
            'text-sm': size === 'sm',
            'text-base': size === 'md',
            'text-xl md:text-2xl': size === 'lg', // H4: 24px/20px - Kart başlıkları
            'text-2xl md:text-3xl': size === 'xl', // H3: 28px/24px - Alt bölümler
            'text-3xl md:text-4xl': size === '2xl', // H2: 36px/28px - Bölüm başlıkları
            'text-4xl md:text-5xl': size === '3xl', // H1: 48px/32px - Ana başlıklar
            'text-5xl md:text-6xl lg:text-7xl': size === '4xl', // Extra large headings
          },
          // Weight styles - yeni-tasarım.md v2.0
          {
            'font-normal': weight === 'normal',
            'font-medium': weight === 'medium',
            'font-semibold': weight === 'semibold',
            'font-bold': weight === 'bold',
            'font-black': weight === 'black', // For main headings
          },
          className
        )}
        {...props}
      />
    );
  }
);

Heading.displayName = 'Heading';

// Text component
export interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  as?: 'p' | 'span' | 'div';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold';
  color?: 'primary' | 'secondary' | 'muted' | 'accent';
  variant?: 'body' | 'technical';
  children: React.ReactNode;
}

const Text = forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, as: Component = 'p', size = 'md', weight = 'normal', color = 'primary', variant = 'body', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(
          'leading-loose',
          // Font family based on variant - yeni-tasarım.md v2.0
          {
            'font-sans': variant === 'body', // Inter for body text
            'font-technical': variant === 'technical', // IBM Plex Sans for technical content
          },
          // Size styles - yeni-tasarım.md v2.0
          {
            'text-xs': size === 'xs',     // 12px - Caption text
            'text-sm': size === 'sm',     // 14px - Small body text
            'text-base': size === 'md',   // 16px - Standard body text
            'text-lg': size === 'lg',     // 18px - Large body text
            'text-xl': size === 'xl',     // 20px - Emphasized text
          },
          // Weight styles - yeni-tasarım.md v2.0
          {
            'font-normal': weight === 'normal',     // 400 - Regular text
            'font-medium': weight === 'medium',     // 500 - Medium emphasis
            'font-semibold': weight === 'semibold', // 600 - Strong emphasis
          },
          // Color styles - Updated for new design system
          {
            'text-koyu-gri': color === 'primary',     // Primary text color
            'text-orta-gri': color === 'secondary',   // Secondary text color
            'text-acik-gri': color === 'muted',       // Muted text color
            'text-coria-green': color === 'accent',   // Accent text color
          },
          className
        )}
        {...props}
      />
    );
  }
);

Text.displayName = 'Text';

// Typography component that combines Heading and Text functionality
export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'large' | 'small' | 'muted' | 'body' | 'body-large' | 'body-small';
  children: React.ReactNode;
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = 'large', ...props }, ref) => {
    const baseClasses = 'leading-loose';
    
    switch (variant) {
      case 'h1':
        return (
          <h1
            ref={ref as React.Ref<HTMLHeadingElement>}
            className={cn(
              baseClasses,
              'text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight',
              className
            )}
            {...props}
          />
        );
      case 'h2':
        return (
          <h2
            ref={ref as React.Ref<HTMLHeadingElement>}
            className={cn(
              baseClasses,
              'text-2xl md:text-3xl font-semibold text-foreground tracking-tight leading-tight',
              className
            )}
            {...props}
          />
        );
      case 'h3':
        return (
          <h3
            ref={ref as React.Ref<HTMLHeadingElement>}
            className={cn(
              baseClasses,
              'text-xl md:text-2xl font-semibold text-foreground',
              className
            )}
            {...props}
          />
        );
      case 'h4':
        return (
          <h4
            ref={ref as React.Ref<HTMLHeadingElement>}
            className={cn(
              baseClasses,
              'text-lg font-medium text-foreground',
              className
            )}
            {...props}
          />
        );
      case 'large':
        return (
          <p
            ref={ref as React.Ref<HTMLParagraphElement>}
            className={cn(
              baseClasses,
              'text-lg text-muted-foreground',
              className
            )}
            {...props}
          />
        );
      case 'body':
        return (
          <p
            ref={ref as React.Ref<HTMLParagraphElement>}
            className={cn(
              baseClasses,
              'text-base text-foreground',
              className
            )}
            {...props}
          />
        );
      case 'body-large':
        return (
          <p
            ref={ref as React.Ref<HTMLParagraphElement>}
            className={cn(
              baseClasses,
              'text-lg text-foreground',
              className
            )}
            {...props}
          />
        );
      case 'body-small':
        return (
          <p
            ref={ref as React.Ref<HTMLParagraphElement>}
            className={cn(
              baseClasses,
              'text-sm text-foreground',
              className
            )}
            {...props}
          />
        );
      case 'small':
        return (
          <p
            ref={ref as React.Ref<HTMLParagraphElement>}
            className={cn(
              baseClasses,
              'text-sm text-foreground',
              className
            )}
            {...props}
          />
        );
      case 'muted':
        return (
          <p
            ref={ref as React.Ref<HTMLParagraphElement>}
            className={cn(
              baseClasses,
              'text-sm text-muted-foreground',
              className
            )}
            {...props}
          />
        );
      default:
        return (
          <p
            ref={ref as React.Ref<HTMLParagraphElement>}
            className={cn(baseClasses, 'text-base text-foreground', className)}
            {...props}
          />
        );
    }
  }
);

Typography.displayName = 'Typography';

export { Heading, Text, Typography };