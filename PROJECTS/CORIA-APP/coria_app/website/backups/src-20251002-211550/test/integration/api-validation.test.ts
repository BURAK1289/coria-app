/**
 * Integration tests for API response validation
 * These tests ensure that API responses are properly validated at runtime
 */

import { describe, it, expect, vi } from 'vitest'
import {
  validateApiResponse,
  isSuccessfulApiResponse,
  isErrorApiResponse,
  isBlogPost,
  isFeature,
  isAnalyticsEvent,
  isPerformanceMetric
} from '../../lib/type-guards'

// Mock fetch function for testing
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API Response Validation Integration Tests', () => {
  describe('Blog API validation', () => {
    const mockBlogPost = {
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
      publishedAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      status: 'published',
      author: {
        id: '1',
        name: 'John Doe',
        bio: {
          tr: 'Yazar biyografisi',
          en: 'Author biography',
          de: 'Autor Biographie',
          fr: 'Biographie de l\'auteur'
        },
        avatar: {
          src: '/avatar.jpg',
          alt: {
            tr: 'Yazar avatarı',
            en: 'Author avatar',
            de: 'Autor Avatar',
            fr: 'Avatar de l\'auteur'
          },
          width: 100,
          height: 100
        }
      },
      category: {
        id: '1',
        name: {
          tr: 'Sürdürülebilirlik',
          en: 'Sustainability',
          de: 'Nachhaltigkeit',
          fr: 'Durabilité'
        },
        slug: {
          tr: 'surdurulebilirlik',
          en: 'sustainability',
          de: 'nachhaltigkeit',
          fr: 'durabilite'
        },
        description: {
          tr: 'Sürdürülebilirlik kategorisi',
          en: 'Sustainability category',
          de: 'Nachhaltigkeitskategorie',
          fr: 'Catégorie durabilité'
        }
      },
      tags: {
        tr: ['etiket1', 'etiket2'],
        en: ['tag1', 'tag2'],
        de: ['tag1', 'tag2'],
        fr: ['tag1', 'tag2']
      },
      featuredImage: {
        id: '1',
        src: '/featured.jpg',
        alt: {
          tr: 'Öne çıkan görsel',
          en: 'Featured image',
          de: 'Hervorgehobenes Bild',
          fr: 'Image en vedette'
        },
        width: 1200,
        height: 630,
        format: 'jpg' as const,
        size: 1024000
      },
      readingTime: {
        tr: 5,
        en: 5,
        de: 5,
        fr: 5
      },
      seo: {
        title: {
          tr: 'SEO Başlık',
          en: 'SEO Title',
          de: 'SEO Titel',
          fr: 'Titre SEO'
        },
        description: {
          tr: 'SEO açıklama',
          en: 'SEO description',
          de: 'SEO Beschreibung',
          fr: 'Description SEO'
        },
        keywords: {
          tr: ['anahtar', 'kelime'],
          en: ['key', 'word'],
          de: ['schlüssel', 'wort'],
          fr: ['mot', 'clé']
        }
      }
    }

    it('should validate successful blog post API response', async () => {
      const mockResponse = {
        data: mockBlogPost,
        success: true,
        message: 'Blog post retrieved successfully'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const response = await fetch('/api/blog/test-post')
      const data = await response.json()

      expect(isSuccessfulApiResponse(data)).toBe(true)
      expect(validateApiResponse(data, isBlogPost)).toBe(true)
    })

    it('should validate error blog post API response', async () => {
      const mockErrorResponse = {
        data: null,
        success: false,
        error: 'Blog post not found'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => mockErrorResponse
      })

      const response = await fetch('/api/blog/non-existent')
      const data = await response.json()

      expect(isErrorApiResponse(data)).toBe(true)
      expect(data.error).toBe('Blog post not found')
    })

    it('should reject invalid blog post data', async () => {
      const invalidBlogPost = {
        ...mockBlogPost,
        title: 'Invalid title format', // Should be localized content
        author: 'Invalid author format' // Should be author object
      }

      const mockInvalidResponse = {
        data: invalidBlogPost,
        success: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInvalidResponse
      })

      const response = await fetch('/api/blog/invalid')
      const data = await response.json()

      expect(isSuccessfulApiResponse(data)).toBe(true)
      expect(validateApiResponse(data, isBlogPost)).toBe(false)
    })

    it('should validate paginated blog posts response', async () => {
      const mockPaginatedResponse = {
        data: [mockBlogPost],
        success: true,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPaginatedResponse
      })

      const response = await fetch('/api/blog')
      const data = await response.json()

      expect(isSuccessfulApiResponse(data)).toBe(true)
      expect('pagination' in data).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data.every((post: unknown) => isBlogPost(post))).toBe(true)
    })
  })

  describe('Features API validation', () => {
    const mockFeature = {
      id: '1',
      slug: 'barcode-scanning',
      title: {
        tr: 'Barkod Tarama',
        en: 'Barcode Scanning',
        de: 'Barcode-Scannen',
        fr: 'Scan de Code-barres'
      },
      content: {
        tr: 'Barkod tarama içeriği',
        en: 'Barcode scanning content',
        de: 'Barcode-Scan-Inhalt',
        fr: 'Contenu de scan de code-barres'
      },
      publishedAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      status: 'published',
      seo: {
        title: {
          tr: 'Barkod Tarama SEO',
          en: 'Barcode Scanning SEO',
          de: 'Barcode-Scannen SEO',
          fr: 'SEO Scan de Code-barres'
        },
        description: {
          tr: 'SEO açıklama',
          en: 'SEO description',
          de: 'SEO Beschreibung',
          fr: 'Description SEO'
        },
        keywords: {
          tr: ['barkod', 'tarama'],
          en: ['barcode', 'scanning'],
          de: ['barcode', 'scannen'],
          fr: ['code-barres', 'scan']
        }
      },
      name: {
        tr: 'Barkod Tarama',
        en: 'Barcode Scanning',
        de: 'Barcode-Scannen',
        fr: 'Scan de Code-barres'
      },
      description: {
        tr: 'Ürün barkodlarını tarayın',
        en: 'Scan product barcodes',
        de: 'Produkt-Barcodes scannen',
        fr: 'Scanner les codes-barres des produits'
      },
      icon: 'barcode-icon',
      screenshots: [
        {
          id: '1',
          src: '/screenshot1.jpg',
          alt: {
            tr: 'Ekran görüntüsü 1',
            en: 'Screenshot 1',
            de: 'Screenshot 1',
            fr: 'Capture d\'écran 1'
          },
          width: 375,
          height: 812,
          format: 'jpg' as const,
          size: 512000
        }
      ],
      benefits: {
        tr: ['Hızlı tarama', 'Doğru sonuçlar'],
        en: ['Fast scanning', 'Accurate results'],
        de: ['Schnelles Scannen', 'Genaue Ergebnisse'],
        fr: ['Scan rapide', 'Résultats précis']
      },
      category: {
        id: '1',
        name: {
          tr: 'Tarama',
          en: 'Scanning',
          de: 'Scannen',
          fr: 'Scan'
        },
        slug: {
          tr: 'tarama',
          en: 'scanning',
          de: 'scannen',
          fr: 'scan'
        },
        description: {
          tr: 'Tarama özellikleri',
          en: 'Scanning features',
          de: 'Scan-Funktionen',
          fr: 'Fonctionnalités de scan'
        },
        icon: 'scan-icon',
        color: '#007bff',
        featureCount: 3,
        order: 1
      },
      order: 1,
      isActive: true,
      isPremium: false
    }

    it('should validate successful feature API response', async () => {
      const mockFeatureResponse = {
        data: mockFeature,
        success: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockFeatureResponse
      })

      const response = await fetch('/api/features/barcode-scanning')
      const data = await response.json()

      expect(isSuccessfulApiResponse(data)).toBe(true)
      expect(validateApiResponse(data, isFeature)).toBe(true)
    })

    it('should reject invalid feature data', async () => {
      const invalidFeature = {
        ...mockFeature,
        benefits: 'Invalid benefits format', // Should be localized array
        category: 'Invalid category format' // Should be category object
      }

      const mockInvalidFeatureResponse = {
        data: invalidFeature,
        success: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInvalidFeatureResponse
      })

      const response = await fetch('/api/features/invalid')
      const data = await response.json()

      expect(isSuccessfulApiResponse(data)).toBe(true)
      expect(validateApiResponse(data, isFeature)).toBe(false)
    })
  })

  describe('Analytics API validation', () => {
    const mockAnalyticsEvent = {
      name: 'page_view',
      parameters: {
        page: '/home',
        user_id: 'user-123',
        session_duration: 300
      },
      timestamp: Date.now(),
      sessionId: 'session-456',
      locale: 'en',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      page: '/home'
    }

    it('should validate analytics event submission', async () => {
      const mockAnalyticsResponse = {
        data: { eventId: 'event-123' },
        success: true,
        message: 'Event tracked successfully'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalyticsResponse
      })

      // Validate the event before sending
      expect(isAnalyticsEvent(mockAnalyticsEvent)).toBe(true)

      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockAnalyticsEvent)
      })
      const data = await response.json()

      expect(isSuccessfulApiResponse(data)).toBe(true)
      expect(data.data.eventId).toBe('event-123')
    })

    it('should reject invalid analytics events', async () => {
      const invalidEvent = {
        name: 123, // Should be string
        parameters: 'invalid', // Should be object
        timestamp: 'invalid', // Should be number
        sessionId: null // Should be string
      }

      expect(isAnalyticsEvent(invalidEvent)).toBe(false)
    })
  })

  describe('Performance metrics API validation', () => {
    const mockPerformanceMetric = {
      name: 'page_load_time',
      value: 1500,
      unit: 'ms' as const,
      timestamp: Date.now(),
      url: 'https://example.com/home',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      locale: 'en' as const
    }

    it('should validate performance metric submission', async () => {
      const mockPerformanceResponse = {
        data: { metricId: 'metric-123' },
        success: true
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPerformanceResponse
      })

      // Validate the metric before sending
      expect(isPerformanceMetric(mockPerformanceMetric)).toBe(true)

      const response = await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockPerformanceMetric)
      })
      const data = await response.json()

      expect(isSuccessfulApiResponse(data)).toBe(true)
      expect(data.data.metricId).toBe('metric-123')
    })

    it('should reject invalid performance metrics', async () => {
      const invalidMetric = {
        name: 'page_load_time',
        value: 'invalid', // Should be number
        unit: 'invalid', // Should be valid unit
        timestamp: Date.now(),
        url: 'https://example.com'
      }

      expect(isPerformanceMetric(invalidMetric)).toBe(false)
    })
  })

  describe('Error handling validation', () => {
    it('should handle network errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error occurred'))

      try {
        await fetch('/api/blog/network-error')
        expect.fail('Should have thrown network error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('should handle malformed JSON responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token in JSON')
        }
      })

      const response = await fetch('/api/blog/malformed')
      
      try {
        await response.json()
        expect.fail('Should have thrown JSON parse error')
      } catch (error) {
        expect(error).toBeInstanceOf(SyntaxError)
      }
    })

    it('should handle server errors with proper error response format', async () => {
      const mockServerErrorResponse = {
        data: null,
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => mockServerErrorResponse
      })

      const response = await fetch('/api/blog/server-error')
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(isErrorApiResponse(data)).toBe(true)
      expect(data.error).toBe('Internal server error')
    })

    it('should validate rate limiting responses', async () => {
      const mockRateLimitResponse = {
        data: null,
        success: false,
        error: 'Rate limit exceeded',
        message: 'Too many requests. Please try again later.'
      }

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => mockRateLimitResponse
      })

      const response = await fetch('/api/blog/rate-limited')
      const data = await response.json()

      expect(response.status).toBe(429)
      expect(isErrorApiResponse(data)).toBe(true)
      expect(data.error).toBe('Rate limit exceeded')
      expect(data.message).toBe('Too many requests. Please try again later.')
    })
  })

  describe('Content validation edge cases', () => {
    it('should handle partial localized content', async () => {
      const partialLocalizedPost = {
        id: '1',
        slug: 'partial-localized',
        title: {
          tr: 'Türkçe başlık',
          en: 'English title'
          // Missing de and fr
        },
        // ... other required fields with proper structure
      }

      // This should fail validation because localized content is incomplete
      expect(isBlogPost({
        ...partialLocalizedPost,
        excerpt: { tr: 'özet', en: 'excerpt', de: 'auszug', fr: 'extrait' },
        content: { tr: 'içerik', en: 'content', de: 'inhalt', fr: 'contenu' },
        publishedAt: '2023-01-01',
        updatedAt: '2023-01-01',
        status: 'published',
        author: {
          id: '1',
          name: 'Author',
          bio: { tr: 'bio', en: 'bio', de: 'bio', fr: 'bio' },
          avatar: {
            src: '/avatar.jpg',
            alt: { tr: 'avatar', en: 'avatar', de: 'avatar', fr: 'avatar' },
            width: 100,
            height: 100
          }
        },
        category: {
          id: '1',
          name: { tr: 'kategori', en: 'category', de: 'kategorie', fr: 'catégorie' },
          slug: { tr: 'kategori', en: 'category', de: 'kategorie', fr: 'catégorie' },
          description: { tr: 'açıklama', en: 'description', de: 'beschreibung', fr: 'description' }
        },
        tags: { tr: ['tag'], en: ['tag'], de: ['tag'], fr: ['tag'] },
        featuredImage: {
          id: '1',
          src: '/image.jpg',
          alt: { tr: 'resim', en: 'image', de: 'bild', fr: 'image' },
          width: 800,
          height: 600,
          format: 'jpg' as const,
          size: 1024
        },
        readingTime: { tr: 5, en: 5, de: 5, fr: 5 },
        seo: {
          title: { tr: 'seo', en: 'seo', de: 'seo', fr: 'seo' },
          description: { tr: 'seo', en: 'seo', de: 'seo', fr: 'seo' },
          keywords: { tr: ['key'], en: ['key'], de: ['key'], fr: ['key'] }
        }
      })).toBe(false)
    })

    it('should handle empty arrays and null values', async () => {
      const mockEmptyResponse = {
        data: [],
        success: true,
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockEmptyResponse
      })

      const response = await fetch('/api/blog/empty-data')
      const data = await response.json()

      expect(isSuccessfulApiResponse(data)).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
      expect(data.data).toHaveLength(0)
      expect(data.pagination.total).toBe(0)
    })
  })
})