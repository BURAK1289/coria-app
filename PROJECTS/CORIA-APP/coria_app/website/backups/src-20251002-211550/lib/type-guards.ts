/**
 * Type guard utilities for runtime validation
 */

import type { 
  Language, 
  LocalizedContent, 
  ApiResponse, 
  AnalyticsEvent, 
  ConversionEvent,
  PerformanceMetric,
  WebVitalsMetric,
  SEOMetadata,
  ImageData,
  BlogPost,
  Feature,
  Author,
  BlogCategory,
  FeatureCategory
} from '../types/global';
import type { CMSContent } from '../types/api';

/**
 * Check if value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Check if value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return isValidNumber(value) && value > 0;
}

/**
 * Check if value is a valid URL string
 */
export function isValidUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is a valid email string
 */
export function isValidEmail(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

/**
 * Check if value is a valid date
 */
export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Check if value is a valid array with minimum length
 */
export function isValidArray<T>(value: unknown, minLength: number = 0): value is T[] {
  return Array.isArray(value) && value.length >= minLength;
}

/**
 * Check if value is a valid object (not null, not array)
 */
export function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Check if value is a valid function
 */
export function isValidFunction(value: unknown): value is Function {
  return typeof value === 'function';
}

/**
 * Check if value is a valid boolean
 */
export function isValidBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Check if value exists (not null or undefined)
 */
export function exists<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Check if value is a valid HTML element
 */
export function isHTMLElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement;
}

/**
 * Check if value is a valid event
 */
export function isValidEvent(value: unknown): value is Event {
  return value instanceof Event;
}

/**
 * Check if value is a valid React event
 */
export function isValidReactEvent<T = Element>(value: unknown): value is React.SyntheticEvent<T> {
  return isValidObject(value) && 'nativeEvent' in value && 'currentTarget' in value;
}

/**
 * Check if value is a valid error object
 */
export function isValidError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Check if value is a valid promise
 */
export function isValidPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise || (isValidObject(value) && isValidFunction((value as any).then));
}

/**
 * Validate hook parameters with type guards
 */
