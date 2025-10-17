import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

describe('Card Components', () => {
  describe('Card Variants', () => {
    it('should render default variant with correct styles', () => {
      render(<Card data-testid="card">Default Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).toBeInTheDocument()
      expect(card).toHaveClass('bg-white')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('border-coria-gray-200')
    })

    it('should render elevated variant with shadow', () => {
      render(<Card variant="elevated" data-testid="card">Elevated Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-white')
      expect(card).toHaveClass('shadow-lg')
      expect(card).toHaveClass('hover:shadow-xl')
    })

    it('should render outline variant with border', () => {
      render(<Card variant="outline" data-testid="card">Outline Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-transparent')
      expect(card).toHaveClass('border-2')
      expect(card).toHaveClass('border-coria-primary')
    })

    it('should render ghost variant transparently', () => {
      render(<Card variant="ghost" data-testid="card">Ghost Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-coria-gray-50')
      expect(card).toHaveClass('border-0')
    })

    it('should render glass variant with backdrop blur', () => {
      render(<Card variant="glass" data-testid="card">Glass Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('bg-white/60')
      expect(card).toHaveClass('backdrop-blur-md')
      expect(card).toHaveClass('border')
      expect(card).toHaveClass('shadow-lg')
    })
  })

  describe('Card Padding Options', () => {
    it('should render with no padding', () => {
      render(<Card padding="none" data-testid="card">No Padding</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-0')
    })

    it('should render with small padding', () => {
      render(<Card padding="sm" data-testid="card">Small Padding</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-4')
    })

    it('should render with medium padding by default', () => {
      render(<Card data-testid="card">Default Padding</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-6')
    })

    it('should render with large padding', () => {
      render(<Card padding="lg" data-testid="card">Large Padding</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('p-8')
    })
  })

  describe('Card Rounding Options', () => {
    it('should render with default rounding', () => {
      render(<Card data-testid="card">Default Rounding</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-lg')
    })

    it('should render with large rounding', () => {
      render(<Card rounded="lg" data-testid="card">Large Rounding</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-xl')
    })

    it('should render with organic-sm rounding', () => {
      render(<Card rounded="organic-sm" data-testid="card">Organic Small</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-[22px]')
    })

    it('should render with organic rounding', () => {
      render(<Card rounded="organic" data-testid="card">Organic</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('rounded-[28px]')
    })
  })

  describe('Card Hover Effects', () => {
    it('should apply hover effects when hover prop is true', () => {
      render(<Card hover data-testid="card">Hover Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('hover:-translate-y-2')
      expect(card).toHaveClass('hover:shadow-xl')
    })

    it('should not apply hover effects by default', () => {
      render(<Card data-testid="card">No Hover</Card>)
      const card = screen.getByTestId('card')
      expect(card).not.toHaveClass('hover:-translate-y-2')
    })
  })

  describe('CardHeader Component', () => {
    it('should render CardHeader with correct spacing', () => {
      render(<CardHeader data-testid="header">Header Content</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toBeInTheDocument()
      expect(header).toHaveClass('flex')
      expect(header).toHaveClass('flex-col')
      expect(header).toHaveClass('space-y-1.5')
    })

    it('should apply custom className to CardHeader', () => {
      render(<CardHeader className="custom-header" data-testid="header">Header</CardHeader>)
      const header = screen.getByTestId('header')
      expect(header).toHaveClass('custom-header')
      expect(header).toHaveClass('flex')
    })
  })

  describe('CardTitle Component', () => {
    it('should render CardTitle with proper typography', () => {
      render(<CardTitle>Card Title</CardTitle>)
      const title = screen.getByRole('heading', { level: 3 })
      expect(title).toBeInTheDocument()
      expect(title).toHaveClass('text-lg')
      expect(title).toHaveClass('font-semibold')
      expect(title).toHaveClass('leading-none')
      expect(title).toHaveClass('tracking-tight')
      expect(title).toHaveTextContent('Card Title')
    })

    it('should apply custom className to CardTitle', () => {
      render(<CardTitle className="custom-title" data-testid="title">Title</CardTitle>)
      const title = screen.getByTestId('title')
      expect(title).toHaveClass('custom-title')
    })
  })

  describe('CardDescription Component', () => {
    it('should render CardDescription with muted color', () => {
      render(<CardDescription data-testid="description">Description text</CardDescription>)
      const description = screen.getByTestId('description')
      expect(description).toBeInTheDocument()
      expect(description).toHaveClass('text-sm')
      expect(description).toHaveClass('text-muted-foreground')
      expect(description).toHaveTextContent('Description text')
    })

    it('should apply custom className to CardDescription', () => {
      render(<CardDescription className="custom-desc" data-testid="description">Desc</CardDescription>)
      const description = screen.getByTestId('description')
      expect(description).toHaveClass('custom-desc')
    })
  })

  describe('CardContent Component', () => {
    it('should render CardContent with correct padding', () => {
      render(<CardContent data-testid="content">Content text</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toBeInTheDocument()
      expect(content).toHaveClass('pt-0')
    })

    it('should apply custom className to CardContent', () => {
      render(<CardContent className="custom-content" data-testid="content">Content</CardContent>)
      const content = screen.getByTestId('content')
      expect(content).toHaveClass('custom-content')
      expect(content).toHaveClass('pt-0')
    })
  })

  describe('CardFooter Component', () => {
    it('should render CardFooter with flex layout', () => {
      render(<CardFooter data-testid="footer">Footer content</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toBeInTheDocument()
      expect(footer).toHaveClass('flex')
      expect(footer).toHaveClass('items-center')
      expect(footer).toHaveClass('pt-0')
    })

    it('should apply custom className to CardFooter', () => {
      render(<CardFooter className="custom-footer" data-testid="footer">Footer</CardFooter>)
      const footer = screen.getByTestId('footer')
      expect(footer).toHaveClass('custom-footer')
      expect(footer).toHaveClass('flex')
    })
  })

  describe('Card Composition', () => {
    it('should compose full card with all subcomponents', () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      )

      expect(screen.getByTestId('card')).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /test title/i })).toBeInTheDocument()
      expect(screen.getByText('Test Description')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(screen.getByText('Test Footer')).toBeInTheDocument()
    })

    it('should work with partial composition', () => {
      render(
        <Card data-testid="card">
          <CardHeader>
            <CardTitle>Title Only</CardTitle>
          </CardHeader>
          <CardContent>Content Only</CardContent>
        </Card>
      )

      expect(screen.getByRole('heading', { name: /title only/i })).toBeInTheDocument()
      expect(screen.getByText('Content Only')).toBeInTheDocument()
      expect(screen.queryByText('Footer')).not.toBeInTheDocument()
    })
  })

  describe('Card Customization', () => {
    it('should apply custom className to Card', () => {
      render(<Card className="custom-class" data-testid="card">Custom</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('custom-class')
      // Should also retain base classes
      expect(card).toHaveClass('transition-all')
      expect(card).toHaveClass('duration-300')
    })

    it('should handle onClick events', async () => {
      const user = userEvent.setup()
      const handleClick = vi.fn()
      render(<Card onClick={handleClick} data-testid="card">Clickable Card</Card>)

      const card = screen.getByTestId('card')
      await user.click(card)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should support data attributes', () => {
      render(<Card data-custom="test-value" data-testid="card">Data Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveAttribute('data-custom', 'test-value')
    })
  })

  describe('Card Transitions', () => {
    it('should have proper transition classes', () => {
      render(<Card data-testid="card">Transition Card</Card>)
      const card = screen.getByTestId('card')
      expect(card).toHaveClass('transition-all')
      expect(card).toHaveClass('duration-300')
    })
  })

  describe('Card Variant Combinations', () => {
    it('should combine variant, padding, rounding, and hover correctly', () => {
      render(
        <Card
          variant="elevated"
          padding="lg"
          rounded="organic"
          hover
          data-testid="card"
        >
          Combined Card
        </Card>
      )
      const card = screen.getByTestId('card')

      // Variant classes
      expect(card).toHaveClass('shadow-lg')
      // Padding classes
      expect(card).toHaveClass('p-8')
      // Rounding classes
      expect(card).toHaveClass('rounded-[28px]')
      // Hover classes
      expect(card).toHaveClass('hover:-translate-y-2')
    })
  })
})
