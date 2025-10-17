/**
 * Form and validation type definitions
 */

import { z } from 'zod';

// Base form types
export interface FormFieldError {
  field: string;
  message: string;
  code?: string;
}

export interface FormState<T = unknown> {
  data: T;
  errors: FormFieldError[];
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  touched: Record<string, boolean>;
}

// Form validation schema types
export interface ValidationRule<T = unknown> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => string | null;
}

export interface FormFieldConfig<T = unknown> {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  placeholder?: string;
  defaultValue?: T;
  validation?: ValidationRule<T>;
  options?: Array<{ value: string; label: string }>;
}

// Contact form specific types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: ContactCategory;
  message: string;
  priority: ContactPriority;
}

export type ContactCategory = 
  | 'general'
  | 'technical'
  | 'billing'
  | 'feature-request'
  | 'bug-report'
  | 'partnership';

export type ContactPriority = 'low' | 'medium' | 'high';

export interface ContactFormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  category?: string;
  priority?: string;
}

// Zod validation schemas
export const contactFormSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  subject: z.string()
    .min(1, 'Subject is required')
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  
  category: z.enum(['general', 'technical', 'billing', 'feature-request', 'bug-report', 'partnership']),
  
  message: z.string()
    .min(1, 'Message is required')
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  
  priority: z.enum(['low', 'medium', 'high']),
});

export type ContactFormSchema = z.infer<typeof contactFormSchema>;

// Newsletter form types
export interface NewsletterFormData {
  email: string;
  preferences: {
    productUpdates: boolean;
    blogPosts: boolean;
    sustainabilityTips: boolean;
    weeklyDigest: boolean;
  };
}

export const newsletterFormSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  preferences: z.object({
    productUpdates: z.boolean().default(true),
    blogPosts: z.boolean().default(false),
    sustainabilityTips: z.boolean().default(true),
    weeklyDigest: z.boolean().default(false),
  }),
});

export type NewsletterFormSchema = z.infer<typeof newsletterFormSchema>;

// Form submission types
export interface FormSubmissionResult<T = unknown> {
  success: boolean;
  data?: T;
  errors?: FormFieldError[];
  message?: string;
}

export interface FormSubmissionOptions {
  endpoint: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  onSuccess?: (data: unknown) => void;
  onError?: (errors: FormFieldError[]) => void;
}

// Form hook types
export interface UseFormOptions<T> {
  initialValues: T;
  validationSchema?: z.ZodSchema<T>;
  onSubmit: (values: T) => Promise<FormSubmissionResult<T>>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (field: keyof T) => (value: unknown) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: unknown) => void;
  setFieldError: (field: keyof T, error: string) => void;
  resetForm: () => void;
  validateField: (field: keyof T) => Promise<string | null>;
  validateForm: () => Promise<boolean>;
}

// Form component prop types
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  noValidate?: boolean;
}

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  error?: boolean;
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
  error?: boolean;
}

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  placeholder?: string;
}

export interface FormCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export interface FormRadioProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export interface FormRadioGroupProps {
  name: string;
  value?: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

// Form validation utilities
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export type ValidatorFunction<T = unknown> = (value: T) => string | null;

export interface FieldValidator<T = unknown> {
  required?: boolean | string;
  minLength?: number | { value: number; message: string };
  maxLength?: number | { value: number; message: string };
  pattern?: RegExp | { value: RegExp; message: string };
  email?: boolean | string;
  custom?: ValidatorFunction<T> | ValidatorFunction<T>[];
}

// Form accessibility types
export interface FormA11yProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
  'aria-required'?: boolean;
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  role?: string;
}

export interface FormFieldA11yProps extends FormA11yProps {
  id: string;
  name: string;
  'data-testid'?: string;
}

// Form state management types
export interface FormAction<T = unknown> {
  type: 'SET_VALUE' | 'SET_ERROR' | 'SET_TOUCHED' | 'SET_SUBMITTING' | 'RESET' | 'VALIDATE';
  field?: keyof T;
  value?: unknown;
  errors?: Record<keyof T, string>;
}

export interface FormReducerState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

// Export utility types
export type FormEventHandler<T = HTMLElement> = (event: React.FormEvent<T>) => void;
export type FormChangeHandler<T = HTMLInputElement> = (event: React.ChangeEvent<T>) => void;
export type FormBlurHandler<T = HTMLInputElement> = (event: React.FocusEvent<T>) => void;
export type FormFocusHandler<T = HTMLInputElement> = (event: React.FocusEvent<T>) => void;
export type FormKeyHandler<T = HTMLElement> = (event: React.KeyboardEvent<T>) => void;