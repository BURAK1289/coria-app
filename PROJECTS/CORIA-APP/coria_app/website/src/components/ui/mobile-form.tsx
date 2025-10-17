'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { 
  FormProps,
  FormGroupProps,
  FormLabelProps,
  FormInputProps,
  FormTextareaProps,
  FormSelectProps,
  FormEventHandler,
  FormChangeHandler,
  FormFocusHandler,
  FormKeyHandler
} from '@/types/forms';
import type { A11yEventHandlers } from '@/types/events';

interface MobileFormProps extends FormProps {
  noValidate?: boolean;
  autoComplete?: 'on' | 'off';
}

interface MobileFormGroupProps extends FormGroupProps {
  error?: boolean;
  disabled?: boolean;
}

interface MobileFormLabelProps extends FormLabelProps {
  error?: boolean;
  disabled?: boolean;
}

interface MobileFormInputProps extends FormInputProps {
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  loading?: boolean;
  onValueChange?: (value: string) => void;
}

interface MobileFormTextareaProps extends FormTextareaProps {
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  maxLength?: number;
  showCharacterCount?: boolean;
  onValueChange?: (value: string) => void;
}

interface MobileFormSelectProps extends FormSelectProps {
  helperText?: string;
  placeholder?: string;
  loading?: boolean;
  onValueChange?: (value: string) => void;
}

// Main form component
export const MobileForm = forwardRef<HTMLFormElement, MobileFormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn('mobile-form', className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);

MobileForm.displayName = 'MobileForm';

// Form group component
export function MobileFormGroup({ children, className }: MobileFormGroupProps) {
  return (
    <div className={cn('form-group', className)}>
      {children}
    </div>
  );
}

// Form label component
export const MobileFormLabel = forwardRef<HTMLLabelElement, MobileFormLabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          'block text-base font-medium text-gray-700 mb-2',
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="text-coral ml-1">*</span>}
      </label>
    );
  }
);

MobileFormLabel.displayName = 'MobileFormLabel';

