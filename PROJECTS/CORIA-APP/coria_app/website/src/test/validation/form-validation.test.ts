/**
 * Form validation testing with proper type checking
 * These tests ensure that form validation works correctly with TypeScript types
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {
  isValidContactForm,
  isValidNewsletterSubscription,
  isValidSearchQuery,
  validateFormData,
  isValidEmail,
  isNonEmptyString,
  isPositiveNumber
} from '../../lib/type-guards'

// Mock form components for testing
interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
  type?: string
}

interface NewsletterFormData {
  email: string
  locale?: string
  preferences?: Record<string, boolean>
}

interface SearchFormData {
  query: string
  locale?: string
  category?: string
  limit?: number
  offset?: number
}

// Mock Contact Form Component
const ContactForm: React.FC<{
  onSubmit: (data: ContactFormData) => void
  onValidationError: (errors: string[]) => void
}> = ({ onSubmit, onValidationError }) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
      type: formData.get('type') as string || undefined
    }

    if (isValidContactForm(data)) {
      onSubmit(data)
    } else {
      const errors: string[] = []
      if (!isNonEmptyString(data.name)) errors.push('Name is required')
      if (!isValidEmail(data.email)) errors.push('Valid email is required')
      if (!isNonEmptyString(data.subject)) errors.push('Subject is required')
      if (!isNonEmptyString(data.message)) errors.push('Message is required')
      onValidationError(errors)
    }
  }

  return React.createElement('form', {
    onSubmit: handleSubmit,
    'data-testid': 'contact-form'
  }, [
    React.createElement('input', {
      key: 'name',
      name: 'name',
      placeholder: 'Your name',
      'data-testid': 'name-input'
    }),
    React.createElement('input', {
      key: 'email',
      name: 'email',
      type: 'email',
      placeholder: 'Your email',
      'data-testid': 'email-input'
    }),
    React.createElement('input', {
      key: 'subject',
      name: 'subject',
      placeholder: 'Subject',
      'data-testid': 'subject-input'
    }),
    React.createElement('textarea', {
      key: 'message',
      name: 'message',
      placeholder: 'Your message',
      'data-testid': 'message-input'
    }),
    React.createElement('select', {
      key: 'type',
      name: 'type',
      'data-testid': 'type-select'
    }, [
      React.createElement('option', { key: 'empty', value: '' }, 'Select type'),
      React.createElement('option', { key: 'general', value: 'general' }, 'General'),
      React.createElement('option', { key: 'support', value: 'support' }, 'Support'),
      React.createElement('option', { key: 'business', value: 'business' }, 'Business')
    ]),
    React.createElement('button', {
      key: 'submit',
      type: 'submit',
      'data-testid': 'submit-button'
    }, 'Send Message')
  ])
}

// Mock Newsletter Form Component
const NewsletterForm: React.FC<{
  onSubmit: (data: NewsletterFormData) => void
  onValidationError: (errors: string[]) => void
}> = ({ onSubmit, onValidationError }) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const data = {
      email: formData.get('email') as string,
      locale: formData.get('locale') as string || undefined,
      preferences: {
        marketing: formData.get('marketing') === 'on',
        updates: formData.get('updates') === 'on'
      }
    }

    if (isValidNewsletterSubscription(data)) {
      onSubmit(data)
    } else {
      const errors: string[] = []
      if (!isValidEmail(data.email)) errors.push('Valid email is required')
      onValidationError(errors)
    }
  }

  return React.createElement('form', {
    onSubmit: handleSubmit,
    'data-testid': 'newsletter-form'
  }, [
    React.createElement('input', {
      key: 'email',
      name: 'email',
      type: 'email',
      placeholder: 'Your email',
      'data-testid': 'newsletter-email-input'
    }),
    React.createElement('select', {
      key: 'locale',
      name: 'locale',
      'data-testid': 'locale-select'
    }, [
      React.createElement('option', { key: 'empty', value: '' }, 'Select language'),
      React.createElement('option', { key: 'tr', value: 'tr' }, 'Türkçe'),
      React.createElement('option', { key: 'en', value: 'en' }, 'English'),
      React.createElement('option', { key: 'de', value: 'de' }, 'Deutsch'),
      React.createElement('option', { key: 'fr', value: 'fr' }, 'Français')
    ]),
    React.createElement('label', { key: 'marketing-label' }, [
      React.createElement('input', {
        key: 'marketing-input',
        type: 'checkbox',
        name: 'marketing',
        'data-testid': 'marketing-checkbox'
      }),
      'Marketing emails'
    ]),
    React.createElement('label', { key: 'updates-label' }, [
      React.createElement('input', {
        key: 'updates-input',
        type: 'checkbox',
        name: 'updates',
        'data-testid': 'updates-checkbox'
      }),
      'Product updates'
    ]),
    React.createElement('button', {
      key: 'submit',
      type: 'submit',
      'data-testid': 'newsletter-submit'
    }, 'Subscribe')
  ])
}

// Mock Search Form Component
const SearchForm: React.FC<{
  onSubmit: (data: SearchFormData) => void
  onValidationError: (errors: string[]) => void
}> = ({ onSubmit, onValidationError }) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const data = {
      query: formData.get('query') as string,
      locale: formData.get('locale') as string || undefined,
      category: formData.get('category') as string || undefined,
      limit: formData.get('limit') ? parseInt(formData.get('limit') as string) : undefined,
      offset: formData.get('offset') ? parseInt(formData.get('offset') as string) : undefined
    }

    if (isValidSearchQuery(data)) {
      onSubmit(data)
    } else {
      const errors: string[] = []
      if (!isNonEmptyString(data.query)) errors.push('Search query is required')
      if (data.limit !== undefined && (!isPositiveNumber(data.limit) || data.limit <= 0)) {
        errors.push('Limit must be a positive number')
      }
      if (data.offset !== undefined && (!Number.isInteger(data.offset) || data.offset < 0)) {
        errors.push('Offset must be a non-negative integer')
      }
      onValidationError(errors)
    }
  }

  return React.createElement('form', {
    onSubmit: handleSubmit,
    'data-testid': 'search-form'
  }, [
    React.createElement('input', {
      key: 'query',
      name: 'query',
      placeholder: 'Search...',
      'data-testid': 'search-input'
    }),
    React.createElement('select', {
      key: 'locale',
      name: 'locale',
      'data-testid': 'search-locale-select'
    }, [
      React.createElement('option', { key: 'empty', value: '' }, 'All languages'),
      React.createElement('option', { key: 'tr', value: 'tr' }, 'Türkçe'),
      React.createElement('option', { key: 'en', value: 'en' }, 'English'),
      React.createElement('option', { key: 'de', value: 'de' }, 'Deutsch'),
      React.createElement('option', { key: 'fr', value: 'fr' }, 'Français')
    ]),
    React.createElement('select', {
      key: 'category',
      name: 'category',
      'data-testid': 'category-select'
    }, [
      React.createElement('option', { key: 'empty', value: '' }, 'All categories'),
      React.createElement('option', { key: 'blog', value: 'blog' }, 'Blog'),
      React.createElement('option', { key: 'features', value: 'features' }, 'Features'),
      React.createElement('option', { key: 'help', value: 'help' }, 'Help')
    ]),
    React.createElement('input', {
      key: 'limit',
      name: 'limit',
      type: 'number',
      placeholder: 'Results per page',
      'data-testid': 'limit-input'
    }),
    React.createElement('input', {
      key: 'offset',
      name: 'offset',
      type: 'number',
      placeholder: 'Offset',
      'data-testid': 'offset-input'
    }),
    React.createElement('button', {
      key: 'submit',
      type: 'submit',
      'data-testid': 'search-submit'
    }, 'Search')
  ])
}

describe('Form Validation Tests', () => {
  describe('Contact Form Validation', () => {
    it('should validate and submit valid contact form data', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      const mockValidationError = vi.fn()

      render(
        React.createElement(ContactForm, {
          onSubmit: mockSubmit,
          onValidationError: mockValidationError
        })
      )

      // Fill out the form with valid data
      await user.type(screen.getByTestId('name-input'), 'John Doe')
      await user.type(screen.getByTestId('email-input'), 'john@example.com')
      await user.type(screen.getByTestId('subject-input'), 'Test Subject')
      await user.type(screen.getByTestId('message-input'), 'This is a test message.')
      await user.selectOptions(screen.getByTestId('type-select'), 'general')

      // Submit the form
      await user.click(screen.getByTestId('submit-button'))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'This is a test message.',
          type: 'general'
        })
        expect(mockValidationError).not.toHaveBeenCalled()
      })
    })

    it('should show validation errors for invalid contact form data', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      render(
        React.createElement(ContactForm, {
          onSubmit: mockSubmit
        })
      )

      // Fill out the form with invalid data
      await user.type(screen.getByTestId('email-input'), 'invalid-email')

      // Submit the form
      await user.click(screen.getByTestId('submit-button'))

      // Form should not submit with invalid data
      await waitFor(() => {
        expect(mockSubmit).not.toHaveBeenCalled()
      })
    })

    it('should validate contact form data with type guards', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message'
      }

      const invalidData = {
        name: '',
        email: 'invalid-email',
        subject: '',
        message: ''
      }

      expect(isValidContactForm(validData)).toBe(true)
      expect(isValidContactForm(invalidData)).toBe(false)
      expect(isValidContactForm(null)).toBe(false)
      expect(isValidContactForm({})).toBe(false)
    })
  })

  describe('Newsletter Form Validation', () => {
    it('should validate and submit valid newsletter subscription', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      const mockValidationError = vi.fn()

      render(
        React.createElement(NewsletterForm, {
          onSubmit: mockSubmit,
          onValidationError: mockValidationError
        })
      )

      // Fill out the form
      await user.type(screen.getByTestId('newsletter-email-input'), 'subscriber@example.com')
      await user.selectOptions(screen.getByTestId('locale-select'), 'en')
      await user.click(screen.getByTestId('marketing-checkbox'))
      await user.click(screen.getByTestId('updates-checkbox'))

      // Submit the form
      await user.click(screen.getByTestId('newsletter-submit'))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          email: 'subscriber@example.com',
          locale: 'en',
          preferences: {
            marketing: true,
            updates: true
          }
        })
        expect(mockValidationError).not.toHaveBeenCalled()
      })
    })

    it('should show validation errors for invalid newsletter data', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()

      render(
        React.createElement(NewsletterForm, {
          onSubmit: mockSubmit
        })
      )

      // Enter invalid email
      await user.type(screen.getByTestId('newsletter-email-input'), 'not-an-email')

      // Submit the form
      await user.click(screen.getByTestId('newsletter-submit'))

      // Form should not submit with invalid data
      await waitFor(() => {
        expect(mockSubmit).not.toHaveBeenCalled()
      })
    })

    it('should validate newsletter subscription data with type guards', () => {
      const validData = {
        email: 'test@example.com',
        locale: 'en' as const,
        preferences: { marketing: true }
      }

      const invalidData = {
        email: 'invalid-email',
        locale: 'invalid-locale'
      }

      expect(isValidNewsletterSubscription(validData)).toBe(true)
      expect(isValidNewsletterSubscription({ email: 'test@example.com' })).toBe(true)
      expect(isValidNewsletterSubscription(invalidData)).toBe(false)
      expect(isValidNewsletterSubscription({})).toBe(false)
    })
  })

  describe('Search Form Validation', () => {
    it('should validate and submit valid search query', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      const mockValidationError = vi.fn()

      render(
        React.createElement(SearchForm, {
          onSubmit: mockSubmit,
          onValidationError: mockValidationError
        })
      )

      // Fill out the search form
      await user.type(screen.getByTestId('search-input'), 'sustainability')
      await user.selectOptions(screen.getByTestId('search-locale-select'), 'en')
      await user.selectOptions(screen.getByTestId('category-select'), 'blog')
      await user.type(screen.getByTestId('limit-input'), '10')
      await user.type(screen.getByTestId('offset-input'), '0')

      // Submit the form
      await user.click(screen.getByTestId('search-submit'))

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          query: 'sustainability',
          locale: 'en',
          category: 'blog',
          limit: 10,
          offset: 0
        })
        expect(mockValidationError).not.toHaveBeenCalled()
      })
    })

    it('should show validation errors for invalid search data', async () => {
      const user = userEvent.setup()
      const mockSubmit = vi.fn()
      const mockValidationError = vi.fn()

      render(
        React.createElement(SearchForm, {
          onSubmit: mockSubmit,
          onValidationError: mockValidationError
        })
      )

      // Fill out with invalid data
      // Leave search input empty (don't type anything) // Empty query
      await user.type(screen.getByTestId('limit-input'), '-1') // Negative limit
      await user.type(screen.getByTestId('offset-input'), '-5') // Negative offset

      // Submit the form
      await user.click(screen.getByTestId('search-submit'))

      await waitFor(() => {
        expect(mockSubmit).not.toHaveBeenCalled()
        expect(mockValidationError).toHaveBeenCalledWith([
          'Search query is required',
          'Limit must be a positive number',
          'Offset must be a non-negative integer'
        ])
      })
    })

    it('should validate search query data with type guards', () => {
      const validData = {
        query: 'sustainability',
        locale: 'en' as const,
        category: 'blog',
        limit: 10,
        offset: 0
      }

      const invalidData = {
        query: '',
        locale: 'invalid',
        limit: -1,
        offset: -5
      }

      expect(isValidSearchQuery(validData)).toBe(true)
      expect(isValidSearchQuery({ query: 'test' })).toBe(true)
      expect(isValidSearchQuery(invalidData)).toBe(false)
      expect(isValidSearchQuery({})).toBe(false)
    })
  })

  describe('Generic Form Validation', () => {
    interface UserRegistrationForm {
      username: string
      email: string
      password: string
      age: number
      terms: boolean
    }

    const userFormValidators = {
      username: isNonEmptyString,
      email: isValidEmail,
      password: (value: unknown): value is string => 
        typeof value === 'string' && value.length >= 8,
      age: (value: unknown): value is number => 
        isPositiveNumber(value) && value >= 13,
      terms: (value: unknown): value is boolean => 
        value === true
    }

    it('should validate complete form data correctly', () => {
      const validFormData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'securepassword123',
        age: 25,
        terms: true
      }

      const result = validateFormData<UserRegistrationForm>(
        validFormData,
        ['username', 'email', 'password', 'age', 'terms'],
        userFormValidators
      )

      expect(result).toBe(true)
    })

    it('should reject form data with missing required fields', () => {
      const incompleteFormData = {
        username: 'johndoe',
        email: 'john@example.com'
        // Missing password, age, terms
      }

      const result = validateFormData<UserRegistrationForm>(
        incompleteFormData,
        ['username', 'email', 'password', 'age', 'terms'],
        userFormValidators
      )

      expect(result).toBe(false)
    })

    it('should reject form data with invalid field values', () => {
      const invalidFormData = {
        username: '', // Empty username
        email: 'invalid-email', // Invalid email
        password: '123', // Too short password
        age: 10, // Too young
        terms: false // Terms not accepted
      }

      const result = validateFormData<UserRegistrationForm>(
        invalidFormData,
        ['username', 'email', 'password', 'age', 'terms'],
        userFormValidators
      )

      expect(result).toBe(false)
    })

    it('should handle partial validation correctly', () => {
      const partialFormData = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'securepassword123'
        // Missing age and terms, but they're not in required fields
      }

      const result = validateFormData<UserRegistrationForm>(
        partialFormData,
        ['username', 'email', 'password'], // Only require these fields
        userFormValidators
      )

      expect(result).toBe(true)
    })

    it('should validate optional fields when present', () => {
      const formDataWithOptionalFields = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'securepassword123',
        age: 15, // Valid age
        terms: true // Valid terms acceptance
      }

      const result = validateFormData<UserRegistrationForm>(
        formDataWithOptionalFields,
        ['username', 'email', 'password'], // age and terms are optional
        userFormValidators
      )

      expect(result).toBe(true)
    })

    it('should reject optional fields with invalid values', () => {
      const formDataWithInvalidOptionalFields = {
        username: 'johndoe',
        email: 'john@example.com',
        password: 'securepassword123',
        age: 10, // Invalid age (too young)
        terms: false // Invalid terms (not accepted)
      }

      const result = validateFormData<UserRegistrationForm>(
        formDataWithInvalidOptionalFields,
        ['username', 'email', 'password'], // age and terms are optional but validated if present
        userFormValidators
      )

      expect(result).toBe(false)
    })
  })
})