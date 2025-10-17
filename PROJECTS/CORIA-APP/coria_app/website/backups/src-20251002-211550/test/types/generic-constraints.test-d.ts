/**
 * Type-only tests for generic type constraint validation
 * These tests ensure that generic types work correctly with proper constraints
 */

import { expectType, expectError, expectAssignable, expectNotAssignable } from 'tsd'
import type {
  ApiResponse,
  PaginatedResponse,
  Optional,
  RequiredFields,
  DeepPartial,
  LocalizedContent,
  ImageData,
  BlogPost,
  Feature,
  Author,
  BlogCategory,
  FeatureCategory,
  DataSource,
  SEOMetadata,
  PerformanceMetric,
  WebVitalsMetric,
  CoreWebVitals,
  FormState,
  FormFieldError,
  Language
} from '../../types/global'

// Test ApiResponse generic constraints
describe('ApiResponse generic type tests', () => {
  test('should work with any data type', () => {
    expectType<ApiResponse<string>>({
      data: 'test',
      success: true
    })

    expectType<ApiResponse<number>>({
      data: 123,
      success: true
    })

    expectType<ApiResponse<BlogPost>>({
      data: {} as BlogPost,
      success: true
    })

    expectType<ApiResponse<BlogPost[]>>({
      data: [] as BlogPost[],
      success: true
    })
  })

  test('should enforce data type constraints', () => {
    expectError<ApiResponse<string>>({
      // @ts-expect-error - wrong data type
      data: 123,
      success: true
    })

    expectError<ApiResponse<number>>({
      // @ts-expect-error - wrong data type
      data: 'test',
      success: true
    })
  })

  test('should require success field', () => {
    // Test that ApiResponse without success field is rejected
    expectError<ApiResponse<string>>({
      data: 'test'
      // Missing required 'success' field
    } as any)
  })

  test('should accept optional fields', () => {
    expectType<ApiResponse<string>>({
      data: 'test',
      success: true,
      message: 'Success message',
      error: 'Error message'
    })
  })
})

// Test PaginatedResponse generic constraints
describe('PaginatedResponse generic type tests', () => {
  test('should work with array data types', () => {
    expectType<PaginatedResponse<BlogPost>>({
      data: [] as BlogPost[],
      success: true,
      pagination: {
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrev: false
      }
    })
  })

  test('should require pagination field', () => {
    expectError<PaginatedResponse<BlogPost>>({
      data: [] as BlogPost[],
      success: true
      // Missing required 'pagination' field
    } as any)
  })

  test('should enforce pagination structure', () => {
    expectError<PaginatedResponse<BlogPost>>({
      data: [] as BlogPost[],
      success: true,
      pagination: {
        page: 1
        // Missing: limit, total, totalPages, hasNext, hasPrev
      } as any
    })
  })
})

// Test utility type constraints
describe('Utility type constraint tests', () => {
  interface TestInterface {
    required: string
    optional?: number
    another: boolean
  }

  test('Optional utility type should make specified fields optional', () => {
    expectType<Optional<TestInterface, 'required'>>({
      another: true
    })

    expectType<Optional<TestInterface, 'required'>>({
      required: 'test',
      another: true
    })

    expectType<Optional<TestInterface, 'required' | 'another'>>({
      optional: 123
    })
  })

  test('RequiredFields utility type should make specified fields required', () => {
    expectType<RequiredFields<TestInterface, 'optional'>>({
      required: 'test',
      optional: 123,
      another: true
    })

    expectError<RequiredFields<TestInterface, 'optional'>>({
      required: 'test',
      another: true
      // Missing required 'optional' field
    } as any)
  })

  test('DeepPartial utility type should make all fields optional recursively', () => {
    interface NestedInterface {
      level1: {
        level2: {
          value: string
        }
        array: string[]
      }
      simple: number
    }

    expectType<DeepPartial<NestedInterface>>({})
    expectType<DeepPartial<NestedInterface>>({
      level1: {}
    })
    expectType<DeepPartial<NestedInterface>>({
      level1: {
        level2: {}
      }
    })
    expectType<DeepPartial<NestedInterface>>({
      simple: 123
    })
  })
})