// Form input component
export const MobileFormInput = forwardRef<HTMLInputElement, MobileFormInputProps>(
  ({ 
    className, 
    error, 
    helperText, 
    startIcon, 
    endIcon, 
    loading, 
    onValueChange,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    disabled,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const inputId = props.id || props.name;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [ariaDescribedBy, errorId, helperTextId].filter(Boolean).join(' ') || undefined;

    const handleChange: FormChangeHandler<HTMLInputElement> = (event) => {
      onChange?.(event);
      onValueChange?.(event.target.value);
    };

    const handleKeyDown: FormKeyHandler<HTMLInputElement> = (event) => {
      onKeyDown?.(event);
      
      // Handle Enter key for form submission
      if (event.key === 'Enter' && props.type !== 'textarea') {
        const form = event.currentTarget.closest('form');
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            event.preventDefault();
            submitButton.click();
          }
        }
      }
    };

    return (
      <div className="relative">
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute left-3 z-10 text-gray-400">
              {startIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              'form-input-mobile w-full rounded-lg border-2 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-coria-primary/20',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              loading && 'pr-10',
              error
                ? 'border-coral focus:border-coral'
                : 'border-gray-300 focus:border-coria-primary',
              className
            )}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            aria-invalid={ariaInvalid || !!error}
            aria-describedby={describedBy}
            {...props}
          />
          
          {(endIcon || loading) && (
            <div className="absolute right-3 z-10 text-gray-400">
              {loading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
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
              ) : (
                endIcon
              )}
            </div>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="mt-2 text-sm text-coral" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperTextId} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

MobileFormInput.displayName = 'MobileFormInput';

// Form textarea component
export const MobileFormTextarea = forwardRef<HTMLTextAreaElement, MobileFormTextareaProps>(
  ({ 
    className, 
    error, 
    helperText,
    resize = 'vertical',
    maxLength,
    showCharacterCount = false,
    onValueChange,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    disabled,
    value,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const inputId = props.id || props.name;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;
    const countId = showCharacterCount ? `${inputId}-count` : undefined;
    const describedBy = [ariaDescribedBy, errorId, helperTextId, countId].filter(Boolean).join(' ') || undefined;

    const currentLength = typeof value === 'string' ? value.length : 0;
    const isOverLimit = maxLength ? currentLength > maxLength : false;

    const handleChange: FormChangeHandler<HTMLTextAreaElement> = (event) => {
      onChange?.(event);
      onValueChange?.(event.target.value);
    };

    const handleKeyDown: FormKeyHandler<HTMLTextAreaElement> = (event) => {
      onKeyDown?.(event);
      
      // Handle Ctrl+Enter for form submission
      if (event.key === 'Enter' && event.ctrlKey) {
        const form = event.currentTarget.closest('form');
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            event.preventDefault();
            submitButton.click();
          }
        }
      }
    };

    const resizeClass = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    }[resize];

    return (
      <div>
        <textarea
          ref={ref}
          className={cn(
            'form-input-mobile w-full rounded-lg border-2 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-coria-primary/20',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            resizeClass,
            error
              ? 'border-coral focus:border-coral'
              : 'border-gray-300 focus:border-coria-primary',
            isOverLimit && 'border-coral focus:border-coral',
            className
          )}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          aria-invalid={ariaInvalid || !!error || isOverLimit}
          aria-describedby={describedBy}
          {...props}
        />
        
        <div className="flex justify-between items-start mt-2">
          <div className="flex-1">
            {error && (
              <p id={errorId} className="text-sm text-coral" role="alert">
                {error}
              </p>
            )}
            
            {helperText && !error && (
              <p id={helperTextId} className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>
          
          {showCharacterCount && maxLength && (
            <p 
              id={countId} 
              className={cn(
                'text-sm ml-2 flex-shrink-0',
                isOverLimit ? 'text-coral' : 'text-gray-500'
              )}
              aria-live="polite"
            >
              {currentLength}/{maxLength}
            </p>
          )}
        </div>
      </div>
    );
  }
);

MobileFormTextarea.displayName = 'MobileFormTextarea';

// Form select component
export const MobileFormSelect = forwardRef<HTMLSelectElement, MobileFormSelectProps>(
  ({ 
    className, 
    error, 
    helperText,
    placeholder,
    loading,
    onValueChange,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    disabled,
    children,
    'aria-invalid': ariaInvalid,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const inputId = props.id || props.name;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperTextId = helperText ? `${inputId}-helper` : undefined;
    const describedBy = [ariaDescribedBy, errorId, helperTextId].filter(Boolean).join(' ') || undefined;

    const handleChange: FormChangeHandler<HTMLSelectElement> = (event) => {
      onChange?.(event);
      onValueChange?.(event.target.value);
    };

    const handleKeyDown: FormKeyHandler<HTMLSelectElement> = (event) => {
      onKeyDown?.(event);
      
      // Handle Enter key for form submission
      if (event.key === 'Enter') {
        const form = event.currentTarget.closest('form');
        if (form) {
          const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            event.preventDefault();
            submitButton.click();
          }
        }
      }
    };

    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'form-input-mobile w-full rounded-lg border-2 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-coria-primary/20',
            'appearance-none bg-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            loading && 'pr-10',
            error
              ? 'border-coral focus:border-coral'
              : 'border-gray-300 focus:border-coria-primary',
            className
          )}
          onChange={handleChange}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled || loading}
          aria-invalid={ariaInvalid || !!error}
          aria-describedby={describedBy}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
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
          ) : (
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
        
        {error && (
          <p id={errorId} className="mt-2 text-sm text-coral" role="alert">
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperTextId} className="mt-2 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

MobileFormSelect.displayName = 'MobileFormSelect';

// Form error component
export function MobileFormError({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 p-3 bg-coral/10 border border-coral/20 rounded-lg">
      <p className="text-sm text-coral">{children}</p>
    </div>
  );
}

// Form success component
export function MobileFormSuccess({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 p-3 bg-leaf/10 border border-leaf/20 rounded-lg">
      <p className="text-sm text-leaf">{children}</p>
    </div>
  );
}