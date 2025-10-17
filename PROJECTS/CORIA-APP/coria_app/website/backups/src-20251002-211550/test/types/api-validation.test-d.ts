/**
 * Type-only tests for API response type validation
 * These tests ensure that API response types are correctly structured and validated
 */

import { expectType, expectError, expectAssignable, expectNotAssignable } from 'tsd'
import type {
  ApiResponse,
  PaginatedResponse,
  ApiError,
  CMSContent,
  BlogPost,
  BlogCategory,
  Author,
  Feature,
  FeatureCategory,
  DataSource,
  Page,
  PageSection,
  SEOMetadata,
  ImageAsset,
  VideoAsset,
  AnalyticsEvent,
  ConversionEvent,
  PerformanceMetric,
  WebVitalsMetric,
  ErrorReport,
  ContentFilter,
  SearchResult,
  SearchResponse,
  NewsletterSubscription,
  NewsletterCampaign,
  ContactSubmission,
  SupportTicket,
  ABTest,
  ABTestVariant,
  ABTestMetric,
  ABTestResults,
  PricingPlan,
  PriceInfo,
  Currency,
  Testimonial,
  SocialProof,
  FAQ,
  NavigationItem,
  FooterSection,
  SocialLink,
  ContentWorkflow,
  WorkflowStep,
  WorkflowAction,
  ApiMethod,
  ApiRequestConfig,
  ApiEndpoint,
  ApiParameter,
  ApiResponseSpec,
  LocalizedString,
  LocalizedRichText,
  LocalizedSEO,
  Locale
} from '../../types/api'

