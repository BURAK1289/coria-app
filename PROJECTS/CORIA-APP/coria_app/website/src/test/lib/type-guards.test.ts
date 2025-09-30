/**
 * Runtime type validation tests for type guard functions
 * These tests ensure that type guards work correctly at runtime
 */

import { describe, it, expect } from 'vitest'
import {
  isNonEmptyString,
  isValidNumber,
  isPositiveNumber,
  isValidUrl,
  isValidEmail,
  isValidDate,
  isValidArray,
  isValidObject,
  isValidFunction,
  isValidBoolean,
  exists,
  isHTMLElement,
  isValidEvent,
  isValidReactEvent,
  isValidError,
  isValidPromise,
  validateHookParams,
  isValidLanguage,
  isLocalizedContent,
  hasLocalizedContent,
  isApiResponse,
  validateApiResponse,
  isSuccessfulApiResponse,
  isErrorApiResponse,
  isCMSContent,
  isBlogPost,
  isBlogCategory,
  isFeature,
  isFeatureCategory,
  isAuthor,
  isImageData,
  isSEOMetadata,
  isValidContactForm,
  isValidNewsletterSubscription,
  isValidSearchQuery,
  validateFormData,
  isAnalyticsEvent,
  isConversionEvent,
  isPerformanceMetric,
  isWebVitalsMetric,
  createArrayValidator,
  createObjectValidator,
  createUnionValidator,
  createOptionalValidator,
  validateNestedObject
} from '../../lib/type-guards'

describe('Basic type guards', () => {
  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true)
      expect(isNonEmptyString('test string')).toBe(true)
      expect(isNonEmptyString('   valid   ')).toBe(true)
    })

    it('should return false for empty or invalid strings', () => {
      expect(isNonEmptyString('')).toBe(false)
      expect(isNonEmptyString('   ')).toBe(false)
      expect(isNonEmptyString(null)).toBe(false)
      expect(isNonEmptyString(undefined)).toBe(false)
      expect(isNonEmptyString(123)).toBe(false)
      expect(isNonEmptyString({})).toBe(false)
    })
  })

  describe('isValidNumber', () => {
    it('should return true for valid numbers', () => {
      expect(isValidNumber(0)).toBe(true)
      expect(isValidNumber(123)).toBe(true)
      expect(isValidNumber(-456)).toBe(true)
      expect(isValidNumber(3.14159)).toBe(true)
    })

    it('should return false for invalid numbers', () => {
      expect(isValidNumber(NaN)).toBe(false)
      expect(isValidNumber(Infinity)).toBe(false)
      expect(isValidNumber(-Infinity)).toBe(false)
      expect(isValidNumber('123')).toBe(false)
      expect(isValidNumber(null)).toBe(false)
      expect(isValidNumber(undefined)).toBe(false)
    })
  })

  describe('isPositiveNumber', () => {
    it('should return true for positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true)
      expect(isPositiveNumber(123.45)).toBe(true)
      expect(isPositiveNumber(0.001)).toBe(true)
    })

    it('should return false for non-positive numbers', () => {
      expect(isPositiveNumber(0)).toBe(false)
      expect(isPositiveNumber(-1)).toBe(false)
      expect(isPositiveNumber(-123.45)).toBe(false)
      expect(isPositiveNumber(NaN)).toBe(false)
      expect(isPositiveNumber('123')).toBe(false)
    })
  })

  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://localhost:3000')).toBe(true)
      expect(isValidUrl('https://subdomain.example.com/path?query=value')).toBe(true)
      expect(isValidUrl('ftp://files.example.com')).toBe(true)
    })

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('not-a-url')).toBe(false)
      expect(isValidUrl('http://')).toBe(false)
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl(null)).toBe(false)
      expect(isValidUrl(123)).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
      expect(isValidEmail('simple@test.org')).toBe(true)
    })

    it('should return false for invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('test@.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail(null)).toBe(false)
    })
  })

  describe('isValidDate', () => {
    it('should return true for valid Date objects', () => {
      expect(isValidDate(new Date())).toBe(true)
      expect(isValidDate(new Date('2023-01-01'))).toBe(true)
      expect(isValidDate(new Date(2023, 0, 1))).toBe(true)
    })

    it('should return false for invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false)
      expect(isValidDate('2023-01-01')).toBe(false)
      expect(isValidDate(1672531200000)).toBe(false)
      expect(isValidDate(null)).toBe(false)
      expect(isValidDate(undefined)).toBe(false)
    })
  })

  describe('isValidArray', () => {
    it('should return true for valid arrays', () => {
      expect(isValidArray([])).toBe(true)
      expect(isValidArray([1, 2, 3])).toBe(true)
      expect(isValidArray(['a', 'b', 'c'])).toBe(true)
      expect(isValidArray([1, 2, 3], 2)).toBe(true)
    })

    it('should return false for invalid arrays or insufficient length', () => {
      expect(isValidArray('not-array')).toBe(false)
      expect(isValidArray({})).toBe(false)
      expect(isValidArray(null)).toBe(false)
      expect(isValidArray([1, 2], 3)).toBe(false)
    })
  })

  describe('isValidObject', () => {
    it('should return true for valid objects', () => {
      expect(isValidObject({})).toBe(true)
      expect(isValidObject({ key: 'value' })).toBe(true)
      expect(isValidObject({ nested: { object: true } })).toBe(true)
    })

    it('should return false for non-objects', () => {
      expect(isValidObject(null)).toBe(false)
      expect(isValidObject([])).toBe(false)
      expect(isValidObject('string')).toBe(false)
      expect(isValidObject(123)).toBe(false)
      expect(isValidObject(undefined)).toBe(false)
    })
  })

  describe('exists', () => {
    it('should return true for existing values', () => {
      expect(exists('string')).toBe(true)
      expect(exists(0)).toBe(true)
      expect(exists(false)).toBe(true)
      expect(exists({})).toBe(true)
      expect(exists([])).toBe(true)
    })

    it('should return false for null or undefined', () => {
      expect(exists(null)).toBe(false)
      expect(exists(undefined)).toBe(false)
    })
  })
})

