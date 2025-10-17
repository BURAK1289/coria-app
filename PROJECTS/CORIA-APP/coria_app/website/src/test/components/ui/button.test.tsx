import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  describe('Variant Rendering', () => {
    it('should render primary variant with gradient', () => {
      render(<Button variant="primary">Primary</Button>)
      const button = screen.getByRole('button', { name: /primary/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('bg-gradient-primary')
      expect(button).toHaveClass('text-white')
    })

    it('should render secondary variant with correct styles', () => {
      render(<Button variant="secondary">Secondary</Button>)
      const button = screen.getByRole('button', { name: /secondary/i })
      expect(button).toHaveClass('bg-white/70')
      expect(button).toHaveClass('text-coria-primary')
      expect(button).toHaveClass('border')
    })

    it('should render outline variant with border', () => {
      render(<Button variant="outline">Outline</Button>)
      const button = screen.getByRole('button', { name: /outline/i })
      expect(button).toHaveClass('border')
      expect(button).toHaveClass('border-coria-primary')
      expect(button).toHaveClass('text-coria-primary')
    })

    it('should render ghost variant with transparent background', () => {
      render(<Button variant="ghost">Ghost</Button>)
      const button = screen.getByRole('button', { name: /ghost/i })
      expect(button).toHaveClass('text-coria-primary')
      expect(button).toHaveClass('hover:bg-coria-primary/5')
    })

    it('should render glass variant with backdrop blur', () => {
      render(<Button variant="glass">Glass</Button>)
      const button = screen.getByRole('button', { name: /glass/i })
      expect(button).toHaveClass('bg-white/70')
      expect(button).toHaveClass('backdrop-blur-md')
      expect(button).toHaveClass('border-2')
    })
  })

  describe('Size Rendering', () => {
    it('should render small size correctly', () => {
      render(<Button size="sm">Small</Button>)
      const button = screen.getByRole('button', { name: /small/i })
      expect(button).toHaveClass('h-9')
      expect(button).toHaveClass('px-4')
      expect(button).toHaveClass('text-sm')
    })

    it('should render default (medium) size correctly', () => {
      render(<Button size="md">Medium</Button>)
      const button = screen.getByRole('button', { name: /medium/i })
      expect(button).toHaveClass('h-11')
      expect(button).toHaveClass('px-6')
      expect(button).toHaveClass('text-base')
    })

    it('should render large size correctly', () => {
      render(<Button size="lg">Large</Button>)
      const button = screen.getByRole('button', { name: /large/i })
      expect(button).toHaveClass('h-12')
      expect(button).toHaveClass('px-7')
      expect(button).toHaveClass('text-lg')
    })

    it('should render extra-large size correctly', () => {
      render(<Button size="xl">Extra Large</Button>)
      const button = screen.getByRole('button', { name: /extra large/i })
      expect(button).toHaveClass('h-14')
      expect(button).toHaveClass('px-8')
      expect(button).toHaveClass('text-lg')
    })
  })

  describe('Rounding Options', () => {
    it('should render with full rounding by default', () => {
      render(<Button>Default Rounding</Button>)
      const button = screen.getByRole('button', { name: /default rounding/i })
      expect(button).toHaveClass('rounded-full')
    })

    it('should render with organic rounding', () => {
      render(<Button rounded="organic">Organic</Button>)
      const button = screen.getByRole('button', { name: /organic/i })
      expect(button).toHaveClass('rounded-[28px]')
    })
  })

  describe('State Handling', () => {
    it('should handle disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      const button = screen.getByRole('button', { name: /disabled/i })
      expect(button).toBeDisabled()
      expect(button).toHaveClass('disabled:opacity-60')
      expect(button).toHaveClass('disabled:pointer-events-none')
    })

    it('should handle click events', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>Click Me</Button>)

      const button = screen.getByRole('button', { name: /click me/i })
      await user.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should prevent click when disabled', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Button onClick={handleClick} disabled>Click Me</Button>)

      const button = screen.getByRole('button', { name: /click me/i })
      await user.click(button)

      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Customization', () => {
    it('should apply custom className', () => {
      render(<Button className="custom-class">Custom</Button>)
      const button = screen.getByRole('button', { name: /custom/i })
      expect(button).toHaveClass('custom-class')
      // Should also retain base classes
      expect(button).toHaveClass('inline-flex')
      expect(button).toHaveClass('transition-all')
    })

    it('should render as a link when asChild is used', () => {
      render(
        <Button asChild>
          <a href="/test">Link Button</a>
        </Button>
      )
      const link = screen.getByRole('link', { name: /link button/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
    })

    it('should support data attributes', () => {
      render(<Button data-testid="custom-button">Button</Button>)
      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have focus-visible ring styles', () => {
      render(<Button>Focus Test</Button>)
      const button = screen.getByRole('button', { name: /focus test/i })
      expect(button).toHaveClass('focus-visible:outline-none')
      expect(button).toHaveClass('focus-visible:ring-2')
      expect(button).toHaveClass('focus-visible:ring-coria-primary')
    })

    it('should have proper transition classes', () => {
      render(<Button>Transition Test</Button>)
      const button = screen.getByRole('button', { name: /transition test/i })
      expect(button).toHaveClass('transition-all')
      expect(button).toHaveClass('duration-300')
    })
  })

  describe('Variant Combinations', () => {
    it('should combine variant, size, and rounding correctly', () => {
      render(
        <Button variant="secondary" size="lg" rounded="organic">
          Combined
        </Button>
      )
      const button = screen.getByRole('button', { name: /combined/i })

      // Variant classes
      expect(button).toHaveClass('bg-white/70')
      // Size classes
      expect(button).toHaveClass('h-12')
      // Rounding classes
      expect(button).toHaveClass('rounded-[28px]')
    })
  })
})