// Test basic API response types
describe('Basic API response type tests', () => {
  test('ApiResponse should accept valid response structure', () => {
    expectType<ApiResponse<string>>({
      data: 'test data',
      success: true
    })

    expectType<ApiResponse<string>>({
      data: 'test data',
      success: true,
      message: 'Success message',
      error: 'Error message',
      timestamp: '2023-01-01T00:00:00Z'
    })
  })

  test('ApiResponse should enforce data type constraints', () => {
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

  test('PaginatedResponse should extend ApiResponse', () => {
    expectAssignable<ApiResponse<any[]>>({} as PaginatedResponse<any>)
  })

  test('PaginatedResponse should have proper pagination structure', () => {
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

    // Test that incomplete pagination object is rejected
    expectError<PaginatedResponse<BlogPost>>({
      data: [] as BlogPost[],
      success: true,
      pagination: {
        page: 1,
        limit: 10
        // Missing: total, totalPages, hasNext, hasPrev
      } as any
    })
  })

  test('ApiError should have proper error structure', () => {
    expectType<ApiError>({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      timestamp: '2023-01-01T00:00:00Z'
    })

    expectType<ApiError>({
      code: 'NOT_FOUND',
      message: 'Resource not found',
      details: { resourceId: '123' },
      timestamp: '2023-01-01T00:00:00Z'
    })

    // Test that ApiError without required code field is rejected
    expectError<ApiError>({
      message: 'Error message',
      timestamp: '2023-01-01T00:00:00Z'
      // Missing required 'code' field
    } as any)
  })
})

// Test CMS content types
describe('CMS content type tests', () => {
  test('CMSContent should have proper base structure', () => {
    expectType<CMSContent>({
      id: '1',
      slug: 'test-content',
      title: {} as LocalizedString,
      content: {} as LocalizedRichText,
      publishedAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      status: 'published',
      seo: {} as LocalizedSEO
    })

    expectType<CMSContent>({
      id: '1',
      slug: 'test-content',
      title: {} as LocalizedString,
      content: {} as LocalizedRichText,
      publishedAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      status: 'draft',
      author: {} as Author,
      seo: {} as LocalizedSEO
    })
  })

  test('CMSContent should enforce status constraints', () => {
    expectType<CMSContent>({ status: 'draft' } as CMSContent)
    expectType<CMSContent>({ status: 'published' } as CMSContent)
    expectType<CMSContent>({ status: 'archived' } as CMSContent)

    // Test that invalid status is rejected
    expectError<CMSContent>({
      status: 'invalid' as any
    } as CMSContent)
  })

  test('BlogPost should extend CMSContent', () => {
    expectAssignable<CMSContent>({} as BlogPost)
  })

  test('BlogPost should have additional required fields', () => {
    expectType<BlogPost>({
      id: '1',
      slug: 'test-post',
      title: {} as LocalizedString,
      content: {} as LocalizedRichText,
      publishedAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      status: 'published',
      seo: {} as LocalizedSEO,
      excerpt: {} as LocalizedString,
      category: {} as BlogCategory,
      tags: {} as any,
      featuredImage: {} as ImageAsset,
      readingTime: {} as any
    })

    // Test that BlogPost without specific fields is rejected
    expectError<BlogPost>({
      id: '1',
      slug: 'test-post',
      title: {} as LocalizedString,
      content: {} as LocalizedRichText,
      publishedAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      status: 'published',
      seo: {} as LocalizedSEO
      // Missing: excerpt, category, tags, featuredImage, readingTime
    } as any)
  })

  test('Feature should extend CMSContent', () => {
    expectAssignable<CMSContent>({} as Feature)
  })

  test('Feature should have proper structure', () => {
    expectType<Feature>({
      id: '1',
      slug: 'test-feature',
      title: {} as LocalizedString,
      content: {} as LocalizedRichText,
      publishedAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      status: 'published',
      seo: {} as LocalizedSEO,
      name: {} as LocalizedString,
      description: {} as LocalizedString,
      icon: 'test-icon',
      screenshots: [] as ImageAsset[],
      benefits: {} as any,
      category: {} as FeatureCategory,
      order: 1,
      isActive: true,
      isPremium: false
    })
  })
})

// Test media asset types
describe('Media asset type tests', () => {
  test('ImageAsset should have proper structure', () => {
    expectType<ImageAsset>({
      id: '1',
      src: '/image.jpg',
      alt: {} as LocalizedString,
      width: 800,
      height: 600,
      format: 'jpg',
      size: 1024000
    })

    expectType<ImageAsset>({
      id: '1',
      src: '/image.webp',
      alt: {} as LocalizedString,
      width: 800,
      height: 600,
      format: 'webp',
      size: 512000,
      blurDataURL: 'data:image/jpeg;base64,/9j/4AAQ...',
      sizes: '(max-width: 768px) 100vw, 50vw',
      caption: {} as LocalizedString,
      credit: 'Photo by John Doe',
      tags: ['nature', 'landscape']
    })
  })

  test('ImageAsset should enforce format constraints', () => {
    expectType<ImageAsset>({ format: 'jpg' } as ImageAsset)
    expectType<ImageAsset>({ format: 'png' } as ImageAsset)
    expectType<ImageAsset>({ format: 'webp' } as ImageAsset)
    expectType<ImageAsset>({ format: 'svg' } as ImageAsset)
    expectType<ImageAsset>({ format: 'gif' } as ImageAsset)

    // Test that invalid format is rejected
    expectError<ImageAsset>({
      format: 'bmp' as any
    } as ImageAsset)
  })

  test('VideoAsset should have proper structure', () => {
    expectType<VideoAsset>({
      id: '1',
      src: '/video.mp4',
      title: {} as LocalizedString,
      duration: 120,
      thumbnail: {} as ImageAsset,
      format: 'mp4',
      size: 10485760,
      quality: '1080p'
    })

    expectType<VideoAsset>({
      id: '1',
      src: '/video.webm',
      title: {} as LocalizedString,
      description: {} as LocalizedString,
      duration: 60,
      thumbnail: {} as ImageAsset,
      format: 'webm',
      size: 5242880,
      quality: '720p'
    })
  })

  test('VideoAsset should enforce format and quality constraints', () => {
    expectType<VideoAsset>({ format: 'mp4' } as VideoAsset)
    expectType<VideoAsset>({ format: 'webm' } as VideoAsset)
    expectType<VideoAsset>({ format: 'mov' } as VideoAsset)

    expectType<VideoAsset>({ quality: '720p' } as VideoAsset)
    expectType<VideoAsset>({ quality: '1080p' } as VideoAsset)
    expectType<VideoAsset>({ quality: '4k' } as VideoAsset)

    // Test that invalid format is rejected
    expectError<VideoAsset>({
      format: 'avi' as any
    } as VideoAsset)

    // Test that invalid quality is rejected
    expectError<VideoAsset>({
      quality: '480p' as any
    } as VideoAsset)
  })
})

// Test analytics and performance types
describe('Analytics and performance type tests', () => {
  test('AnalyticsEvent should have proper structure', () => {
    expectType<AnalyticsEvent>({
      name: 'page_view',
      parameters: { page: '/home', user_id: '123' },
      timestamp: Date.now(),
      sessionId: 'session-123',
      locale: 'en' as Locale,
      userAgent: 'Mozilla/5.0...',
      page: '/home'
    })

    expectType<AnalyticsEvent>({
      name: 'button_click',
      parameters: { button_id: 'cta-button', section: 'hero' },
      timestamp: Date.now(),
      userId: 'user-456',
      sessionId: 'session-123',
      locale: 'tr' as Locale,
      userAgent: 'Mozilla/5.0...',
      referrer: 'https://google.com',
      page: '/features'
    })
  })

  test('ConversionEvent should extend AnalyticsEvent', () => {
    expectAssignable<AnalyticsEvent>({} as ConversionEvent)
  })

  test('ConversionEvent should have additional required fields', () => {
    expectType<ConversionEvent>({
      name: 'conversion',
      parameters: {},
      timestamp: Date.now(),
      sessionId: 'session-123',
      locale: 'en' as Locale,
      userAgent: 'Mozilla/5.0...',
      page: '/signup',
      conversionType: 'signup'
    })

    expectType<ConversionEvent>({
      name: 'purchase',
      parameters: {},
      timestamp: Date.now(),
      sessionId: 'session-123',
      locale: 'en' as Locale,
      userAgent: 'Mozilla/5.0...',
      page: '/checkout',
      conversionType: 'purchase',
      value: 29.99,
      currency: 'USD',
      funnel: 'pricing-page',
      step: 3
    })
  })

  test('ConversionEvent should enforce conversionType constraints', () => {
    expectType<ConversionEvent>({ conversionType: 'download' } as ConversionEvent)
    expectType<ConversionEvent>({ conversionType: 'signup' } as ConversionEvent)
    expectType<ConversionEvent>({ conversionType: 'contact' } as ConversionEvent)
    expectType<ConversionEvent>({ conversionType: 'subscription' } as ConversionEvent)
    expectType<ConversionEvent>({ conversionType: 'purchase' } as ConversionEvent)

    // Test that invalid conversionType is rejected
    expectError<ConversionEvent>({
      conversionType: 'invalid' as any
    } as ConversionEvent)
  })

  test('PerformanceMetric should have proper structure', () => {
    expectType<PerformanceMetric>({
      name: 'page_load_time',
      value: 1500,
      unit: 'ms',
      timestamp: Date.now(),
      url: 'https://example.com',
      userAgent: 'Mozilla/5.0...',
      locale: 'en' as Locale
    })

    expectType<PerformanceMetric>({
      name: 'bundle_size',
      value: 2048,
      unit: 'bytes',
      timestamp: Date.now(),
      url: 'https://example.com',
      userAgent: 'Mozilla/5.0...',
      connectionType: '4g',
      deviceType: 'mobile',
      locale: 'tr' as Locale
    })
  })

  test('PerformanceMetric should enforce unit constraints', () => {
    expectType<PerformanceMetric>({ unit: 'ms' } as PerformanceMetric)
    expectType<PerformanceMetric>({ unit: 'bytes' } as PerformanceMetric)
    expectType<PerformanceMetric>({ unit: 'score' } as PerformanceMetric)
    expectType<PerformanceMetric>({ unit: 'count' } as PerformanceMetric)
    expectType<PerformanceMetric>({ unit: 'percentage' } as PerformanceMetric)

    // Test that invalid unit is rejected
    expectError<PerformanceMetric>({
      unit: 'invalid' as any
    } as PerformanceMetric)
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
      userAgent: 'Mozilla/5.0...',
      locale: 'en' as Locale,
      id: 'lcp-123',
      delta: 100,
      entries: [],
      navigationType: 'navigate',
      rating: 'needs-improvement'
    })

    // Test that WebVitalsMetric without specific fields is rejected
    expectError<WebVitalsMetric>({
      name: 'LCP',
      value: 2500,
      unit: 'ms',
      timestamp: Date.now(),
      url: 'https://example.com',
      userAgent: 'Mozilla/5.0...',
      locale: 'en' as Locale
      // Missing: id, delta, entries, navigationType, rating
    } as any)
  })

  test('WebVitalsMetric should enforce rating constraints', () => {
    expectType<WebVitalsMetric>({ rating: 'good' } as WebVitalsMetric)
    expectType<WebVitalsMetric>({ rating: 'needs-improvement' } as WebVitalsMetric)
    expectType<WebVitalsMetric>({ rating: 'poor' } as WebVitalsMetric)

    // Test that invalid rating is rejected
    expectError<WebVitalsMetric>({
      rating: 'excellent' as any
    } as WebVitalsMetric)
  })
})