describe('Language validation type guards', () => {
  describe('isValidLanguage', () => {
    it('should return true for valid language codes', () => {
      expect(isValidLanguage('tr')).toBe(true)
      expect(isValidLanguage('en')).toBe(true)
      expect(isValidLanguage('de')).toBe(true)
      expect(isValidLanguage('fr')).toBe(true)
    })

    it('should return false for invalid language codes', () => {
      expect(isValidLanguage('es')).toBe(false)
      expect(isValidLanguage('it')).toBe(false)
      expect(isValidLanguage('invalid')).toBe(false)
      expect(isValidLanguage('')).toBe(false)
      expect(isValidLanguage(null)).toBe(false)
      expect(isValidLanguage(123)).toBe(false)
    })
  })

  describe('isLocalizedContent', () => {
    it('should return true for valid localized content', () => {
      const validContent = {
        tr: 'Türkçe içerik',
        en: 'English content',
        de: 'Deutsche Inhalt',
        fr: 'Contenu français'
      }
      expect(isLocalizedContent(validContent)).toBe(true)
    })

    it('should return false for invalid localized content', () => {
      expect(isLocalizedContent({})).toBe(false)
      expect(isLocalizedContent({ tr: 'test' })).toBe(false)
      expect(isLocalizedContent({ tr: 'test', en: 'test' })).toBe(false)
      expect(isLocalizedContent({ tr: 123, en: 'test', de: 'test', fr: 'test' })).toBe(false)
      expect(isLocalizedContent(null)).toBe(false)
      expect(isLocalizedContent('string')).toBe(false)
    })
  })

  describe('hasLocalizedContent', () => {
    it('should return true for partial localized content', () => {
      expect(hasLocalizedContent({ tr: 'test' })).toBe(true)
      expect(hasLocalizedContent({ en: 'test', de: 'test' })).toBe(true)
      expect(hasLocalizedContent({ tr: 'test', en: 'test', de: 'test', fr: 'test' })).toBe(true)
    })

    it('should return false for invalid partial content', () => {
      expect(hasLocalizedContent({})).toBe(false)
      expect(hasLocalizedContent({ invalid: 'test' })).toBe(false)
      expect(hasLocalizedContent({ tr: 123 })).toBe(false)
      expect(hasLocalizedContent(null)).toBe(false)
    })
  })
})