export function validateHookParams<T extends Record<string, unknown>>(
  params: T,
  validators: { [K in keyof T]?: (value: T[K]) => boolean }
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  for (const [key, validator] of Object.entries(validators)) {
    if (validator && !validator(params[key as keyof T])) {
      errors.push(`Invalid parameter: ${key}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// LANGUAGE VALIDATION TYPE GUARDS
// ============================================================================

/**
 * Check if value is a valid language code
 */
export function isValidLanguage(value: unknown): value is Language {
  return typeof value === 'string' && ['tr', 'en', 'de', 'fr'].includes(value);
}

/**
 * Check if value is valid localized content
 */
export function isLocalizedContent(value: unknown): value is LocalizedContent {
  return (
    isValidObject(value) &&
    'tr' in value &&
    'en' in value &&
    'de' in value &&
    'fr' in value &&
    typeof value.tr === 'string' &&
    typeof value.en === 'string' &&
    typeof value.de === 'string' &&
    typeof value.fr === 'string'
  );
}

/**
 * Check if value has valid localized content structure (partial)
 */
export function hasLocalizedContent(value: unknown): value is Partial<LocalizedContent> {
  if (!isValidObject(value)) return false;
  
  const validKeys = ['tr', 'en', 'de', 'fr'];
  const keys = Object.keys(value);
  
  return keys.length > 0 && keys.every(key => 
    validKeys.includes(key) && typeof value[key] === 'string'
  );
}

/**
 * Check if value has valid localized string array content structure
 */
export function isLocalizedStringArrayContent(value: unknown): value is LocalizedContent<string[]> {
  if (!isValidObject(value)) return false;
  
  const requiredKeys = ['tr', 'en', 'de', 'fr'];
  
  return requiredKeys.every(key => 
    key in value && 
    Array.isArray(value[key]) && 
    (value[key] as unknown[]).every(item => typeof item === 'string')
  );
}

/**
 * Check if value has complete localized content (all languages required)
 */
export function isCompleteLocalizedContent(value: unknown): value is LocalizedContent {
  if (!isValidObject(value)) return false;
  
  const requiredKeys = ['tr', 'en', 'de', 'fr'];
  
  return requiredKeys.every(key => 
    key in value && typeof value[key] === 'string' && value[key].length > 0
  );
}

// ============================================================================
// API RESPONSE VALIDATION TYPE GUARDS
// ============================================================================

/**
 * Check if value is a valid API response structure
 */
export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  return (
    isValidObject(value) &&
    'data' in value &&
    'success' in value &&
    typeof value.success === 'boolean'
  );
}

/**
 * Validate API response with data type guard
 */
export function validateApiResponse<T>(
  response: unknown,
  dataValidator: (data: unknown) => data is T
): response is ApiResponse<T> {
  if (!isApiResponse(response)) return false;
  return dataValidator(response.data);
}

/**
 * Check if API response indicates success
 */
export function isSuccessfulApiResponse<T>(value: unknown): value is ApiResponse<T> & { success: true } {
  return isApiResponse(value) && value.success === true;
}

/**
 * Check if API response indicates error
 */
export function isErrorApiResponse(value: unknown): value is ApiResponse & { success: false; error: string } {
  return (
    isApiResponse(value) &&
    value.success === false &&
    'error' in value &&
    typeof value.error === 'string'
  );
}

// ============================================================================
// CMS CONTENT VALIDATION TYPE GUARDS
// ============================================================================

/**
 * Check if value is valid CMS content base structure
 */
export function isCMSContent(value: unknown): value is CMSContent {
  return (
    isValidObject(value) &&
    'id' in value &&
    'slug' in value &&
    'title' in value &&
    'content' in value &&
    'publishedAt' in value &&
    'updatedAt' in value &&
    typeof value.id === 'string' &&
    typeof value.slug === 'string' &&
    isCompleteLocalizedContent(value.title) &&
    isCompleteLocalizedContent(value.content) &&
    typeof value.publishedAt === 'string' &&
    typeof value.updatedAt === 'string'
  );
}

/**
 * Check if value is a valid blog post
 */
export function isBlogPost(value: unknown): value is BlogPost {
  return (
    isCMSContent(value) &&
    'excerpt' in value &&
    'category' in value &&
    'featuredImage' in value &&
    isCompleteLocalizedContent(value.excerpt) &&
    isBlogCategory(value.category) &&
    isImageData(value.featuredImage)
  );
}

/**
 * Check if value is a valid blog category
 */
export function isBlogCategory(value: unknown): value is BlogCategory {
  return (
    isValidObject(value) &&
    'id' in value &&
    'name' in value &&
    'slug' in value &&
    'description' in value &&
    typeof value.id === 'string' &&
    hasLocalizedContent(value.name) &&
    hasLocalizedContent(value.slug) &&
    hasLocalizedContent(value.description)
  );
}

/**
 * Check if value is a valid feature
 */
export function isFeature(value: unknown): value is Feature {
  return (
    isCMSContent(value) &&
    'name' in value &&
    'description' in value &&
    'icon' in value &&
    'screenshots' in value &&
    'benefits' in value &&
    'category' in value &&
    'order' in value &&
    'isActive' in value &&
    'isPremium' in value &&
    isCompleteLocalizedContent(value.name) &&
    isCompleteLocalizedContent(value.description) &&
    typeof value.icon === 'string' &&
    isValidArray(value.screenshots) &&
    isLocalizedStringArrayContent(value.benefits) &&
    isFeatureCategory(value.category) &&
    typeof value.order === 'number' &&
    typeof value.isActive === 'boolean' &&
    typeof value.isPremium === 'boolean'
  );
}

/**
 * Check if value is a valid feature category
 */
export function isFeatureCategory(value: unknown): value is FeatureCategory {
  return (
    isValidObject(value) &&
    'id' in value &&
    'name' in value &&
    'slug' in value &&
    'description' in value &&
    'icon' in value &&
    'color' in value &&
    'featureCount' in value &&
    'order' in value &&
    typeof value.id === 'string' &&
    isCompleteLocalizedContent(value.name) &&
    isCompleteLocalizedContent(value.slug) &&
    isCompleteLocalizedContent(value.description) &&
    typeof value.icon === 'string' &&
    typeof value.color === 'string' &&
    typeof value.featureCount === 'number' &&
    typeof value.order === 'number'
  );
}

/**
 * Check if value is a valid author
 */
export function isAuthor(value: unknown): value is Author {
  return (
    isValidObject(value) &&
    'id' in value &&
    'name' in value &&
    'bio' in value &&
    'avatar' in value &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    hasLocalizedContent(value.bio) &&
    isImageData(value.avatar)
  );
}

/**
 * Check if value is valid image data
 */
export function isImageData(value: unknown): value is ImageData {
  return (
    isValidObject(value) &&
    'src' in value &&
    'alt' in value &&
    'width' in value &&
    'height' in value &&
    typeof value.src === 'string' &&
    hasLocalizedContent(value.alt) &&
    typeof value.width === 'number' &&
    typeof value.height === 'number' &&
    value.width > 0 &&
    value.height > 0
  );
}

/**
 * Check if value is valid SEO metadata
 */
export function isSEOMetadata(value: unknown): value is SEOMetadata {
  return (
    isValidObject(value) &&
    'title' in value &&
    'description' in value &&
    'keywords' in value &&
    hasLocalizedContent(value.title) &&
    hasLocalizedContent(value.description) &&
    hasLocalizedContent(value.keywords)
  );
}

// ============================================================================
// USER INPUT VALIDATION TYPE GUARDS
// ============================================================================

/**
 * Check if value is a valid contact form submission
 */
export function isValidContactForm(value: unknown): value is {
  name: string;
  email: string;
  subject: string;
  message: string;
  type?: string;
} {
  return (
    isValidObject(value) &&
    'name' in value &&
    'email' in value &&
    'subject' in value &&
    'message' in value &&
    isNonEmptyString(value.name) &&
    isValidEmail(value.email) &&
    isNonEmptyString(value.subject) &&
    isNonEmptyString(value.message)
  );
}

/**
 * Check if value is a valid newsletter subscription
 */
export function isValidNewsletterSubscription(value: unknown): value is {
  email: string;
  locale?: Language;
  preferences?: Record<string, boolean>;
} {
  return (
    isValidObject(value) &&
    'email' in value &&
    isValidEmail(value.email) &&
    (!('locale' in value) || isValidLanguage(value.locale))
  );
}

/**
 * Check if value is a valid search query
 */
export function isValidSearchQuery(value: unknown): value is {
  query: string;
  locale?: Language;
  category?: string;
  limit?: number;
  offset?: number;
} {
  return (
    isValidObject(value) &&
    'query' in value &&
    isNonEmptyString(value.query) &&
    (!('locale' in value) || isValidLanguage(value.locale)) &&
    (!('limit' in value) || (isValidNumber(value.limit) && value.limit > 0)) &&
    (!('offset' in value) || (isValidNumber(value.offset) && value.offset >= 0))
  );
}

/**
 * Check if value is valid form data with specific field requirements
 */
export function validateFormData<T extends Record<string, unknown>>(
  data: unknown,
  requiredFields: (keyof T)[],
  fieldValidators?: Partial<Record<keyof T, (value: unknown) => boolean>>
): data is T {
  if (!isValidObject(data)) return false;
  
  // Check required fields
  for (const field of requiredFields) {
    if (!(field in data) || (data as any)[field] === null || (data as any)[field] === undefined) {
      return false;
    }
  }
  
  // Check field validators if provided
  if (fieldValidators) {
    for (const [field, validator] of Object.entries(fieldValidators)) {
      if (field in data && validator && !validator(data[field])) {
        return false;
      }
    }
  }
  
  return true;
}

// ============================================================================
// ANALYTICS AND PERFORMANCE TYPE GUARDS
// ============================================================================

/**
 * Check if value is a valid analytics event
 */
export function isAnalyticsEvent(value: unknown): value is AnalyticsEvent {
  return (
    isValidObject(value) &&
    'name' in value &&
    'parameters' in value &&
    'timestamp' in value &&
    'sessionId' in value &&
    typeof value.name === 'string' &&
    isValidObject(value.parameters) &&
    typeof value.timestamp === 'number' &&
    typeof value.sessionId === 'string'
  );
}

/**
 * Check if value is a valid conversion event
 */
export function isConversionEvent(value: unknown): value is ConversionEvent {
  return (
    isAnalyticsEvent(value) &&
    'conversionType' in value &&
    typeof value.conversionType === 'string' &&
    ['download', 'signup', 'contact', 'subscription'].includes(value.conversionType)
  );
}

/**
 * Check if value is a valid performance metric
 */
export function isPerformanceMetric(value: unknown): value is PerformanceMetric {
  return (
    isValidObject(value) &&
    'name' in value &&
    'value' in value &&
    'unit' in value &&
    'timestamp' in value &&
    'url' in value &&
    typeof value.name === 'string' &&
    typeof value.value === 'number' &&
    typeof value.unit === 'string' &&
    ['ms', 'bytes', 'score', 'count'].includes(value.unit) &&
    typeof value.timestamp === 'number' &&
    typeof value.url === 'string'
  );
}

/**
 * Check if value is a valid web vitals metric
 */
export function isWebVitalsMetric(value: unknown): value is WebVitalsMetric {
  return (
    isPerformanceMetric(value) &&
    'id' in value &&
    'delta' in value &&
    'entries' in value &&
    typeof value.id === 'string' &&
    typeof value.delta === 'number' &&
    isValidArray(value.entries)
  );
}

// ============================================================================
// UTILITY TYPE GUARDS FOR COMPLEX VALIDATION
// ============================================================================

/**
 * Create a type guard that validates array elements
 */
export function createArrayValidator<T>(
  elementValidator: (item: unknown) => item is T
): (value: unknown) => value is T[] {
  return (value: unknown): value is T[] => {
    return isValidArray(value) && value.every(elementValidator);
  };
}

/**
 * Create a type guard that validates object properties
 */
export function createObjectValidator<T extends Record<string, unknown>>(
  propertyValidators: { [K in keyof T]: (value: unknown) => value is T[K] }
): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    if (!isValidObject(value)) return false;
    
    for (const [key, validator] of Object.entries(propertyValidators)) {
      if (!(key in value) || !validator(value[key])) {
        return false;
      }
    }
    
    return true;
  };
}

/**
 * Create a type guard for union types
 */
export function createUnionValidator<T>(...validators: Array<(value: unknown) => value is T>): (value: unknown) => value is T {
  return (value: unknown): value is T => {
    return validators.some(validator => validator(value));
  };
}

/**
 * Create a type guard for optional properties
 */
export function createOptionalValidator<T>(
  validator: (value: unknown) => value is T
): (value: unknown) => value is T | undefined {
  return (value: unknown): value is T | undefined => {
    return value === undefined || validator(value);
  };
}

/**
 * Validate nested object structure with path-based error reporting
 */
export function validateNestedObject<T>(
  value: unknown,
  schema: Record<string, (val: unknown) => boolean>,
  path: string = ''
): { isValid: boolean; errors: Array<{ path: string; message: string }> } {
  const errors: Array<{ path: string; message: string }> = [];
  
  if (!isValidObject(value)) {
    errors.push({ path, message: 'Expected object' });
    return { isValid: false, errors };
  }
  
  for (const [key, validator] of Object.entries(schema)) {
    const currentPath = path ? `${path}.${key}` : key;
    const fieldValue = value[key];
    
    if (!validator(fieldValue)) {
      errors.push({ path: currentPath, message: `Invalid value at ${currentPath}` });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}