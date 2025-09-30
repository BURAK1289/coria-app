import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Sanitize text content by removing HTML tags
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 254
}

/**
 * Validate phone number format (international)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

/**
 * Rate limiting for form submissions
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map()
  private readonly maxAttempts: number
  private readonly windowMs: number

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts
    this.windowMs = windowMs
  }

  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(identifier) || []
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs)
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false
    }

    // Add current attempt
    recentAttempts.push(now)
    this.attempts.set(identifier, recentAttempts)
    
    return true
  }

  getRemainingTime(identifier: string): number {
    const attempts = this.attempts.get(identifier) || []
    if (attempts.length < this.maxAttempts) return 0
    
    const oldestAttempt = Math.min(...attempts)
    const resetTime = oldestAttempt + this.windowMs
    
    return Math.max(0, resetTime - Date.now())
  }
}

export const formRateLimiter = new RateLimiter()

/**
 * CSRF token generation and validation
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

/**
 * Validate form data against common injection patterns
 */
export function validateFormData(data: Record<string, any>): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  // Check for SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
  ]

  // Check for XSS patterns
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe\b[^>]*>/i,
    /<object\b[^>]*>/i,
    /<embed\b[^>]*>/i,
  ]

  // Check for path traversal
  const pathTraversalPatterns = [
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e%2f/i,
    /%2e%2e%5c/i,
  ]

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Check SQL injection
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          errors.push(`Potential SQL injection detected in field: ${key}`)
          break
        }
      }

      // Check XSS
      for (const pattern of xssPatterns) {
        if (pattern.test(value)) {
          errors.push(`Potential XSS attack detected in field: ${key}`)
          break
        }
      }

      // Check path traversal
      for (const pattern of pathTraversalPatterns) {
        if (pattern.test(value)) {
          errors.push(`Potential path traversal detected in field: ${key}`)
          break
        }
      }

      // Check for excessively long input
      if (value.length > 10000) {
        errors.push(`Field ${key} exceeds maximum length`)
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * Content Security Policy nonce generation
 */
export function generateNonce(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
}

/**
 * Secure headers for API responses
 */
export const secureHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
}