describe('API response validation type guards', () => {
  describe('isApiResponse', () => {
    it('should return true for valid API responses', () => {
      expect(isApiResponse({ data: 'test', success: true })).toBe(true)
      expect(isApiResponse({ data: null, success: false })).toBe(true)
      expect(isApiResponse({ data: [], success: true, message: 'Success' })).toBe(true)
    })

    it('should return false for invalid API responses', () => {
      expect(isApiResponse({})).toBe(false)
      expect(isApiResponse({ data: 'test' })).toBe(false)
      expect(isApiResponse({ success: true })).toBe(false)
      expect(isApiResponse({ data: 'test', success: 'true' })).toBe(false)
      expect(isApiResponse(null)).toBe(false)
    })
  })

  describe('validateApiResponse', () => {
    const stringValidator = (data: unknown): data is string => typeof data === 'string'
    const numberValidator = (data: unknown): data is number => typeof data === 'number'

    it('should return true for valid API response with correct data type', () => {
      expect(validateApiResponse({ data: 'test', success: true }, stringValidator)).toBe(true)
      expect(validateApiResponse({ data: 123, success: true }, numberValidator)).toBe(true)
    })

    it('should return false for invalid API response or wrong data type', () => {
      expect(validateApiResponse({ data: 123, success: true }, stringValidator)).toBe(false)
      expect(validateApiResponse({ data: 'test', success: true }, numberValidator)).toBe(false)
      expect(validateApiResponse({ data: 'test' }, stringValidator)).toBe(false)
    })
  })

  describe('isSuccessfulApiResponse', () => {
    it('should return true for successful API responses', () => {
      expect(isSuccessfulApiResponse({ data: 'test', success: true })).toBe(true)
      expect(isSuccessfulApiResponse({ data: null, success: true, message: 'Success' })).toBe(true)
    })

    it('should return false for unsuccessful API responses', () => {
      expect(isSuccessfulApiResponse({ data: 'test', success: false })).toBe(false)
      expect(isSuccessfulApiResponse({ data: 'test' })).toBe(false)
      expect(isSuccessfulApiResponse(null)).toBe(false)
    })
  })

  describe('isErrorApiResponse', () => {
    it('should return true for error API responses', () => {
      expect(isErrorApiResponse({ data: null, success: false, error: 'Error message' })).toBe(true)
    })

    it('should return false for non-error API responses', () => {
      expect(isErrorApiResponse({ data: 'test', success: true })).toBe(false)
      expect(isErrorApiResponse({ data: null, success: false })).toBe(false)
      expect(isErrorApiResponse({ success: false, error: 'Error' })).toBe(false)
    })
  })
})

describe('CMS content validation type guards', () => {
  const mockLocalizedContent = {
    tr: 'Türkçe',
    en: 'English',
    de: 'Deutsch',
    fr: 'Français'
  }

  const mockImageData = {
    src: '/image.jpg',
    alt: mockLocalizedContent,
    width: 800,
    height: 600
  }

  describe('isImageData', () => {
    it('should return true for valid image data', () => {
      expect(isImageData(mockImageData)).toBe(true)
      expect(isImageData({
        src: '/test.png',
        alt: mockLocalizedContent,
        width: 1920,
        height: 1080,
        blurDataURL: 'data:image/jpeg;base64,/9j/4AAQ...'
      })).toBe(true)
    })

    it('should return false for invalid image data', () => {
      expect(isImageData({})).toBe(false)
      expect(isImageData({ src: '/image.jpg' })).toBe(false)
      expect(isImageData({ ...mockImageData, width: 0 })).toBe(false)
      expect(isImageData({ ...mockImageData, height: -1 })).toBe(false)
      expect(isImageData({ ...mockImageData, alt: 'string' })).toBe(false)
    })
  })

  describe('isBlogCategory', () => {
    const mockBlogCategory = {
      id: '1',
      name: mockLocalizedContent,
      slug: mockLocalizedContent,
      description: mockLocalizedContent
    }

    it('should return true for valid blog category', () => {
      expect(isBlogCategory(mockBlogCategory)).toBe(true)
    })

    it('should return false for invalid blog category', () => {
      expect(isBlogCategory({})).toBe(false)
      expect(isBlogCategory({ id: '1' })).toBe(false)
      expect(isBlogCategory({ ...mockBlogCategory, name: 'string' })).toBe(false)
    })
  })

  describe('isAuthor', () => {
    const mockAuthor = {
      id: '1',
      name: 'John Doe',
      bio: mockLocalizedContent,
      avatar: mockImageData
    }

    it('should return true for valid author', () => {
      expect(isAuthor(mockAuthor)).toBe(true)
    })

    it('should return false for invalid author', () => {
      expect(isAuthor({})).toBe(false)
      expect(isAuthor({ id: '1', name: 'John' })).toBe(false)
      expect(isAuthor({ ...mockAuthor, bio: 'string' })).toBe(false)
      expect(isAuthor({ ...mockAuthor, avatar: {} })).toBe(false)
    })
  })
})

