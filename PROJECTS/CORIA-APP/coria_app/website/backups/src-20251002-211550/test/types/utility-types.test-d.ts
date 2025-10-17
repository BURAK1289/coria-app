/**
 * Type-only tests for utility type inference validation
 * These tests ensure that utility types work correctly and infer types properly
 */

import { expectType, expectError, expectAssignable, expectNotAssignable } from 'tsd'
import type {
  Optional,
  RequiredFields,
  DeepPartial,
  DebouncedFunction,
  Language,
  LocalizedContent,
  ApiResponse,
  PaginatedResponse,
  NextPageProps,
  LocalizedPageProps,
  BlogPageProps,
  FeaturePageProps,
  DynamicPageProps,
  MetadataGenerationProps,
  LocalizedMetadataProps
} from '../../types/global'

// Test utility type inference
describe('Utility type inference tests', () => {
  interface TestInterface {
    id: string
    name: string
    email?: string
    age: number
    isActive: boolean
    metadata?: {
      tags: string[]
      score: number
    }
  }

  test('Optional utility should correctly infer optional fields', () => {
    type OptionalName = Optional<TestInterface, 'name'>
    
    // Should make 'name' optional while keeping others as they are
    expectType<OptionalName>({
      id: '1',
      age: 25,
      isActive: true
    })

    expectType<OptionalName>({
      id: '1',
      name: 'John',
      age: 25,
      isActive: true
    })

    // Should still require non-optional fields
    expectError<OptionalName>({
      name: 'John',
      age: 25
      // Missing required fields: id, isActive
    } as any)
  })

  test('Optional utility should work with multiple fields', () => {
    type OptionalMultiple = Optional<TestInterface, 'name' | 'age'>
    
    expectType<OptionalMultiple>({
      id: '1',
      isActive: true
    })

    expectType<OptionalMultiple>({
      id: '1',
      name: 'John',
      isActive: true
    })

    expectType<OptionalMultiple>({
      id: '1',
      age: 25,
      isActive: true
    })
  })

  test('RequiredFields utility should correctly infer required fields', () => {
    type RequiredEmail = RequiredFields<TestInterface, 'email'>
    
    // Should make 'email' required
    expectType<RequiredEmail>({
      id: '1',
      name: 'John',
      email: 'john@example.com',
      age: 25,
      isActive: true
    })

    expectError<RequiredEmail>({
      id: '1',
      name: 'John',
      age: 25,
      isActive: true
      // Missing required field: email
    } as any)
  })

  test('RequiredFields utility should work with nested optional fields', () => {
    type RequiredMetadata = RequiredFields<TestInterface, 'metadata'>
    
    expectType<RequiredMetadata>({
      id: '1',
      name: 'John',
      age: 25,
      isActive: true,
      metadata: {
        tags: ['test'],
        score: 95
      }
    })

    expectError<RequiredMetadata>({
      id: '1',
      name: 'John',
      age: 25,
      isActive: true
      // Missing required field: metadata
    } as any)
  })

  test('DeepPartial utility should make all fields optional recursively', () => {
    type PartialTest = DeepPartial<TestInterface>
    
    expectType<PartialTest>({})
    expectType<PartialTest>({ id: '1' })
    expectType<PartialTest>({ 
      metadata: {} as any // DeepPartial should make nested properties optional
    })
    expectType<PartialTest>({ 
      metadata: { 
        tags: ['test'] 
      } as any
    })
    expectType<PartialTest>({ 
      metadata: { 
        score: 95 
      } as any
    })
  })
})