// Test search and filtering types
describe('Search and filtering type tests', () => {
  test('ContentFilter should have proper structure', () => {
    expectType<ContentFilter>({
      locale: 'en' as Locale,
      status: 'published',
      category: 'sustainability',
      tags: ['eco-friendly', 'green'],
      author: 'john-doe',
      dateFrom: '2023-01-01',
      dateTo: '2023-12-31',
      search: 'sustainability',
      limit: 10,
      offset: 0,
      sortBy: 'publishedAt',
      sortOrder: 'desc'
    })

    expectType<ContentFilter>({})
  })

  test('ContentFilter should enforce constraint values', () => {
    expectType<ContentFilter>({ status: 'draft' })
    expectType<ContentFilter>({ status: 'published' })
    expectType<ContentFilter>({ status: 'archived' })

    expectType<ContentFilter>({ sortBy: 'publishedAt' })
    expectType<ContentFilter>({ sortBy: 'updatedAt' })
    expectType<ContentFilter>({ sortBy: 'title' })
    expectType<ContentFilter>({ sortBy: 'order' })
    expectType<ContentFilter>({ sortBy: 'popularity' })

    expectType<ContentFilter>({ sortOrder: 'asc' })
    expectType<ContentFilter>({ sortOrder: 'desc' })

    expectError<ContentFilter>({
      // @ts-expect-error - invalid status
      status: 'invalid'
    })

    expectError<ContentFilter>({
      // @ts-expect-error - invalid sortBy
      sortBy: 'invalid'
    })

    expectError<ContentFilter>({
      // @ts-expect-error - invalid sortOrder
      sortOrder: 'invalid'
    })
  })

  test('SearchResult should have proper structure', () => {
    expectType<SearchResult<BlogPost>>({
      item: {} as BlogPost,
      score: 0.95
    })

    expectType<SearchResult<BlogPost>>({
      item: {} as BlogPost,
      score: 0.85,
      highlights: {
        title: ['<mark>sustainability</mark>'],
        content: ['Learn about <mark>sustainability</mark> practices']
      }
    })
  })

  test('SearchResponse should extend PaginatedResponse', () => {
    expectAssignable<PaginatedResponse<SearchResult<any>>>({} as SearchResponse<any>)
  })

  test('SearchResponse should have additional search fields', () => {
    expectType<SearchResponse<BlogPost>>({
      data: [] as SearchResult<BlogPost>[],
      success: true,
      pagination: {
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrev: false
      },
      query: 'sustainability',
      totalResults: 100,
      searchTime: 25
    })

    expectType<SearchResponse<BlogPost>>({
      data: [] as SearchResult<BlogPost>[],
      success: true,
      pagination: {
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
        hasNext: true,
        hasPrev: false
      },
      query: 'sustainability',
      totalResults: 100,
      searchTime: 25,
      suggestions: ['sustainable living', 'eco-friendly'],
      facets: {
        category: [
          { value: 'sustainability', count: 50 },
          { value: 'health', count: 30 }
        ]
      }
    })
  })
})

