import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils';
import { HeroSection } from '@/components/sections/hero-section';

describe('HeroSection Component', () => {
  it('should render hero title and subtitle', () => {
    render(<HeroSection />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should render download buttons', () => {
    render(<HeroSection />);

    const downloadButtons = screen.getAllByRole('link');
    expect(downloadButtons).toHaveLength(2); // iOS and Android buttons

    // Check for app store links
    const iosButton = downloadButtons.find(button =>
      button.getAttribute('href')?.includes('apps.apple.com')
    );
    const androidButton = downloadButtons.find(button =>
      button.getAttribute('href')?.includes('play.google.com')
    );

    expect(iosButton).toBeInTheDocument();
    expect(androidButton).toBeInTheDocument();
  });

  it('should render app mockup image', () => {
    render(<HeroSection />);

    const mockupImage = screen.getByRole('img', { name: /coria app mockup/i });
    expect(mockupImage).toBeInTheDocument();
  });

  it('should have proper responsive layout classes', () => {
    const { container } = render(<HeroSection />);

    const heroContainer = container.querySelector('.hero-section');
    expect(heroContainer).toHaveClass('min-h-screen', 'flex', 'items-center');
  });

  it('should render CTA button with proper styling', () => {
    render(<HeroSection />);

    const ctaButton = screen.getByText('Test CTA');
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton.closest('a')).toHaveClass('bg-coria-green');
  });

  it('should be accessible', async () => {
    const { container } = render(<HeroSection />);
    const { expectToBeAccessible } = await import('@/test/utils');
    await expectToBeAccessible(container);
  });

  it('should have proper heading hierarchy', () => {
    render(<HeroSection />);

    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
    expect(mainHeading).toHaveTextContent('Test Title');
  });

  it('should render with animation classes', () => {
    const { container } = render(<HeroSection />);

    // Check for animation/transition classes
    const animatedElements = container.querySelectorAll(
      '[class*="animate"], [class*="transition"]'
    );
    expect(animatedElements.length).toBeGreaterThan(0);
  });
});
