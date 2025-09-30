'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { 
  MobileForm, 
  MobileFormGroup, 
  MobileFormLabel, 
  MobileFormInput, 
  MobileFormSelect, 
  MobileFormTextarea 
} from '@/components/ui/mobile-form';
import { MobileButton } from '@/components/ui/mobile-button';
import { 
  contactFormSchema,
} from '@/types/forms';
import type {
  ContactFormData,
  ContactFormErrors,
  ContactCategory,
  ContactPriority,
  FormSubmissionResult
} from '@/types/forms';
import type { FormEventHandler } from 'react';
import { z } from 'zod';
export function ContactForm() {
  const t = useTranslations('contact.form');
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    category: 'general' as ContactCategory,
    message: '',
    priority: 'medium' as ContactPriority,
  });
  const [errors, setErrors] = useState<ContactFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = useCallback((): boolean => {
    try {
      contactFormSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ContactFormErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof ContactFormErrors;
          if (field) {
            newErrors[field] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData]);

  const submitForm = async (data: ContactFormData): Promise<FormSubmissionResult> => {
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      console.error('Form submission error:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await submitForm(formData);
      
      if (result.success) {
        setIsSubmitted(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          category: 'general',
          message: '',
          priority: 'medium',
        });
        setErrors({});
      } else {
        setSubmitError(result.message || 'Failed to submit form. Please try again.');
      }
    } catch (error) {
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = useCallback((field: keyof ContactFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  }, [errors, submitError]);

  const handleFieldBlur = useCallback((field: keyof ContactFormData) => () => {
    // Validate single field on blur
    try {
      const fieldSchema = contactFormSchema.shape[field];
      fieldSchema.parse(formData[field]);
      setErrors(prev => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({ ...prev, [field]: error.errors[0]?.message }));
      }
    }
  }, [formData]);

  if (isSubmitted) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-leaf/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg 
              className="w-8 h-8 text-leaf" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <Typography variant="h3" className="mb-4 text-leaf">
            {t('success.title')}
          </Typography>
          <Typography variant="body" className="text-gray-600 mb-6">
            {t('success.message')}
          </Typography>
          <MobileButton
            onClick={() => {
              setIsSubmitted(false);
              setSubmitError(null);
            }}
            variant="primary"
            type="button"
          >
            {t('success.sendAnother')}
          </MobileButton>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <Typography variant="h2" className="mb-4">
          {t('title')}
        </Typography>
        <Typography variant="body-large" className="text-gray-600 max-w-3xl mx-auto">
          {t('subtitle')}
        </Typography>
      </div>

      <Card className="p-4 md:p-8">
        <MobileForm onSubmit={handleSubmit} noValidate>
          {submitError && (
            <div className="mb-6 p-4 bg-coral/10 border border-coral/20 rounded-lg" role="alert">
              <p className="text-sm text-coral font-medium">{submitError}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            {/* Name */}
            <MobileFormGroup error={!!errors.name}>
              <MobileFormLabel htmlFor="name" required error={!!errors.name}>
                {t('fields.name')}
              </MobileFormLabel>
              <MobileFormInput
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onValueChange={handleInputChange('name')}
                onBlur={handleFieldBlur('name')}
                placeholder={t('placeholders.name')}
                error={errors.name}
                autoComplete="name"
                aria-required="true"
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
            </MobileFormGroup>

            {/* Email */}
            <MobileFormGroup error={!!errors.email}>
              <MobileFormLabel htmlFor="email" required error={!!errors.email}>
                {t('fields.email')}
              </MobileFormLabel>
              <MobileFormInput
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onValueChange={handleInputChange('email')}
                onBlur={handleFieldBlur('email')}
                placeholder={t('placeholders.email')}
                error={errors.email}
                autoComplete="email"
                aria-required="true"
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
            </MobileFormGroup>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Category */}
            <MobileFormGroup error={!!errors.category}>
              <MobileFormLabel htmlFor="category" error={!!errors.category}>
                {t('fields.category')}
              </MobileFormLabel>
              <MobileFormSelect
                id="category"
                name="category"
                value={formData.category}
                onValueChange={handleInputChange('category')}
                onBlur={handleFieldBlur('category')}
                error={errors.category}
                aria-describedby={errors.category ? 'category-error' : undefined}
              >
                <option value="general">{t('categories.general')}</option>
                <option value="technical">{t('categories.technical')}</option>
                <option value="billing">{t('categories.billing')}</option>
                <option value="feature-request">{t('categories.featureRequest')}</option>
                <option value="bug-report">{t('categories.bugReport')}</option>
                <option value="partnership">{t('categories.partnership')}</option>
              </MobileFormSelect>
            </MobileFormGroup>

            {/* Priority */}
            <MobileFormGroup error={!!errors.priority}>
              <MobileFormLabel htmlFor="priority" error={!!errors.priority}>
                {t('fields.priority')}
              </MobileFormLabel>
              <MobileFormSelect
                id="priority"
                name="priority"
                value={formData.priority}
                onValueChange={handleInputChange('priority')}
                onBlur={handleFieldBlur('priority')}
                error={errors.priority}
                aria-describedby={errors.priority ? 'priority-error' : undefined}
              >
                <option value="low">{t('priorities.low')}</option>
                <option value="medium">{t('priorities.medium')}</option>
                <option value="high">{t('priorities.high')}</option>
              </MobileFormSelect>
            </MobileFormGroup>
          </div>

          {/* Subject */}
          <MobileFormGroup error={!!errors.subject}>
            <MobileFormLabel htmlFor="subject" required error={!!errors.subject}>
              {t('fields.subject')}
            </MobileFormLabel>
            <MobileFormInput
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onValueChange={handleInputChange('subject')}
              onBlur={handleFieldBlur('subject')}
              placeholder={t('placeholders.subject')}
              error={errors.subject}
              autoComplete="off"
              aria-required="true"
              aria-describedby={errors.subject ? 'subject-error' : undefined}
            />
          </MobileFormGroup>

          {/* Message */}
          <MobileFormGroup error={!!errors.message}>
            <MobileFormLabel htmlFor="message" required error={!!errors.message}>
              {t('fields.message')}
            </MobileFormLabel>
            <MobileFormTextarea
              id="message"
              name="message"
              rows={6}
              value={formData.message}
              onValueChange={handleInputChange('message')}
              onBlur={handleFieldBlur('message')}
              placeholder={t('placeholders.message')}
              error={errors.message}
              maxLength={1000}
              showCharacterCount={true}
              helperText={t('messageHelp')}
              aria-required="true"
              aria-describedby={errors.message ? 'message-error' : 'message-helper'}
            />
          </MobileFormGroup>

          {/* Submit Button */}
          <div className="flex justify-end">
            <MobileButton
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              variant="primary"
              size="lg"
              aria-describedby={submitError ? 'submit-error' : undefined}
            >
              {isSubmitting ? t('submitting') : t('submit')}
            </MobileButton>
          </div>
        </MobileForm>
      </Card>
    </div>
  );
}