'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { 
  ButtonEventHandlers,
  MouseEventHandler,
  KeyboardEventHandler,
  FocusEventHandler,
  TouchEventHandler
} from '@/types/events';

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  ripple?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  onMouseEnter?: MouseEventHandler<HTMLButtonElement>;
  onMouseLeave?: MouseEventHandler<HTMLButtonElement>;
  onTouchStart?: TouchEventHandler<HTMLButtonElement>;
  onTouchEnd?: TouchEventHandler<HTMLButtonElement>;
}

export const MobileButton = forwardRef<HTMLButtonElement, MobileButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    loading = false,
    disabled,
    children,
    startIcon,
    endIcon,
    ripple = true,
    onClick,
    onKeyDown,
    onFocus,
    onBlur,
    onMouseEnter,
    onMouseLeave,
    onTouchStart,
    onTouchEnd,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-expanded': ariaExpanded,
    'aria-pressed': ariaPressed,
    ...props 
  }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center',
      'font-semibold rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'touch-target', // Ensures minimum 44px touch target
      'active:scale-95', // Provides tactile feedback
    ];

    const variantClasses = {
      primary: [
        'bg-coria-primary text-white',
        'hover:bg-coria-primary-dark',
        'focus:ring-coria-primary',
        'active:bg-coria-primary-dark',
      ],
      secondary: [
        'bg-coria-secondary text-white',
        'hover:bg-coria-secondary/90',
        'focus:ring-coria-secondary',
        'active:bg-coria-secondary/90',
      ],
      outline: [
        'border-2 border-coria-primary text-coria-primary bg-transparent',
        'hover:bg-coria-primary hover:text-white',
        'focus:ring-coria-primary',
        'active:bg-coria-primary active:text-white',
      ],
      ghost: [
        'text-coria-primary bg-transparent',
        'hover:bg-coria-primary/10',
        'focus:ring-coria-primary',
        'active:bg-coria-primary/20',
      ],
    };

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm min-h-[40px]',
      md: 'px-6 py-3 text-base min-h-[48px]', // Mobile-optimized default
      lg: 'px-8 py-4 text-lg min-h-[56px]',
    };

    const widthClasses = fullWidth ? 'w-full' : '';

    // Enhanced event handlers with accessibility support
    const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
      if (disabled || loading) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
      if (disabled || loading) {
        return;
      }

      // Handle Enter and Space keys for accessibility
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (onClick) {
          const syntheticEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window,
          });
          event.currentTarget.dispatchEvent(syntheticEvent);
        }
      }

      onKeyDown?.(event);
    };

    const handleFocus: FocusEventHandler<HTMLButtonElement> = (event) => {
      if (disabled || loading) {
        return;
      }
      onFocus?.(event);
    };

    const handleBlur: FocusEventHandler<HTMLButtonElement> = (event) => {
      onBlur?.(event);
    };

    const handleTouchStart: TouchEventHandler<HTMLButtonElement> = (event) => {
      if (disabled || loading) {
        return;
      }
      onTouchStart?.(event);
    };

    const handleTouchEnd: TouchEventHandler<HTMLButtonElement> = (event) => {
      if (disabled || loading) {
        return;
      }
      onTouchEnd?.(event);
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          widthClasses,
          loading && 'cursor-wait',
          ripple && 'relative overflow-hidden',
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-expanded={ariaExpanded}
        aria-pressed={ariaPressed}
        aria-disabled={disabled || loading}
        {...props}
      >
        {startIcon && !loading && (
          <span className="mr-2 flex-shrink-0" aria-hidden="true">
            {startIcon}
          </span>
        )}
        
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
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
        )}
        
        <span className="flex-1">
          {children}
        </span>
        
        {endIcon && !loading && (
          <span className="ml-2 flex-shrink-0" aria-hidden="true">
            {endIcon}
          </span>
        )}
      </button>
    );
  }
);

MobileButton.displayName = 'MobileButton';