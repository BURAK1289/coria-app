'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { FoundationApplicationSchema, type FoundationApplication } from '@/lib/validation/foundation-application';
import { z } from 'zod';

type FormData = Omit<FoundationApplication, 'attachments'> & {
  attachments?: File[];
};

const DRAFT_KEY = 'foundation-application-draft';

// Form field wrapper component - extracted to prevent re-renders
const Field = ({
  name,
  label,
  children,
  required = true,
  helper,
  errors,
}: {
  name: string;
  label: string;
  children: React.ReactNode;
  required?: boolean;
  helper?: string;
  errors: Record<string, string>;
}) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
    {helper && <p className="text-sm text-gray-500 mt-1">{helper}</p>}
    {errors[name] && <p className="text-sm text-red-600 mt-1">{errors[name]}</p>}
  </div>
);

// Progress indicator component - extracted to prevent re-renders
const ProgressIndicator = ({ currentStep, t }: { currentStep: number; t: any }) => (
  <div className="mb-8">
    <div className="flex justify-between items-center mb-4">
      {[0, 1, 2].map((step) => (
        <div key={step} className="flex items-center flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              step <= currentStep
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-600'
            }`}
          >
            {step + 1}
          </div>
          {step < 2 && (
            <div
              className={`flex-1 h-1 mx-2 ${
                step < currentStep ? 'bg-green-600' : 'bg-gray-300'
              }`}
            />
          )}
        </div>
      ))}
    </div>
    <div className="text-center">
      <h3 className="text-xl font-bold text-gray-900">{t(`steps.${currentStep}.title`)}</h3>
      <p className="text-gray-600">{t(`steps.${currentStep}.description`)}</p>
    </div>
  </div>
);

// Step 1: Project Information - extracted to prevent re-renders
const Step1 = ({
  formData,
  updateField,
  errors,
  t,
}: {
  formData: any;
  updateField: (field: string, value: any) => void;
  errors: Record<string, string>;
  t: any;
}) => (
  <div className="space-y-6">
    <Field name="projectName" label={t('fields.projectName.label')} helper={t('fields.projectName.helper')} errors={errors}>
      <input
        type="text"
        value={formData.projectName}
        onChange={(e) => updateField('projectName', e.target.value)}
        placeholder={t('fields.projectName.placeholder')}
        className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </Field>

    <Field name="category" label={t('fields.category.label')} helper={t('fields.category.helper')} errors={errors}>
      <select
        value={formData.category}
        onChange={(e) => updateField('category', e.target.value)}
        className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        <option value="veganism">{t('categories.veganism')}</option>
        <option value="greenEnergy">{t('categories.greenEnergy')}</option>
        <option value="sustainability">{t('categories.sustainability')}</option>
      </select>
    </Field>

    <Field name="orgType" label={t('fields.orgType.label')} helper={t('fields.orgType.helper')} errors={errors}>
      <select
        value={formData.orgType}
        onChange={(e) => updateField('orgType', e.target.value)}
        className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
        <option value="nonprofit">{t('orgTypes.nonprofit')}</option>
        <option value="cooperative">{t('orgTypes.cooperative')}</option>
        <option value="socialEnterprise">{t('orgTypes.socialEnterprise')}</option>
        <option value="community">{t('orgTypes.community')}</option>
        <option value="startup">{t('orgTypes.startup')}</option>
        <option value="other">{t('orgTypes.other')}</option>
      </select>
    </Field>

    <Field name="contactName" label={t('fields.contactName.label')} errors={errors}>
      <input
        type="text"
        value={formData.contactName}
        onChange={(e) => updateField('contactName', e.target.value)}
        placeholder={t('fields.contactName.placeholder')}
        className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </Field>

    <Field name="contactEmail" label={t('fields.contactEmail.label')} errors={errors}>
      <input
        type="email"
        value={formData.contactEmail}
        onChange={(e) => updateField('contactEmail', e.target.value)}
        placeholder={t('fields.contactEmail.placeholder')}
        className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </Field>

    <Field name="country" label={t('fields.country.label')} errors={errors}>
      <input
        type="text"
        value={formData.country}
        onChange={(e) => updateField('country', e.target.value)}
        placeholder={t('fields.country.placeholder')}
        className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </Field>

    {/* Honeypot field - hidden from users */}
    <input
      type="text"
      name="website_url"
      value={formData.website_url}
      onChange={(e) => updateField('website_url', e.target.value)}
      style={{ position: 'absolute', left: '-9999px' }}
      tabIndex={-1}
      autoComplete="off"
    />
  </div>
);

// Step 2: Project Details - extracted to prevent re-renders
const Step2 = ({
  formData,
  updateField,
  errors,
  t,
}: {
  formData: any;
  updateField: (field: string, value: any) => void;
  errors: Record<string, string>;
  t: any;
}) => {
  const remaining = 280 - formData.shortSummary.length;
  return (
    <div className="space-y-6">
      <Field
        name="shortSummary"
        label={t('fields.shortSummary.label')}
        helper={t('fields.shortSummary.helper', { remaining })}
        errors={errors}
      >
        <textarea
          value={formData.shortSummary}
          onChange={(e) => updateField('shortSummary', e.target.value.slice(0, 280))}
          placeholder={t('fields.shortSummary.placeholder')}
          rows={3}
          className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </Field>

      <Field name="detailedDescription" label={t('fields.detailedDescription.label')} helper={t('fields.detailedDescription.helper')} errors={errors}>
        <textarea
          value={formData.detailedDescription}
          onChange={(e) => updateField('detailedDescription', e.target.value)}
          placeholder={t('fields.detailedDescription.placeholder')}
          rows={6}
          className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field name="budget" label={t('fields.budget.label')} helper={t('fields.budget.helper')} errors={errors}>
          <input
            type="number"
            value={formData.budget || ''}
            onChange={(e) => updateField('budget', parseFloat(e.target.value) || 0)}
            placeholder={t('fields.budget.placeholder')}
            min={1000}
            className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </Field>

        <Field name="requestedAmount" label={t('fields.requestedAmount.label')} helper={t('fields.requestedAmount.helper')} errors={errors}>
          <input
            type="number"
            value={formData.requestedAmount || ''}
            onChange={(e) => updateField('requestedAmount', parseFloat(e.target.value) || 0)}
            placeholder={t('fields.requestedAmount.placeholder')}
            min={1000}
            className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field name="timelineStart" label={t('fields.timelineStart.label')} errors={errors}>
          <input
            type="date"
            value={formData.timelineStart}
            onChange={(e) => updateField('timelineStart', e.target.value)}
            className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </Field>

        <Field name="timelineEnd" label={t('fields.timelineEnd.label')} errors={errors}>
          <input
            type="date"
            value={formData.timelineEnd}
            onChange={(e) => updateField('timelineEnd', e.target.value)}
            className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </Field>
      </div>

      <Field name="website" label={t('fields.website.label')} required={false} helper={t('fields.website.helper')} errors={errors}>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => updateField('website', e.target.value)}
          placeholder={t('fields.website.placeholder')}
          className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </Field>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">{t('fields.socialMedia.label')}</label>

        <input
          type="url"
          value={formData.socialMedia?.twitter || ''}
          onChange={(e) => updateField('socialMedia.twitter', e.target.value)}
          placeholder={t('fields.socialMedia.twitter.placeholder')}
          className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />

        <input
          type="url"
          value={formData.socialMedia?.instagram || ''}
          onChange={(e) => updateField('socialMedia.instagram', e.target.value)}
          placeholder={t('fields.socialMedia.instagram.placeholder')}
          className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />

        <input
          type="url"
          value={formData.socialMedia?.linkedin || ''}
          onChange={(e) => updateField('socialMedia.linkedin', e.target.value)}
          placeholder={t('fields.socialMedia.linkedin.placeholder')}
          className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <Field name="impactMetrics" label={t('fields.impactMetrics.label')} required={false} helper={t('fields.impactMetrics.helper')} errors={errors}>
        <textarea
          value={formData.impactMetrics}
          onChange={(e) => updateField('impactMetrics', e.target.value)}
          placeholder={t('fields.impactMetrics.placeholder')}
          rows={4}
          className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </Field>
    </div>
  );
};

// Step 3: Review & Submit - extracted to prevent re-renders
const Step3 = ({
  formData,
  updateField,
  errors,
  t,
  handleFileUpload,
}: {
  formData: any;
  updateField: (field: string, value: any) => void;
  errors: Record<string, string>;
  t: any;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="space-y-6">
    <div className="bg-[var(--foam)]/40 backdrop-blur-sm border border-[var(--foam)]/30 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('review.title')}</h3>

      <div className="space-y-3 text-sm">
        <div>
          <span className="font-medium text-gray-700">{t('fields.projectName.label')}:</span>
          <span className="ml-2 text-gray-900">{formData.projectName}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">{t('fields.category.label')}:</span>
          <span className="ml-2 text-gray-900">{t(`categories.${formData.category}`)}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">{t('fields.orgType.label')}:</span>
          <span className="ml-2 text-gray-900">{t(`orgTypes.${formData.orgType}`)}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">{t('fields.contactEmail.label')}:</span>
          <span className="ml-2 text-gray-900">{formData.contactEmail}</span>
        </div>
        <div>
          <span className="font-medium text-gray-700">{t('fields.requestedAmount.label')}:</span>
          <span className="ml-2 text-gray-900">₺{formData.requestedAmount.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <Field name="attachments" label={t('fields.attachments.label')} required={false} helper={t('fields.attachments.helper')} errors={errors}>
      <input
        type="file"
        onChange={handleFileUpload}
        accept=".pdf,.png,.jpg,.jpeg"
        multiple
        className="w-full px-4 py-2 border border-[var(--foam)]/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
      {formData.attachments && formData.attachments.length > 0 && (
        <div className="mt-2 space-y-1">
          {formData.attachments.map((file, idx) => (
            <div key={idx} className="text-sm text-gray-600 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          ))}
        </div>
      )}
    </Field>

    <div className="space-y-4">
      <label className="flex items-start">
        <input
          type="checkbox"
          checked={formData.consent}
          onChange={(e) => updateField('consent', e.target.checked)}
          className="mt-1 mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-[var(--foam)]/30 rounded"
        />
        <span className="text-sm text-gray-700">
          {t('fields.consent.label')} <span className="text-red-500">*</span>
        </span>
      </label>
      {errors.consent && <p className="text-sm text-red-600 ml-7">{errors.consent}</p>}

      <label className="flex items-start">
        <input
          type="checkbox"
          checked={formData.marketingConsent}
          onChange={(e) => updateField('marketingConsent', e.target.checked)}
          className="mt-1 mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-[var(--foam)]/30 rounded"
        />
        <span className="text-sm text-gray-700">{t('fields.marketingConsent.label')}</span>
      </label>
    </div>

    {errors.submit && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {errors.submit}
      </div>
    )}
  </div>
);

export default function FoundationApplicationForm() {
  const t = useTranslations('foundation.apply');
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    projectName: '',
    category: 'veganism',
    orgType: 'nonprofit',
    contactName: '',
    contactEmail: '',
    country: '',
    shortSummary: '',
    detailedDescription: '',
    budget: 0,
    requestedAmount: 0,
    timelineStart: '',
    timelineEnd: '',
    website: '',
    socialMedia: {
      twitter: '',
      instagram: '',
      linkedin: '',
    },
    impactMetrics: '',
    attachments: [],
    consent: false,
    marketingConsent: false,
    website_url: '', // Honeypot
  });

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = () => {
    const draftData = { ...formData, attachments: [] }; // Exclude files
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
    alert(t('draft.saved'));
  };

  // Clear draft
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
  };

  // Update form field - useCallback to prevent re-renders
  const updateField = useCallback((field: string, value: any) => {
    setFormData((prev) => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return {
          ...prev,
          [parent]: {
            ...(prev[parent as keyof FormData] as any),
            [child]: value,
          },
        };
      }
      return { ...prev, [field]: value };
    });
    // Clear error for this field
    setErrors((prev) => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Validate current step
  const validateStep = (step: number): boolean => {
    const stepFields: Record<number, string[]> = {
      0: ['projectName', 'category', 'orgType', 'contactName', 'contactEmail', 'country'],
      1: ['shortSummary', 'detailedDescription', 'budget', 'requestedAmount', 'timelineStart', 'timelineEnd'],
      2: ['consent'],
    };

    const fieldsToValidate = stepFields[step] || [];
    const newErrors: Record<string, string> = {};

    // Create partial schema for current step
    try {
      const dataToValidate: any = {};
      fieldsToValidate.forEach((field) => {
        dataToValidate[field] = formData[field as keyof FormData];
      });

      // Validate with Zod
      FoundationApplicationSchema.pick(
        Object.fromEntries(fieldsToValidate.map((f) => [f, true])) as any
      ).parse(dataToValidate);

      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        if (Array.isArray(error.errors)) {
          error.errors.forEach((err) => {
            const field = err.path.join('.');
            newErrors[field] = t(`errors.${err.message}` as any) || err.message;
          });
        }
      }
      setErrors(newErrors);
      return false;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 2));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      setErrors((prev) => ({ ...prev, attachments: t('errors.tooManyFiles') }));
      return;
    }

    const invalidFiles = files.filter(
      (f) => f.size > 10 * 1024 * 1024 || !['application/pdf', 'image/png', 'image/jpeg'].includes(f.type)
    );

    if (invalidFiles.length > 0) {
      setErrors((prev) => ({ ...prev, attachments: t('errors.invalidFile') }));
      return;
    }

    setFormData((prev) => ({ ...prev, attachments: files }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.attachments;
      return newErrors;
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare form data for submission
      const submitData = new FormData();

      // Add all fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'attachments') {
          // Handle files separately
          (value as File[])?.forEach((file) => {
            submitData.append('attachments', file);
          });
        } else if (key === 'socialMedia') {
          submitData.append(key, JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          submitData.append(key, value.toString());
        } else if (typeof value === 'number') {
          submitData.append(key, value.toString());
        } else if (value !== null && value !== undefined) {
          submitData.append(key, value as string);
        }
      });

      // Submit to API
      const response = await fetch('/api/foundation/apply', {
        method: 'POST',
        body: submitData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setApplicationId(result.applicationId);
        setSubmitSuccess(true);
        clearDraft();
      } else {
        throw new Error(result.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ submit: error instanceof Error ? error.message : t('errors.submissionFailed') });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (submitSuccess && applicationId) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-[var(--foam)]/60 backdrop-blur-sm border border-[var(--foam)] rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-4">{t('success.title')}</h2>
          <p className="text-lg text-gray-700 mb-4">{t('success.message')}</p>
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-2">{t('success.applicationId')}</p>
            <p className="text-2xl font-mono font-bold text-gray-900">{applicationId}</p>
          </div>
          <div className="text-left bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">{t('success.nextSteps')}</h3>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>{t('success.step1')}</li>
              <li>{t('success.step2')}</li>
              <li>{t('success.step3')}</li>
            </ol>
          </div>
          <button
            onClick={() => window.location.href = '/foundation'}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            {t('buttons.backToFoundation')}
          </button>
        </div>
      </div>
    );
  }

  // Note: All components (Field, ProgressIndicator, Step1, Step2, Step3) are now defined outside
  // the main component to prevent re-renders and maintain input focus during typing

  // Main render
  return (
    <div className="max-w-4xl mx-auto p-6 bg-[var(--foam)]/60 backdrop-blur-sm border border-[var(--foam)]/50 rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('hero.title')}</h1>
        <p className="text-gray-600">{t('hero.subtitle')}</p>
      </div>

      <ProgressIndicator currentStep={currentStep} t={t} />

      <div className="mb-8">
        {currentStep === 0 && <Step1 formData={formData} updateField={updateField} errors={errors} t={t} />}
        {currentStep === 1 && <Step2 formData={formData} updateField={updateField} errors={errors} t={t} />}
        {currentStep === 2 && <Step3 formData={formData} updateField={updateField} errors={errors} t={t} handleFileUpload={handleFileUpload} />}
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <div className="flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-2 border border-[var(--foam)]/30 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('buttons.previous')}
            </button>
          )}
          <button
            onClick={saveDraft}
            className="px-6 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
          >
            {t('buttons.saveDraft')}
          </button>
        </div>

        <div>
          {currentStep < 2 ? (
            <button
              onClick={handleNext}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              {t('buttons.next')}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t('buttons.submitting') : t('buttons.submit')}
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        {t('progress.indicator', { current: currentStep + 1, total: 3 })}
      </div>
    </div>
  );
}
