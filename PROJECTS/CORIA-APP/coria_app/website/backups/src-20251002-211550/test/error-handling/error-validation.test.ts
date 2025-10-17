/**
 * Error handling tests with proper error type validation
 * These tests ensure that error handling works correctly with TypeScript types
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import {
  isValidError,
  isErrorApiResponse,
  validateNestedObject,
  isValidObject
} from '../../lib/type-guards'

// Mock error boundary component
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

class TestErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })
    this.props.onError?.(error, errorInfo)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback
      if (FallbackComponent && this.state.error) {
        return React.createElement(FallbackComponent, {
          error: this.state.error,
          reset: () => this.setState({ hasError: false, error: undefined, errorInfo: undefined })
        })
      }
      return React.createElement('div', { 'data-testid': 'error-fallback' }, 'Something went wrong.')
    }

    return this.props.children
  }
}

// Mock component that throws errors
const ErrorThrowingComponent: React.FC<{ shouldThrow?: boolean; errorType?: string }> = ({ 
  shouldThrow = false, 
  errorType = 'generic' 
}) => {
  if (shouldThrow) {
    switch (errorType) {
      case 'type':
        throw new TypeError('Type error occurred')
      case 'reference':
        throw new ReferenceError('Reference error occurred')
      case 'syntax':
        throw new SyntaxError('Syntax error occurred')
      case 'range':
        throw new RangeError('Range error occurred')
      default:
        throw new Error('Generic error occurred')
    }
  }

  return React.createElement('div', { 'data-testid': 'normal-component' }, 'Normal component')
}

// Mock async component that can fail
const AsyncComponent: React.FC<{ shouldFail?: boolean }> = ({ shouldFail = false }) => {
  const [data, setData] = React.useState<string | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        if (shouldFail) {
          throw new Error('Async operation failed')
        }
        
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 100))
        setData('Async data loaded')
      } catch (err) {
        if (isValidError(err)) {
          setError(err)
        } else {
          setError(new Error('Unknown error occurred'))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [shouldFail])

  if (loading) {
    return React.createElement('div', { 'data-testid': 'loading' }, 'Loading...')
  }

  if (error) {
    return React.createElement('div', { 'data-testid': 'async-error' }, `Error: ${error.message}`)
  }

  return React.createElement('div', { 'data-testid': 'async-data' }, data)
}

// Mock error fallback component
const ErrorFallback: React.FC<{ error: Error; reset: () => void }> = ({ error, reset }) => {
  return React.createElement('div', { 'data-testid': 'custom-error-fallback' }, [
    React.createElement('h2', { key: 'title' }, 'Error occurred'),
    React.createElement('p', { key: 'message', 'data-testid': 'error-message' }, error.message),
    React.createElement('p', { key: 'name', 'data-testid': 'error-name' }, error.name),
    React.createElement('button', { 
      key: 'button', 
      onClick: reset, 
      'data-testid': 'reset-button' 
    }, 'Try again')
  ])
}

describe('Error Handling and Validation Tests', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Suppress console.error during error boundary tests
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe('Error Type Guards', () => {
    it('should correctly identify Error objects', () => {
      const error = new Error('Test error')
      const typeError = new TypeError('Type error')
      const referenceError = new ReferenceError('Reference error')
      const syntaxError = new SyntaxError('Syntax error')
      const rangeError = new RangeError('Range error')

      expect(isValidError(error)).toBe(true)
      expect(isValidError(typeError)).toBe(true)
      expect(isValidError(referenceError)).toBe(true)
      expect(isValidError(syntaxError)).toBe(true)
      expect(isValidError(rangeError)).toBe(true)
    })

    it('should reject non-Error objects', () => {
      expect(isValidError('error string')).toBe(false)
      expect(isValidError({ message: 'error object' })).toBe(false)
      expect(isValidError(null)).toBe(false)
      expect(isValidError(undefined)).toBe(false)
      expect(isValidError(123)).toBe(false)
      expect(isValidError([])).toBe(false)
    })

    it('should validate error API responses', () => {
      const errorResponse = {
        data: null,
        success: false,
        error: 'Something went wrong'
      }

      const successResponse = {
        data: { message: 'Success' },
        success: true
      }

      expect(isErrorApiResponse(errorResponse)).toBe(true)
      expect(isErrorApiResponse(successResponse)).toBe(false)
      expect(isErrorApiResponse({ success: false })).toBe(false) // Missing error field
      expect(isErrorApiResponse({ error: 'Error', success: false })).toBe(false) // Missing data field
    })
  })

  describe('Error Boundary Tests', () => {
    it('should catch and display errors from child components', () => {
      const mockOnError = vi.fn()

      render(
        React.createElement(TestErrorBoundary, { onError: mockOnError }, 
          React.createElement(ErrorThrowingComponent, { shouldThrow: true })
        )
      )

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
      expect(mockOnError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          componentStack: expect.any(String)
        })
      )
    })

    it('should render normal content when no error occurs', () => {
      render(
        React.createElement(TestErrorBoundary, {}, 
          React.createElement(ErrorThrowingComponent, { shouldThrow: false })
        )
      )

      expect(screen.getByTestId('normal-component')).toBeInTheDocument()
      expect(screen.getByText('Normal component')).toBeInTheDocument()
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument()
    })

    it('should use custom fallback component when provided', () => {
      render(
        React.createElement(TestErrorBoundary, { fallback: ErrorFallback }, 
          React.createElement(ErrorThrowingComponent, { shouldThrow: true })
        )
      )

      expect(screen.getByTestId('custom-error-fallback')).toBeInTheDocument()
      expect(screen.getByText('Error occurred')).toBeInTheDocument()
      expect(screen.getByTestId('error-message')).toHaveTextContent('Generic error occurred')
      expect(screen.getByTestId('error-name')).toHaveTextContent('Error')
    })

    it('should handle different error types correctly', () => {
      const errorTypes = [
        { type: 'type', expectedName: 'TypeError', expectedMessage: 'Type error occurred' },
        { type: 'reference', expectedName: 'ReferenceError', expectedMessage: 'Reference error occurred' },
        { type: 'syntax', expectedName: 'SyntaxError', expectedMessage: 'Syntax error occurred' },
        { type: 'range', expectedName: 'RangeError', expectedMessage: 'Range error occurred' }
      ]

      errorTypes.forEach(({ type, expectedName, expectedMessage }) => {
        const { unmount } = render(
          React.createElement(TestErrorBoundary, { fallback: ErrorFallback }, 
            React.createElement(ErrorThrowingComponent, { shouldThrow: true, errorType: type })
          )
        )

        expect(screen.getByTestId('error-name')).toHaveTextContent(expectedName)
        expect(screen.getByTestId('error-message')).toHaveTextContent(expectedMessage)

        unmount()
      })
    })

    it('should allow error recovery with reset functionality', async () => {
      const { rerender } = render(
        React.createElement(TestErrorBoundary, { fallback: ErrorFallback }, 
          React.createElement(ErrorThrowingComponent, { shouldThrow: true })
        )
      )

      // Error should be displayed
      expect(screen.getByTestId('custom-error-fallback')).toBeInTheDocument()

      // Click reset button
      const resetButton = screen.getByTestId('reset-button')
      resetButton.click()

      // Re-render with non-throwing component
      rerender(
        React.createElement(TestErrorBoundary, { fallback: ErrorFallback }, 
          React.createElement(ErrorThrowingComponent, { shouldThrow: false })
        )
      )

      // Normal component should be displayed
      await waitFor(() => {
        expect(screen.getByTestId('normal-component')).toBeInTheDocument()
        expect(screen.queryByTestId('custom-error-fallback')).not.toBeInTheDocument()
      })
    })
  })

  describe('Async Error Handling Tests', () => {
    it('should handle async errors correctly', async () => {
      render(React.createElement(AsyncComponent, { shouldFail: true }))

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument()

      // Should show error after async operation fails
      await waitFor(() => {
        expect(screen.getByTestId('async-error')).toBeInTheDocument()
        expect(screen.getByText('Error: Async operation failed')).toBeInTheDocument()
      })
    })

    it('should handle successful async operations', async () => {
      render(React.createElement(AsyncComponent, { shouldFail: false }))

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument()

      // Should show data after successful async operation
      await waitFor(() => {
        expect(screen.getByTestId('async-data')).toBeInTheDocument()
        expect(screen.getByText('Async data loaded')).toBeInTheDocument()
      })
    })
  })

  describe('Nested Object Validation Error Handling', () => {
    it('should validate nested objects and report errors correctly', () => {
      const schema = {
        name: (value: unknown): boolean => typeof value === 'string' && value.length > 0,
        age: (value: unknown): boolean => typeof value === 'number' && value > 0,
        address: (value: unknown): boolean => {
          return isValidObject(value) && 
                 'street' in value && 
                 typeof value.street === 'string' && 
                 value.street.length > 0
        },
        contact: (value: unknown): boolean => {
          return isValidObject(value) && 
                 'email' in value && 
                 typeof value.email === 'string' && 
                 value.email.includes('@')
        }
      }

      const validData = {
        name: 'John Doe',
        age: 30,
        address: {
          street: '123 Main St'
        },
        contact: {
          email: 'john@example.com'
        }
      }

      const invalidData = {
        name: '', // Invalid: empty string
        age: -5, // Invalid: negative number
        address: {
          street: '' // Invalid: empty street
        },
        contact: {
          email: 'invalid-email' // Invalid: no @ symbol
        }
      }

      const validResult = validateNestedObject(validData, schema)
      expect(validResult.isValid).toBe(true)
      expect(validResult.errors).toHaveLength(0)

      const invalidResult = validateNestedObject(invalidData, schema)
      expect(invalidResult.isValid).toBe(false)
      expect(invalidResult.errors).toHaveLength(4)
      expect(invalidResult.errors.map(e => e.path)).toEqual(['name', 'age', 'address', 'contact'])
    })

    it('should handle validation errors with nested paths', () => {
      const schema = {
        user: (value: unknown): boolean => {
          if (!isValidObject(value)) return false
          
          const userSchema = {
            profile: (profile: unknown): boolean => {
              return isValidObject(profile) && 
                     'firstName' in profile && 
                     typeof profile.firstName === 'string' && 
                     profile.firstName.length > 0
            }
          }
          
          const result = validateNestedObject(value, userSchema, 'user')
          return result.isValid
        }
      }

      const invalidNestedData = {
        user: {
          profile: {
            firstName: '' // Invalid: empty first name
          }
        }
      }

      const result = validateNestedObject(invalidNestedData, schema)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].path).toBe('user')
    })

    it('should handle non-object input gracefully', () => {
      const schema = {
        name: (value: unknown): boolean => typeof value === 'string'
      }

      const result = validateNestedObject('not an object', schema)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toBe('Expected object')
    })

    it('should handle empty schema', () => {
      const result = validateNestedObject({ name: 'test' }, {})
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Error Logging and Monitoring', () => {
    it('should properly format error information for logging', () => {
      const error = new Error('Test error')
      error.stack = 'Error: Test error\n    at test (test.js:1:1)'

      const errorInfo = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      expect(errorInfo.message).toBe('Test error')
      expect(errorInfo.name).toBe('Error')
      expect(errorInfo.stack).toContain('Error: Test error')
      expect(errorInfo.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      expect(typeof errorInfo.userAgent).toBe('string')
      expect(typeof errorInfo.url).toBe('string')
    })

    it('should handle errors without stack traces', () => {
      const error = new Error('Test error')
      delete error.stack

      const errorInfo = {
        message: error.message,
        name: error.name,
        stack: error.stack || 'No stack trace available'
      }

      expect(errorInfo.message).toBe('Test error')
      expect(errorInfo.name).toBe('Error')
      expect(errorInfo.stack).toBe('No stack trace available')
    })

    it('should categorize errors by type', () => {
      const errors = [
        new Error('Generic error'),
        new TypeError('Type error'),
        new ReferenceError('Reference error'),
        new SyntaxError('Syntax error'),
        new RangeError('Range error')
      ]

      const categorizedErrors = errors.map(error => ({
        type: error.constructor.name,
        message: error.message,
        severity: error instanceof TypeError || error instanceof ReferenceError ? 'high' : 'medium'
      }))

      expect(categorizedErrors).toEqual([
        { type: 'Error', message: 'Generic error', severity: 'medium' },
        { type: 'TypeError', message: 'Type error', severity: 'high' },
        { type: 'ReferenceError', message: 'Reference error', severity: 'high' },
        { type: 'SyntaxError', message: 'Syntax error', severity: 'medium' },
        { type: 'RangeError', message: 'Range error', severity: 'medium' }
      ])
    })
  })

  describe('Error Recovery Strategies', () => {
    it('should implement retry logic for failed operations', async () => {
      let attemptCount = 0
      const maxRetries = 3

      const unreliableOperation = async (): Promise<string> => {
        attemptCount++
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`)
        }
        return 'Success on attempt 3'
      }

      const retryOperation = async (
        operation: () => Promise<string>,
        retries: number = maxRetries
      ): Promise<string> => {
        try {
          return await operation()
        } catch (error) {
          if (retries > 0 && isValidError(error)) {
            await new Promise(resolve => setTimeout(resolve, 100)) // Wait before retry
            return retryOperation(operation, retries - 1)
          }
          throw error
        }
      }

      const result = await retryOperation(unreliableOperation)
      expect(result).toBe('Success on attempt 3')
      expect(attemptCount).toBe(3)
    })

    it('should implement circuit breaker pattern for repeated failures', () => {
      class CircuitBreaker {
        private failureCount = 0
        private lastFailureTime = 0
        private state: 'closed' | 'open' | 'half-open' = 'closed'
        
        constructor(
          private failureThreshold: number = 3,
          private timeout: number = 5000
        ) {}

        async execute<T>(operation: () => Promise<T>): Promise<T> {
          if (this.state === 'open') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
              this.state = 'half-open'
            } else {
              throw new Error('Circuit breaker is open')
            }
          }

          try {
            const result = await operation()
            this.onSuccess()
            return result
          } catch (error) {
            this.onFailure()
            throw error
          }
        }

        private onSuccess() {
          this.failureCount = 0
          this.state = 'closed'
        }

        private onFailure() {
          this.failureCount++
          this.lastFailureTime = Date.now()
          
          if (this.failureCount >= this.failureThreshold) {
            this.state = 'open'
          }
        }

        getState() {
          return this.state
        }
      }

      const circuitBreaker = new CircuitBreaker(2, 1000)
      const failingOperation = async () => {
        throw new Error('Operation failed')
      }

      // First failure
      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow('Operation failed')
      expect(circuitBreaker.getState()).toBe('closed')

      // Second failure - should open circuit
      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow('Operation failed')
      expect(circuitBreaker.getState()).toBe('open')

      // Third attempt - should be rejected by circuit breaker
      await expect(circuitBreaker.execute(failingOperation)).rejects.toThrow('Circuit breaker is open')
    })
  })
})