// Test LocalizedContent generic constraints
describe('LocalizedContent generic type tests', () => {
  test('should work with string content', () => {
    expectType<LocalizedContent>({
      tr: 'Türkçe',
      en: 'English',
      de: 'Deutsch',
      fr: 'Français'
    })
  })

  test('should require all language fields', () => {
    expectError<LocalizedContent>({
      tr: 'Türkçe',
      en: 'English'
      // Missing required 'de' and 'fr' fields
    } as any)

    expectError<LocalizedContent>({
      tr: 'Türkçe',
      en: 'English',
      de: 'Deutsch'
      // Missing required 'fr' field
    } as any)
  })

  test('should reject invalid language keys', () => {
    expectError<LocalizedContent>({
      tr: 'Türkçe',
      en: 'English',
      de: 'Deutsch',
      fr: 'Français',
      // @ts-expect-error - invalid language key
      es: 'Español'
    })
  })
})

// Test complex type constraints
describe('Complex type constraint tests', () => {
  test('BlogPost should have proper type constraints', () => {
    const blogPost: BlogPost = {
      id: '1',
      slug: 'test-post',
      title: {
        tr: 'Test Başlık',
        en: 'Test Title',
        de: 'Test Titel',
        fr: 'Titre de Test'
      },
      excerpt: {
        tr: 'Test özet',
        en: 'Test excerpt',
        de: 'Test Auszug',
        fr: 'Extrait de test'
      },
      content: {
        tr: 'Test içerik',
        en: 'Test content',
        de: 'Test Inhalt',
        fr: 'Contenu de test'
      },
      author: {} as Author,
      category: {} as BlogCategory,
      tags: ['test'],
      featuredImage: {} as ImageData,
      publishedAt: '2023-01-01',
      updatedAt: '2023-01-01',
      seo: {} as SEOMetadata
    }

    expectType<BlogPost>(blogPost)
  })

  test('Feature should have proper type constraints', () => {
    const feature: Feature = {
      id: '1',
      name: {
        tr: 'Özellik',
        en: 'Feature',
        de: 'Funktion',
        fr: 'Fonctionnalité'
      },
      description: {
        tr: 'Açıklama',
        en: 'Description',
        de: 'Beschreibung',
        fr: 'Description'
      },
      icon: 'test-icon',
      screenshots: [],
      benefits: {
        tr: ['Fayda 1'],
        en: ['Benefit 1'],
        de: ['Vorteil 1'],
        fr: ['Avantage 1']
      },
      category: {} as FeatureCategory,
      methodology: {
        tr: 'Metodoloji',
        en: 'Methodology',
        de: 'Methodik',
        fr: 'Méthodologie'
      },
      dataSources: [] as DataSource[],
      relatedFeatures: []
    }

    expectType<Feature>(feature)
  })

  test('should enforce nested type constraints', () => {
    expectError<BlogPost>({
      id: '1',
      slug: 'test-post',
      title: {
        en: 'Test Title'
        // Missing required language fields: tr, de, fr
      } as any,
      // ... other required fields
    } as any)
  })
})

