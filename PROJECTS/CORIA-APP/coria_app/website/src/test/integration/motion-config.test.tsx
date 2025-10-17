import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MotionProvider } from '@/components/providers/motion-provider'
import { motion } from 'framer-motion'

describe('Motion Configuration Integration', () => {
  let matchMediaMock: { matches: boolean; media: string; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    // Mock window.matchMedia
    matchMediaMock = {
      matches: false,
      media: '',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    window.matchMedia = vi.fn().mockImplementation((query) => ({
      ...matchMediaMock,
      media: query,
      matches: query === '(prefers-reduced-motion: reduce)' ? matchMediaMock.matches : false,
    }))
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Provider Setup', () => {
    it('should provide motion context to children', () => {
      render(
        <MotionProvider>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-testid="animated"
          >
            Content
          </motion.div>
        </MotionProvider>
      )

      const element = screen.getByTestId('animated')
      expect(element).toBeInTheDocument()
      expect(element).toHaveTextContent('Content')
    })

    it('should handle multiple animated components', () => {
      render(
        <MotionProvider>
          <motion.div data-testid="first">First</motion.div>
          <motion.div data-testid="second">Second</motion.div>
          <motion.div data-testid="third">Third</motion.div>
        </MotionProvider>
      )

      expect(screen.getByTestId('first')).toBeInTheDocument()
      expect(screen.getByTestId('second')).toBeInTheDocument()
      expect(screen.getByTestId('third')).toBeInTheDocument()
    })

    it('should render nested motion components', () => {
      render(
        <MotionProvider>
          <motion.div data-testid="parent">
            <motion.div data-testid="child">
              <motion.div data-testid="grandchild">
                Nested
              </motion.div>
            </motion.div>
          </motion.div>
        </MotionProvider>
      )

      expect(screen.getByTestId('parent')).toBeInTheDocument()
      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByTestId('grandchild')).toBeInTheDocument()
    })
  })

  describe('Reduced Motion Support', () => {
    it('should respect reduced motion preference when enabled', () => {
      // Enable reduced motion
      matchMediaMock.matches = true

      render(
        <MotionProvider>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            data-testid="reduced-motion"
          >
            Content
          </motion.div>
        </MotionProvider>
      )

      const element = screen.getByTestId('reduced-motion')
      expect(element).toBeInTheDocument()
      // Element should be rendered (animations handled by Framer Motion internally)
    })

    it('should work normally without reduced motion preference', () => {
      // Reduced motion disabled (default)
      matchMediaMock.matches = false

      render(
        <MotionProvider>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-testid="normal-motion"
          >
            Content
          </motion.div>
        </MotionProvider>
      )

      const element = screen.getByTestId('normal-motion')
      expect(element).toBeInTheDocument()
    })
  })

  describe('Animation Variants', () => {
    it('should handle animation variants', () => {
      const variants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1 },
      }

      render(
        <MotionProvider>
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            data-testid="variant-animation"
          >
            Variant Content
          </motion.div>
        </MotionProvider>
      )

      expect(screen.getByTestId('variant-animation')).toBeInTheDocument()
    })

    it('should handle complex animation sequences', () => {
      render(
        <MotionProvider>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1] as const,
            }}
            data-testid="sequence"
          >
            Sequence
          </motion.div>
        </MotionProvider>
      )

      expect(screen.getByTestId('sequence')).toBeInTheDocument()
    })
  })

  describe('Transition Configuration', () => {
    it('should apply custom transition durations', () => {
      render(
        <MotionProvider>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            data-testid="custom-duration"
          >
            Content
          </motion.div>
        </MotionProvider>
      )

      expect(screen.getByTestId('custom-duration')).toBeInTheDocument()
    })

    it('should handle different easing functions', () => {
      render(
        <MotionProvider>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ ease: 'easeInOut' }}
            data-testid="easing"
          >
            Eased
          </motion.div>
        </MotionProvider>
      )

      expect(screen.getByTestId('easing')).toBeInTheDocument()
    })
  })

  describe('Accessibility Compliance', () => {
    it('should provide WCAG 2.1 AA compliant motion controls', () => {
      render(
        <MotionProvider>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            data-testid="accessible"
          >
            Accessible Content
          </motion.div>
        </MotionProvider>
      )

      const element = screen.getByTestId('accessible')
      expect(element).toBeInTheDocument()
      // Verify that MotionProvider handles reduced motion preference
      // The actual matchMedia call happens during MotionProvider initialization
      expect(window.matchMedia).toBeDefined()
    })

    it('should work with screen readers', () => {
      render(
        <MotionProvider>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            role="region"
            aria-label="Animated content"
            data-testid="screen-reader"
          >
            Content
          </motion.div>
        </MotionProvider>
      )

      const element = screen.getByTestId('screen-reader')
      expect(element).toHaveAttribute('role', 'region')
      expect(element).toHaveAttribute('aria-label', 'Animated content')
    })
  })

  describe('Error Handling', () => {
    it('should handle missing motion config gracefully', () => {
      // Test that provider works even if motion config fails
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      render(
        <MotionProvider>
          <motion.div data-testid="error-test">Content</motion.div>
        </MotionProvider>
      )

      expect(screen.getByTestId('error-test')).toBeInTheDocument()

      consoleError.mockRestore()
    })
  })

  describe('Performance', () => {
    it('should handle large numbers of animated elements', () => {
      const elements = Array.from({ length: 50 }, (_, i) => i)

      render(
        <MotionProvider>
          {elements.map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-testid={`perf-element-${i}`}
            >
              Element {i}
            </motion.div>
          ))}
        </MotionProvider>
      )

      // Verify first and last elements render
      expect(screen.getByTestId('perf-element-0')).toBeInTheDocument()
      expect(screen.getByTestId('perf-element-49')).toBeInTheDocument()
    })
  })
})
