import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from '@/lib/formatting'

describe('formatting utilities', () => {
  describe('formatCurrency', () => {
    it('should format Turkish Lira correctly', () => {
      expect(formatCurrency(29.99, 'tr')).toBe('₺29,99')
      expect(formatCurrency(100, 'tr')).toBe('₺100,00')
    })

    it('should format USD correctly', () => {
      expect(formatCurrency(29.99, 'en')).toBe('$29.99')
      expect(formatCurrency(100, 'en')).toBe('$100.00')
    })

    it('should format EUR correctly', () => {
      expect(formatCurrency(29.99, 'de')).toBe('29,99 €')
      expect(formatCurrency(29.99, 'fr')).toBe('29,99 €')
    })

    it('should handle zero values', () => {
      expect(formatCurrency(0, 'tr')).toBe('₺0,00')
      expect(formatCurrency(0, 'en')).toBe('$0.00')
    })

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000, 'tr')).toBe('₺1.000.000,00')
      expect(formatCurrency(1000000, 'en')).toBe('$1,000,000.00')
    })
  })

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T10:30:00Z')

    it('should format date for Turkish locale', () => {
      const formatted = formatDate(testDate, 'tr')
      expect(formatted).toMatch(/15\.01\.2024|15 Oca 2024/)
    })

    it('should format date for English locale', () => {
      const formatted = formatDate(testDate, 'en')
      expect(formatted).toMatch(/1\/15\/2024|Jan 15, 2024/)
    })

    it('should format date for German locale', () => {
      const formatted = formatDate(testDate, 'de')
      expect(formatted).toMatch(/15\.1\.2024|15\. Jan\. 2024/)
    })

    it('should format date for French locale', () => {
      const formatted = formatDate(testDate, 'fr')
      expect(formatted).toMatch(/15\/01\/2024|15 janv\. 2024/)
    })

    it('should handle invalid dates', () => {
      expect(() => formatDate(new Date('invalid'), 'en')).not.toThrow()
    })
  })
})