// Test performance metric type constraints
describe('Performance metric type constraints', () => {
  test('PerformanceMetric should accept valid units', () => {
    expectType<PerformanceMetric>({
      name: 'test-metric',
      value: 100,
      unit: 'ms',
      timestamp: Date.now(),
      url: 'https://example.com'
    })

    expectType<PerformanceMetric>({
      name: 'test-metric',
      value: 1024,
      unit: 'bytes',
      timestamp: Date.now(),
      url: 'https://example.com'
    })

    expectType<PerformanceMetric>({
      name: 'test-metric',
      value: 95,
      unit: 'score',
      timestamp: Date.now(),
      url: 'https://example.com'
    })

    expectType<PerformanceMetric>({
      name: 'test-metric',
      value: 5,
      unit: 'count',
      timestamp: Date.now(),
      url: 'https://example.com'
    })
  })

  test('should reject invalid units', () => {
    expectError<PerformanceMetric>({
      name: 'test-metric',
      value: 100,
      // @ts-expect-error - invalid unit
      unit: 'invalid',
      timestamp: Date.now(),
      url: 'https://example.com'
    })
  })

  test('WebVitalsMetric should extend PerformanceMetric', () => {
    expectAssignable<PerformanceMetric>({} as WebVitalsMetric)
  })

  test('WebVitalsMetric should have additional required fields', () => {
    expectType<WebVitalsMetric>({
      name: 'LCP',
      value: 2500,
      unit: 'ms',
      timestamp: Date.now(),
      url: 'https://example.com',
      id: 'lcp-123',
      delta: 100,
      entries: [],
      navigationType: 'navigate'
    })

    expectError<WebVitalsMetric>({
      name: 'LCP',
      value: 2500,
      unit: 'ms',
      timestamp: Date.now(),
      url: 'https://example.com'
      // Missing required WebVitals fields: id, delta, entries, navigationType, rating, userAgent, locale
    } as any)
  })

  test('should enforce navigationType constraints', () => {
    expectType<WebVitalsMetric>({
      name: 'LCP',
      value: 2500,
      unit: 'ms',
      timestamp: Date.now(),
      url: 'https://example.com',
      id: 'lcp-123',
      delta: 100,
      entries: [],
      navigationType: 'navigate'
    })

    expectType<WebVitalsMetric>({
      name: 'LCP',
      value: 2500,
      unit: 'ms',
      timestamp: Date.now(),
      url: 'https://example.com',
      id: 'lcp-123',
      delta: 100,
      entries: [],
      navigationType: 'reload'
    })

    expectError<WebVitalsMetric>({
      name: 'LCP',
      value: 2500,
      unit: 'ms',
      timestamp: Date.now(),
      url: 'https://example.com',
      id: 'lcp-123',
      delta: 100,
      entries: [],
      // @ts-expect-error - invalid navigationType
      navigationType: 'invalid'
    })
  })
})

// Test form state type constraints
describe('Form state type constraints', () => {
  interface TestFormData {
    name: string
    email: string
    age?: number
  }

  test('FormState should work with generic data type', () => {
    expectType<FormState<TestFormData>>({
      data: {
        name: 'John',
        email: 'john@example.com',
        age: 30
      },
      errors: [],
      isSubmitting: false,
      isValid: true
    })

    expectType<FormState<TestFormData>>({
      data: {
        name: 'John',
        email: 'john@example.com'
      },
      errors: [
        {
          field: 'name',
          message: 'Name is required'
        }
      ],
      isSubmitting: true,
      isValid: false
    })
  })

  test('should enforce data type constraints', () => {
    expectError<FormState<TestFormData>>({
      data: {
        // @ts-expect-error - wrong data type
        name: 123,
        email: 'john@example.com'
      },
      errors: [],
      isSubmitting: false,
      isValid: true
    })
  })

  test('FormFieldError should have proper structure', () => {
    expectType<FormFieldError>({
      field: 'name',
      message: 'Name is required'
    })

    expectType<FormFieldError>({
      field: 'email',
      message: 'Invalid email',
      code: 'INVALID_EMAIL'
    })

    // Test that FormFieldError without required field is rejected
    expectError<FormFieldError>({
      message: 'Error message'
      // Missing required 'field' property
    } as any)
  })
})

// Test function type constraints
describe('Function type constraint tests', () => {
  test('should properly type event handlers', () => {
    type ClickHandler = (event: React.MouseEvent<HTMLButtonElement>) => void
    
    const handler: ClickHandler = (event) => {
      expectType<React.MouseEvent<HTMLButtonElement>>(event)
      expectType<HTMLButtonElement>(event.currentTarget)
    }

    expectType<ClickHandler>(handler)
  })

  test('should properly type async functions', () => {
    type AsyncFunction<T> = () => Promise<T>
    
    const fetchData: AsyncFunction<BlogPost[]> = async () => {
      return [] as BlogPost[]
    }

    expectType<AsyncFunction<BlogPost[]>>(fetchData)
    
    // Test return type
    const result = fetchData()
    expectType<Promise<BlogPost[]>>(result)
  })

  test('should properly type generic functions', () => {
    type GenericFunction<T, R> = (input: T) => R
    
    const transform: GenericFunction<string, number> = (input) => {
      expectType<string>(input)
      return input.length
    }

    expectType<GenericFunction<string, number>>(transform)
    
    const result = transform('test')
    expectType<number>(result)
  })
})