import { describe, it, expect } from 'vitest'
import { getLocalizedUrl, getAppStoreUrl, getSocialShareUrl } from '@/lib/urls'

describe('URL utilities', () => {
  describe('getLocalizedUrl', () => {
    it('should generate correct localized URLs', () => {
      expect(getLocalizedUrl('/features', 'tr')).toBe('/tr/features')
      expect(getLocalizedUrl('/pricing', 'en')).toBe('/en/pricing')
      expect(getLocalizedUrl('/about', 'de')).toBe('/de/about')
    })

    it('should handle root path', () => {
      expect(getLocalizedUrl('/', 'tr')).toBe('/tr')
      expect(getLocalizedUrl('', 'en')).toBe('/en')
    })

    it('should handle paths with query parameters', () => {
      expect(getLocalizedUrl('/blog?category=sustainability', 'tr')).toBe('/tr/blog?category=sustainability')
    })

    it('should handle paths with hash fragments', () => {
      expect(getLocalizedUrl('/features#scanning', 'en')).toBe('/en/features#scanning')
    })
  })

  describe('getAppStoreUrl', () => {
    it('should return iOS App Store URL for iOS platform', () => {
      const url = getAppStoreUrl('ios')
      expect(url).toContain('apps.apple.com')
      expect(url).toContain('coria')
    })

    it('should return Google Play Store URL for Android platform', () => {
      const url = getAppStoreUrl('android')
      expect(url).toContain('play.google.com')
      expect(url).toContain('coria')
    })

    it('should handle invalid platform gracefully', () => {
      const url = getAppStoreUrl('invalid' as any)
      expect(url).toBe('#')
    })
  })

  describe('getSocialShareUrl', () => {
    const testUrl = 'https://coria.app/features'
    const testText = 'Check out CORIA features'

    it('should generate Twitter share URL', () => {
      const url = getSocialShareUrl('twitter', testUrl, testText)
      expect(url).toContain('twitter.com/intent/tweet')
      expect(url).toContain(encodeURIComponent(testText))
      expect(url).toContain(encodeURIComponent(testUrl))
    })

    it('should generate Facebook share URL', () => {
      const url = getSocialShareUrl('facebook', testUrl, testText)
      expect(url).toContain('facebook.com/sharer/sharer.php')
      expect(url).toContain(encodeURIComponent(testUrl))
    })

    it('should generate LinkedIn share URL', () => {
      const url = getSocialShareUrl('linkedin', testUrl, testText)
      expect(url).toContain('linkedin.com/sharing/share-offsite')
      expect(url).toContain(encodeURIComponent(testUrl))
    })

    it('should generate WhatsApp share URL', () => {
      const url = getSocialShareUrl('whatsapp', testUrl, testText)
      expect(url).toContain('wa.me')
      expect(url).toContain(encodeURIComponent(`${testText} ${testUrl}`))
    })

    it('should handle invalid platform', () => {
      const url = getSocialShareUrl('invalid' as any, testUrl, testText)
      expect(url).toBe('#')
    })
  })
})