// Test function utility types
describe('Function utility type tests', () => {
  test('DebouncedFunction should properly type debounced functions', () => {
    type TestFunction = (a: string, b: number) => void
    type DebouncedTest = DebouncedFunction<TestFunction>
    
    const debouncedFn: DebouncedTest = (() => {}) as any
    
    // Should accept same parameters as original function
    expectType<void>(debouncedFn('test', 123))
    
    // Should have cancel method
    expectType<() => void>(debouncedFn.cancel)
    
    // Should not return the original function's return value
    expectNotAssignable<TestFunction>(debouncedFn)
  })

  test('should infer correct parameter types for debounced functions', () => {
    type AsyncFunction = (id: string, options?: { timeout: number }) => Promise<string>
    type DebouncedAsync = DebouncedFunction<AsyncFunction>
    
    const debouncedAsync: DebouncedAsync = (() => {}) as any
    
    // Should accept correct parameters
    expectType<void>(debouncedAsync('test-id'))
    expectType<void>(debouncedAsync('test-id', { timeout: 5000 }))
    
    // Should reject incorrect parameters
    expectError(debouncedAsync(123 as any))
    expectError(debouncedAsync('test-id', { invalid: true } as any))
  })
})

// Test complex type inference
describe('Complex type inference tests', () => {
  test('should correctly infer nested generic types', () => {
    type NestedApiResponse<T> = ApiResponse<{
      items: T[]
      meta: {
        total: number
        page: number
      }
    }>
    
    type BlogPostResponse = NestedApiResponse<{ title: string; slug: string }>
    
    expectType<BlogPostResponse>({
      data: {
        items: [
          { title: 'Test', slug: 'test' }
        ],
        meta: {
          total: 1,
          page: 1
        }
      },
      success: true
    })

    // Should enforce nested type constraints
    expectError<BlogPostResponse>({
      data: {
        items: [
          // @ts-expect-error - wrong item type
          { title: 123, slug: 'test' }
        ],
        meta: {
          total: 1,
          page: 1
        }
      },
      success: true
    })
  })

  test('should correctly infer conditional types', () => {
    type ExtractArrayType<T> = T extends (infer U)[] ? U : never
    
    type StringArrayType = ExtractArrayType<string[]>
    type NumberArrayType = ExtractArrayType<number[]>
    type NonArrayType = ExtractArrayType<string>
    
    expectType<string>({} as StringArrayType)
    expectType<number>({} as NumberArrayType)
    expectType<never>({} as NonArrayType)
  })

  test('should correctly infer mapped types', () => {
    type Nullable<T> = {
      [K in keyof T]: T[K] | null
    }
    
    interface TestInterface {
      name: string
      age: number
      isActive: boolean
    }
    
    type NullableTest = Nullable<TestInterface>
    
    expectType<NullableTest>({
      name: 'John',
      age: null,
      isActive: true
    })

    expectType<NullableTest>({
      name: null,
      age: null,
      isActive: null
    })

    // Should still require all fields
    expectError<NullableTest>({
      name: 'John',
      age: 25
      // Missing required field: isActive
    } as any)
  })
})

// Test Next.js specific type inference
describe('Next.js type inference tests', () => {
  test('should correctly infer page props types', () => {
    type ExtractParams<T> = T extends NextPageProps<infer P> ? P : never
    
    type LocalizedParams = ExtractParams<LocalizedPageProps>
    type BlogParams = ExtractParams<BlogPageProps>
    type FeatureParams = ExtractParams<FeaturePageProps>
    
    expectType<{ locale: string }>({} as LocalizedParams)
    expectType<{ locale: string; slug: string }>({} as BlogParams)
    expectType<{ locale: string; category?: string; feature?: string }>({} as FeatureParams)
  })

  test('should correctly infer dynamic page props', () => {
    type CustomPageProps = DynamicPageProps<{ id: string; category: string }>
    type ExtractCustomParams = CustomPageProps extends NextPageProps<infer P> ? P : never
    
    expectType<{ locale: string; id: string; category: string }>({} as ExtractCustomParams)
  })

  test('should correctly infer metadata generation props', () => {
    type ExtractMetadataParams<T> = T extends MetadataGenerationProps<infer P> ? P : never
    
    type LocalizedMetadataParams = ExtractMetadataParams<LocalizedMetadataProps>
    
    expectType<{ locale: string }>({} as LocalizedMetadataParams)
  })
})