describe('User input validation type guards', () => {
  describe('isValidContactForm', () => {
    const validContactForm = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'Test message content'
    }

    it('should return true for valid contact form data', () => {
      expect(isValidContactForm(validContactForm)).toBe(true)
      expect(isValidContactForm({ ...validContactForm, type: 'support' })).toBe(true)
    })

    it('should return false for invalid contact form data', () => {
      expect(isValidContactForm({})).toBe(false)
      expect(isValidContactForm({ ...validContactForm, name: '' })).toBe(false)
      expect(isValidContactForm({ ...validContactForm, email: 'invalid-email' })).toBe(false)
      expect(isValidContactForm({ ...validContactForm, subject: '' })).toBe(false)
      expect(isValidContactForm({ ...validContactForm, message: '' })).toBe(false)
    })
  })

  describe('isValidNewsletterSubscription', () => {
    it('should return true for valid newsletter subscription', () => {
      expect(isValidNewsletterSubscription({ email: 'test@example.com' })).toBe(true)
      expect(isValidNewsletterSubscription({ 
        email: 'test@example.com', 
        locale: 'en',
        preferences: { marketing: true }
      })).toBe(true)
    })

    it('should return false for invalid newsletter subscription', () => {
      expect(isValidNewsletterSubscription({})).toBe(false)
      expect(isValidNewsletterSubscription({ email: 'invalid-email' })).toBe(false)
      expect(isValidNewsletterSubscription({ email: 'test@example.com', locale: 'invalid' })).toBe(false)
    })
  })

  describe('isValidSearchQuery', () => {
    it('should return true for valid search queries', () => {
      expect(isValidSearchQuery({ query: 'sustainability' })).toBe(true)
      expect(isValidSearchQuery({ 
        query: 'test search', 
        locale: 'en',
        category: 'blog',
        limit: 10,
        offset: 0
      })).toBe(true)
    })

    it('should return false for invalid search queries', () => {
      expect(isValidSearchQuery({})).toBe(false)
      expect(isValidSearchQuery({ query: '' })).toBe(false)
      expect(isValidSearchQuery({ query: '   ' })).toBe(false)
      expect(isValidSearchQuery({ query: 'test', limit: -1 })).toBe(false)
      expect(isValidSearchQuery({ query: 'test', offset: -1 })).toBe(false)
      expect(isValidSearchQuery({ query: 'test', locale: 'invalid' })).toBe(false)
    })
  })

  describe('validateFormData', () => {
    interface TestForm {
      name: string
      email: string
      age?: number
    }

    const fieldValidators = {
      name: isNonEmptyString,
      email: isValidEmail,
      age: isPositiveNumber
    }

    it('should return true for valid form data', () => {
      expect(validateFormData<TestForm>(
        { name: 'John', email: 'john@example.com' },
        ['name', 'email'],
        fieldValidators
      )).toBe(true)

      expect(validateFormData<TestForm>(
        { name: 'John', email: 'john@example.com', age: 25 },
        ['name', 'email'],
        fieldValidators
      )).toBe(true)
    })

    it('should return false for invalid form data', () => {
      expect(validateFormData<TestForm>(
        { name: 'John' },
        ['name', 'email'],
        fieldValidators
      )).toBe(false)

      expect(validateFormData<TestForm>(
        { name: '', email: 'john@example.com' },
        ['name', 'email'],
        fieldValidators
      )).toBe(false)

      expect(validateFormData<TestForm>(
        { name: 'John', email: 'invalid-email' },
        ['name', 'email'],
        fieldValidators
      )).toBe(false)

      expect(validateFormData<TestForm>(
        { name: 'John', email: 'john@example.com', age: -1 },
        ['name', 'email'],
        fieldValidators
      )).toBe(false)
    })
  })
})

