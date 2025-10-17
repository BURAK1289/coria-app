import { describe, it, expect, vi } from 'vitest'
import { 
  sanitizeHtml, 
  sanitizeText, 
  isValidEmail, 
  isValidPhone, 
  isValidUrl,
  validateFormData,
  formRateLimiter,
  generateCSRFToken
} from '@/lib/security'

describe('Security Utilities', () => {
  describe('HTML Sanitization', () => {
    it('should sanitize malicious HTML', () => {
      const maliciousHtml = '<script>alert("XSS")</script><p>Safe content</p>'
      const sanitized = sanitizeHtml(maliciousHtml)
      
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('alert')
      expect(sanitized).toContain('<p>Safe content</p>')
    })

    it('should allow safe HTML tags', () => {
      const safeHtml = '<p>This is <strong>bold</strong> and <em>italic</em> text with a <a href="https://example.com">link</a></p>'
      const sanitized = sanitizeHtml(safeHtml)
      
      expect(sanitized).toContain('<p>')
      expect(sanitized).toContain('<strong>')
      expect(sanitized).toContain('<em>')
      expect(sanitized).toContain('<a href="https://example.com">')
    })

    it('should remove dangerous attributes', () => {
      const dangerousHtml = '<p onclick="alert(\'XSS\')" onload="malicious()">Content</p>'
      const sanitized = sanitizeHtml(dangerousHtml)
      
      expect(sanitized).not.toContain('onclick')
      expect(sanitized).not.toContain('onload')
      expect(sanitized).toContain('<p>Content</p>')
    })

    it('should sanitize text content completely', () => {
      const htmlText = '<script>alert("XSS")</script>Plain text<p>More HTML</p>'
      const sanitized = sanitizeText(htmlText)
      
      expect(sanitized).toBe('Plain textMore HTML')
      expect(sanitized).not.toContain('<')
      expect(sanitized).not.toContain('>')
    })
  })

  describe('Input Validation', () => {
    describe('Email Validation', () => {
      it('should validate correct email addresses', () => {
        expect(isValidEmail('user@example.com')).toBe(true)
        expect(isValidEmail('test.email+tag@domain.co.uk')).toBe(true)
        expect(isValidEmail('user123@test-domain.org')).toBe(true)
      })

      it('should reject invalid email addresses', () => {
        expect(isValidEmail('invalid-email')).toBe(false)
        expect(isValidEmail('@domain.com')).toBe(false)
        expect(isValidEmail('user@')).toBe(false)
        expect(isValidEmail('user@domain')).toBe(false)
        expect(isValidEmail('')).toBe(false)
      })

      it('should reject overly long email addresses', () => {
        const longEmail = 'a'.repeat(250) + '@example.com'
        expect(isValidEmail(longEmail)).toBe(false)
      })
    })

    describe('Phone Validation', () => {
      it('should validate correct phone numbers', () => {
        expect(isValidPhone('+1234567890')).toBe(true)
        expect(isValidPhone('+90 555 123 4567')).toBe(true)
        expect(isValidPhone('+44-20-7946-0958')).toBe(true)
        expect(isValidPhone('(555) 123-4567')).toBe(true)
      })

      it('should reject invalid phone numbers', () => {
        expect(isValidPhone('123')).toBe(false)
        expect(isValidPhone('abc123')).toBe(false)
        expect(isValidPhone('+0123456789')).toBe(false) // Can't start with 0 after country code
        expect(isValidPhone('')).toBe(false)
      })
    })

    describe('URL Validation', () => {
      it('should validate correct URLs', () => {
        expect(isValidUrl('https://example.com')).toBe(true)
        expect(isValidUrl('http://test.org/path?query=value')).toBe(true)
        expect(isValidUrl('https://subdomain.example.com:8080/path')).toBe(true)
      })

      it('should reject invalid URLs', () => {
        expect(isValidUrl('not-a-url')).toBe(false)
        expect(isValidUrl('ftp://example.com')).toBe(false) // Only http/https allowed
        expect(isValidUrl('javascript:alert(1)')).toBe(false)
        expect(isValidUrl('')).toBe(false)
      })
    })
  })

  describe('Form Data Validation', () => {
    it('should detect SQL injection attempts', () => {
      const maliciousData = {
        username: "admin'; DROP TABLE users; --",
        email: 'user@example.com'
      }
      
      const result = validateFormData(maliciousData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(expect.stringContaining('SQL injection'))
    })

    it('should detect XSS attempts', () => {
      const maliciousData = {
        comment: '<script>alert("XSS")</script>',
        name: 'John Doe'
      }
      
      const result = validateFormData(maliciousData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(expect.stringContaining('XSS'))
    })

    it('should detect path traversal attempts', () => {
      const maliciousData = {
        filename: '../../../etc/passwd',
        content: 'Normal content'
      }
      
      const result = validateFormData(maliciousData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(expect.stringContaining('path traversal'))
    })

    it('should reject excessively long input', () => {
      const maliciousData = {
        message: 'a'.repeat(15000)
      }
      
      const result = validateFormData(maliciousData)
      expect(result.isValid).toBe(false)
      expect(result.errors).toContain(expect.stringContaining('maximum length'))
    })

    it('should allow clean data', () => {
      const cleanData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'This is a normal message with no malicious content.'
      }
      
      const result = validateFormData(cleanData)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const identifier = 'test-user-1'
      
      // Should allow first few requests
      expect(formRateLimiter.isAllowed(identifier)).toBe(true)
      expect(formRateLimiter.isAllowed(identifier)).toBe(true)
      expect(formRateLimiter.isAllowed(identifier)).toBe(true)
    })

    it('should block requests after limit exceeded', () => {
      const identifier = 'test-user-2'
      
      // Make maximum allowed requests
      for (let i = 0; i < 5; i++) {
        expect(formRateLimiter.isAllowed(identifier)).toBe(true)
      }
      
      // Next request should be blocked
      expect(formRateLimiter.isAllowed(identifier)).toBe(false)
    })

    it('should provide remaining time when blocked', () => {
      const identifier = 'test-user-3'
      
      // Exceed limit
      for (let i = 0; i < 6; i++) {
        formRateLimiter.isAllowed(identifier)
      }
      
      const remainingTime = formRateLimiter.getRemainingTime(identifier)
      expect(remainingTime).toBeGreaterThan(0)
    })
  })

  describe('CSRF Token Generation', () => {
    it('should generate unique tokens', () => {
      const token1 = generateCSRFToken()
      const token2 = generateCSRFToken()
      
      expect(token1).not.toBe(token2)
      expect(token1).toHaveLength(64) // 32 bytes * 2 hex chars
      expect(token2).toHaveLength(64)
    })

    it('should generate valid hex tokens', () => {
      const token = generateCSRFToken()
      expect(token).toMatch(/^[0-9a-f]{64}$/)
    })
  })
})