// Test language and localization type inference
describe('Language and localization type inference tests', () => {
  test('should correctly infer language constraints', () => {
    type IsValidLanguage<T> = T extends Language ? true : false
    
    type EnglishValid = IsValidLanguage<'en'>
    type TurkishValid = IsValidLanguage<'tr'>
    type GermanValid = IsValidLanguage<'de'>
    type FrenchValid = IsValidLanguage<'fr'>
    type SpanishValid = IsValidLanguage<'es'>
    
    expectType<true>({} as EnglishValid)
    expectType<true>({} as TurkishValid)
    expectType<true>({} as GermanValid)
    expectType<true>({} as FrenchValid)
    expectType<false>({} as SpanishValid)
  })

  test('should correctly infer localized content types', () => {
    type ExtractLocalizedValue<T> = T extends LocalizedContent ? T[Language] : never
    
    type LocalizedString = ExtractLocalizedValue<LocalizedContent>
    
    expectType<string>({} as LocalizedString)
  })

  test('should correctly infer generic localized content', () => {
    type LocalizedArray<T> = {
      [K in Language]: T[]
    }
    
    type LocalizedStringArray = LocalizedArray<string>
    type LocalizedNumberArray = LocalizedArray<number>
    
    expectType<LocalizedStringArray>({
      tr: ['test'],
      en: ['test'],
      de: ['test'],
      fr: ['test']
    })

    expectType<LocalizedNumberArray>({
      tr: [1, 2, 3],
      en: [1, 2, 3],
      de: [1, 2, 3],
      fr: [1, 2, 3]
    })

    // Should enforce array type constraints
    expectError<LocalizedStringArray>({
      tr: ['test'],
      en: ['test'],
      de: ['test'],
      // @ts-expect-error - wrong array type
      fr: [123]
    })
  })
})

// Test API response type inference
describe('API response type inference tests', () => {
  test('should correctly infer paginated response types', () => {
    type ExtractPaginatedData<T> = T extends PaginatedResponse<infer U> ? U : never
    
    type BlogPostData = ExtractPaginatedData<PaginatedResponse<{ title: string }>>
    
    expectType<{ title: string }>({ title: 'test' } as BlogPostData)
  })

  test('should correctly infer nested API response types', () => {
    type NestedResponse<T> = ApiResponse<{
      results: PaginatedResponse<T>
      metadata: {
        timestamp: string
        version: string
      }
    }>
    
    type BlogNestedResponse = NestedResponse<{ title: string; content: string }>
    
    expectType<BlogNestedResponse>({
      data: {
        results: {
          data: [{ title: 'Test', content: 'Content' }],
          success: true,
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            hasNext: false,
            hasPrev: false
          }
        },
        metadata: {
          timestamp: '2023-01-01',
          version: '1.0.0'
        }
      },
      success: true
    })
  })
})

// Test type guard inference
describe('Type guard inference tests', () => {
  test('should correctly infer type guard return types', () => {
    type IsString<T> = T extends string ? true : false
    type IsNumber<T> = T extends number ? true : false
    type IsArray<T> = T extends any[] ? true : false
    
    type StringCheck = IsString<'test'>
    type NumberCheck = IsNumber<123>
    type ArrayCheck = IsArray<string[]>
    type ObjectCheck = IsString<{}>
    
    expectType<true>({} as StringCheck)
    expectType<true>({} as NumberCheck)
    expectType<true>({} as ArrayCheck)
    expectType<false>({} as ObjectCheck)
  })

  test('should correctly infer union type guards', () => {
    type ExtractUnionMember<T, U> = T extends U ? T : never
    
    type StringOrNumber = string | number | boolean
    type OnlyString = ExtractUnionMember<StringOrNumber, string>
    type OnlyNumber = ExtractUnionMember<StringOrNumber, number>
    type OnlyObject = ExtractUnionMember<StringOrNumber, object>
    
    expectType<string>({} as OnlyString)
    expectType<number>({} as OnlyNumber)
    expectType<never>({} as OnlyObject)
  })
})