describe('Analytics and performance type guards', () => {
  describe('isAnalyticsEvent', () => {
    const validAnalyticsEvent = {
      name: 'page_view',
      parameters: { page: '/home' },
      timestamp: Date.now(),
      sessionId: 'session-123'
    }

    it('should return true for valid analytics events', () => {
      expect(isAnalyticsEvent(validAnalyticsEvent)).toBe(true)
      expect(isAnalyticsEvent({
        ...validAnalyticsEvent,
        userId: 'user-456',
        locale: 'en'
      })).toBe(true)
    })

    it('should return false for invalid analytics events', () => {
      expect(isAnalyticsEvent({})).toBe(false)
      expect(isAnalyticsEvent({ ...validAnalyticsEvent, name: 123 })).toBe(false)
      expect(isAnalyticsEvent({ ...validAnalyticsEvent, parameters: 'invalid' })).toBe(false)
      expect(isAnalyticsEvent({ ...validAnalyticsEvent, timestamp: 'invalid' })).toBe(false)
    })
  })

  describe('isConversionEvent', () => {
    const validConversionEvent = {
      name: 'conversion',
      parameters: {},
      timestamp: Date.now(),
      sessionId: 'session-123',
      conversionType: 'signup' as const
    }

    it('should return true for valid conversion events', () => {
      expect(isConversionEvent(validConversionEvent)).toBe(true)
      expect(isConversionEvent({
        ...validConversionEvent,
        conversionType: 'download' as const,
        value: 29.99
      })).toBe(true)
    })

    it('should return false for invalid conversion events', () => {
      expect(isConversionEvent({ ...validConversionEvent, conversionType: 'invalid' })).toBe(false)
      expect(isConversionEvent({ name: 'test', parameters: {}, timestamp: Date.now(), sessionId: 'test' })).toBe(false)
    })
  })

  describe('isPerformanceMetric', () => {
    const validPerformanceMetric = {
      name: 'page_load_time',
      value: 1500,
      unit: 'ms' as const,
      timestamp: Date.now(),
      url: 'https://example.com'
    }

    it('should return true for valid performance metrics', () => {
      expect(isPerformanceMetric(validPerformanceMetric)).toBe(true)
      expect(isPerformanceMetric({
        ...validPerformanceMetric,
        unit: 'bytes' as const,
        userAgent: 'Mozilla/5.0...'
      })).toBe(true)
    })

    it('should return false for invalid performance metrics', () => {
      expect(isPerformanceMetric({})).toBe(false)
      expect(isPerformanceMetric({ ...validPerformanceMetric, unit: 'invalid' })).toBe(false)
      expect(isPerformanceMetric({ ...validPerformanceMetric, value: 'invalid' })).toBe(false)
    })
  })

  describe('isWebVitalsMetric', () => {
    const validWebVitalsMetric = {
      name: 'LCP',
      value: 2500,
      unit: 'ms' as const,
      timestamp: Date.now(),
      url: 'https://example.com',
      id: 'lcp-123',
      delta: 100,
      entries: []
    }

    it('should return true for valid web vitals metrics', () => {
      expect(isWebVitalsMetric(validWebVitalsMetric)).toBe(true)
    })

    it('should return false for invalid web vitals metrics', () => {
      expect(isWebVitalsMetric({ ...validWebVitalsMetric, id: 123 })).toBe(false)
      expect(isWebVitalsMetric({ ...validWebVitalsMetric, entries: 'invalid' })).toBe(false)
      expect(isWebVitalsMetric({ name: 'LCP', value: 2500, unit: 'ms', timestamp: Date.now(), url: 'test' })).toBe(false)
    })
  })
})

