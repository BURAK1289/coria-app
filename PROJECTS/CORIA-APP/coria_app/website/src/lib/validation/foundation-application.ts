/**
 * Foundation Application Validation Schema
 *
 * Zod schema for validating CORIA Foundation project applications.
 * Includes comprehensive validation rules, type inference, and error messages.
 */

import { z } from 'zod';

// Constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
const MAX_FILES = 3;
const MAX_SUMMARY_LENGTH = 280;
const MIN_BUDGET = 1000;
const MAX_BUDGET = 10000000;

// Category enum
export const ProjectCategory = z.enum(['veganism', 'greenEnergy', 'sustainability'], {
  errorMap: () => ({ message: 'foundation.apply.errors.invalidCategory' }),
});

// Organization type enum
export const OrganizationType = z.enum([
  'nonprofit',
  'cooperative',
  'socialEnterprise',
  'community',
  'startup',
  'other'
], {
  errorMap: () => ({ message: 'foundation.apply.errors.invalidOrgType' }),
});

// File validation schema
export const FileSchema = z.object({
  name: z.string(),
  size: z.number()
    .max(MAX_FILE_SIZE, 'foundation.apply.errors.fileTooLarge'),
  type: z.string()
    .refine((type) => ACCEPTED_FILE_TYPES.includes(type), {
      message: 'foundation.apply.errors.invalidFileType',
    }),
  lastModified: z.number().optional(),
});

// Main application schema
export const FoundationApplicationSchema = z.object({
  // Project Information (Step 1)
  projectName: z.string()
    .min(3, 'foundation.apply.errors.projectNameTooShort')
    .max(100, 'foundation.apply.errors.projectNameTooLong')
    .regex(/^[a-zA-Z0-9\s\-_çğıöşüÇĞİÖŞÜáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜâêîôûÂÊÎÔÛ]+$/, {
      message: 'foundation.apply.errors.projectNameInvalidChars',
    }),

  category: ProjectCategory,

  orgType: OrganizationType,

  // Contact Information
  contactName: z.string()
    .min(2, 'foundation.apply.errors.contactNameTooShort')
    .max(100, 'foundation.apply.errors.contactNameTooLong'),

  contactEmail: z.string()
    .email('foundation.apply.errors.invalidEmail')
    .toLowerCase(),

  country: z.string()
    .min(2, 'foundation.apply.errors.countryRequired')
    .max(100, 'foundation.apply.errors.countryTooLong'),

  // Project Details (Step 2)
  shortSummary: z.string()
    .min(50, 'foundation.apply.errors.summaryTooShort')
    .max(MAX_SUMMARY_LENGTH, 'foundation.apply.errors.summaryTooLong'),

  detailedDescription: z.string()
    .min(200, 'foundation.apply.errors.descriptionTooShort')
    .max(5000, 'foundation.apply.errors.descriptionTooLong'),

  budget: z.number()
    .min(MIN_BUDGET, 'foundation.apply.errors.budgetTooLow')
    .max(MAX_BUDGET, 'foundation.apply.errors.budgetTooHigh'),

  requestedAmount: z.number()
    .min(MIN_BUDGET, 'foundation.apply.errors.requestedAmountTooLow')
    .max(MAX_BUDGET, 'foundation.apply.errors.requestedAmountTooHigh'),

  timelineStart: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'foundation.apply.errors.invalidDate'),

  timelineEnd: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'foundation.apply.errors.invalidDate'),

  // Optional fields
  website: z.string()
    .url('foundation.apply.errors.invalidUrl')
    .optional()
    .or(z.literal('')),

  socialMedia: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
  }).optional(),

  impactMetrics: z.string()
    .max(1000, 'foundation.apply.errors.impactMetricsTooLong')
    .optional()
    .or(z.literal('')),

  // Attachments (Step 3)
  attachments: z.array(FileSchema)
    .max(MAX_FILES, 'foundation.apply.errors.tooManyFiles')
    .optional(),

  // Consent (Required)
  consent: z.literal(true, {
    errorMap: () => ({ message: 'foundation.apply.errors.consentRequired' }),
  }),

  marketingConsent: z.boolean().optional(),

  // Anti-spam honeypot (should be empty)
  website_url: z.string().max(0).optional(),
}).refine(
  (data) => {
    // Validate requested amount doesn't exceed total budget
    return data.requestedAmount <= data.budget;
  },
  {
    message: 'foundation.apply.errors.requestedExceedsBudget',
    path: ['requestedAmount'],
  }
).refine(
  (data) => {
    // Validate timeline (end date after start date)
    const start = new Date(data.timelineStart);
    const end = new Date(data.timelineEnd);
    return end > start;
  },
  {
    message: 'foundation.apply.errors.invalidTimeline',
    path: ['timelineEnd'],
  }
).refine(
  (data) => {
    // Honeypot should be empty (anti-spam)
    return !data.website_url || data.website_url.length === 0;
  },
  {
    message: 'Spam detected',
    path: ['website_url'],
  }
);

// Type inference
export type FoundationApplication = z.infer<typeof FoundationApplicationSchema>;
export type ProjectCategoryType = z.infer<typeof ProjectCategory>;
export type OrganizationTypeType = z.infer<typeof OrganizationType>;
export type FileType = z.infer<typeof FileSchema>;

// Validation constants export
export const VALIDATION_CONSTANTS = {
  MAX_FILE_SIZE,
  ACCEPTED_FILE_TYPES,
  MAX_FILES,
  MAX_SUMMARY_LENGTH,
  MIN_BUDGET,
  MAX_BUDGET,
} as const;

// Helper function to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Helper function to validate file client-side
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `foundation.apply.errors.fileTooLarge`,
    };
  }

  if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `foundation.apply.errors.invalidFileType`,
    };
  }

  return { valid: true };
}