// Test API configuration types
describe('API configuration type tests', () => {
  test('ApiMethod should enforce valid HTTP methods', () => {
    expectType<ApiMethod>('GET')
    expectType<ApiMethod>('POST')
    expectType<ApiMethod>('PUT')
    expectType<ApiMethod>('PATCH')
    expectType<ApiMethod>('DELETE')

    expectError<ApiMethod>('INVALID' as any)
  })

  test('ApiRequestConfig should have proper structure', () => {
    expectType<ApiRequestConfig>({
      method: 'GET',
      url: '/api/posts'
    })

    expectType<ApiRequestConfig>({
      method: 'POST',
      url: '/api/posts',
      headers: { 'Content-Type': 'application/json' },
      params: { page: 1, limit: 10 },
      data: { title: 'New Post' },
      timeout: 5000,
      retries: 3
    })
  })

  test('ApiEndpoint should have proper structure', () => {
    expectType<ApiEndpoint>({
      path: '/api/posts',
      method: 'GET',
      description: 'Get all blog posts',
      responses: [
        {
          status: 200,
          description: 'Success',
          example: { data: [], success: true }
        }
      ]
    })

    expectType<ApiEndpoint>({
      path: '/api/posts',
      method: 'POST',
      description: 'Create a new blog post',
      parameters: [
        {
          name: 'title',
          type: 'string',
          required: true,
          description: 'Post title',
          example: 'My Blog Post'
        }
      ],
      responses: [
        {
          status: 201,
          description: 'Created',
          schema: { type: 'object' }
        },
        {
          status: 400,
          description: 'Bad Request'
        }
      ]
    })
  })

  test('ApiParameter should enforce type constraints', () => {
    expectType<ApiParameter>({ type: 'string' } as ApiParameter)
    expectType<ApiParameter>({ type: 'number' } as ApiParameter)
    expectType<ApiParameter>({ type: 'boolean' } as ApiParameter)
    expectType<ApiParameter>({ type: 'array' } as ApiParameter)
    expectType<ApiParameter>({ type: 'object' } as ApiParameter)

    // Test that invalid type is rejected
    expectError<ApiParameter>({
      type: 'invalid' as any
    } as ApiParameter)
  })
})