describe('Utility type guard creators', () => {
  describe('createArrayValidator', () => {
    const stringArrayValidator = createArrayValidator(isNonEmptyString)
    const numberArrayValidator = createArrayValidator(isValidNumber)

    it('should create validators that work correctly', () => {
      expect(stringArrayValidator(['hello', 'world'])).toBe(true)
      expect(stringArrayValidator([])).toBe(true)
      expect(numberArrayValidator([1, 2, 3])).toBe(true)
      expect(numberArrayValidator([])).toBe(true)
    })

    it('should reject invalid arrays', () => {
      expect(stringArrayValidator(['hello', ''])).toBe(false)
      expect(stringArrayValidator(['hello', 123])).toBe(false)
      expect(numberArrayValidator([1, 'invalid'])).toBe(false)
      expect(stringArrayValidator('not-array')).toBe(false)
    })
  })

  describe('createObjectValidator', () => {
    const personValidator = createObjectValidator({
      name: isNonEmptyString,
      age: isPositiveNumber,
      email: isValidEmail
    })

    it('should create validators that work correctly', () => {
      expect(personValidator({
        name: 'John Doe',
        age: 25,
        email: 'john@example.com'
      })).toBe(true)
    })

    it('should reject invalid objects', () => {
      expect(personValidator({
        name: '',
        age: 25,
        email: 'john@example.com'
      })).toBe(false)

      expect(personValidator({
        name: 'John Doe',
        age: -1,
        email: 'john@example.com'
      })).toBe(false)

      expect(personValidator({
        name: 'John Doe',
        age: 25,
        email: 'invalid-email'
      })).toBe(false)

      expect(personValidator({
        name: 'John Doe',
        age: 25
        // missing email
      })).toBe(false)
    })
  })

  describe('createUnionValidator', () => {
    const stringOrNumberValidator = createUnionValidator(
      (value): value is string => typeof value === 'string',
      (value): value is number => typeof value === 'number'
    )

    it('should accept values that match any validator', () => {
      expect(stringOrNumberValidator('hello')).toBe(true)
      expect(stringOrNumberValidator(123)).toBe(true)
    })

    it('should reject values that match no validator', () => {
      expect(stringOrNumberValidator(true)).toBe(false)
      expect(stringOrNumberValidator({})).toBe(false)
      expect(stringOrNumberValidator(null)).toBe(false)
    })
  })

  describe('createOptionalValidator', () => {
    const optionalStringValidator = createOptionalValidator(isNonEmptyString)

    it('should accept valid values and undefined', () => {
      expect(optionalStringValidator('hello')).toBe(true)
      expect(optionalStringValidator(undefined)).toBe(true)
    })

    it('should reject invalid values', () => {
      expect(optionalStringValidator('')).toBe(false)
      expect(optionalStringValidator(123)).toBe(false)
      expect(optionalStringValidator(null)).toBe(false)
    })
  })

  describe('validateNestedObject', () => {
    const schema = {
      name: isNonEmptyString,
      age: isPositiveNumber,
      address: (value: unknown) => isValidObject(value) && 'street' in value && isNonEmptyString(value.street)
    }

    it('should validate nested objects correctly', () => {
      const result = validateNestedObject({
        name: 'John Doe',
        age: 25,
        address: { street: '123 Main St' }
      }, schema)

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should report validation errors with paths', () => {
      const result = validateNestedObject({
        name: '',
        age: -1,
        address: { street: '' }
      }, schema)

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(3)
      expect(result.errors.map(e => e.path)).toEqual(['name', 'age', 'address'])
    })

    it('should handle nested paths correctly', () => {
      const result = validateNestedObject({
        name: 'John',
        age: 25,
        address: 'invalid'
      }, schema, 'user')

      expect(result.isValid).toBe(false)
      expect(result.errors[0].path).toBe('user.address')
    })
  })
})

describe('Hook parameter validation', () => {
  describe('validateHookParams', () => {
    it('should validate hook parameters correctly', () => {
      const result = validateHookParams(
        { name: 'John', age: 25, email: 'john@example.com' },
        {
          name: isNonEmptyString,
          age: isPositiveNumber,
          email: isValidEmail
        }
      )

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should report validation errors', () => {
      const result = validateHookParams(
        { name: '', age: -1, email: 'invalid' },
        {
          name: isNonEmptyString,
          age: isPositiveNumber,
          email: isValidEmail
        }
      )

      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(3)
      expect(result.errors).toEqual([
        'Invalid parameter: name',
        'Invalid parameter: age',
        'Invalid parameter: email'
      ])
    })

    it('should handle partial validation', () => {
      const result = validateHookParams(
        { name: 'John', age: 25, email: 'john@example.com' },
        {
          name: isNonEmptyString,
          // age validator not provided
          email: isValidEmail
        }
      )

      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})