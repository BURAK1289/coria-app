import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock all external dependencies
vi.mock('next/image', () => ({
  default: ({ alt, src }: any) => <img alt={alt} src={src} />,
}));

vi.mock('next-intl', () => ({
  useLocale: () => 'tr',
}));

vi.mock('next/dynamic', () => ({
  default: (fn: any, options?: any) => {
    // Return a simple wrapper that renders children or nothing
    return ({ children, ...props }: any) => {
      if (options?.loading) {
        return options.loading();
      }
      return children || null;
    };
  },
}));

vi.mock('@/components/ui', () => ({
  Container: ({ children }: any) => <div>{children}</div>,
  Heading: ({ children, as: Tag = 'h1' }: any) => <Tag>{children}</Tag>,
  Text: ({ children }: any) => <p>{children}</p>,
  Button: ({ children, onClick }: any) => <button onClick={onClick}>{children}</button>,
}));

vi.mock('@/components/icons', () => ({
  AppleIcon: () => <span>Apple</span>,
  GooglePlayIcon: () => <span>Play</span>,
}));

vi.mock('@/content/home', () => ({
  getHomeContent: () => ({}),
}));

import { HeroSection } from '@/components/sections/hero-section';

describe('HeroSection Component', () => {
  it('should render section element', () => {
    const { container } = render(<HeroSection />);
    const section = container.querySelector('section#hero');
    expect(section).toBeInTheDocument();
  });

  it('should render Turkish eyebrow text', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Vegan Yaşam Asistanı/i)).toBeInTheDocument();
  });

  it('should render Turkish title', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Kalbinle Seç/i)).toBeInTheDocument();
  });

  it('should render Turkish subtitle', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Taradığın her ürünün/i)).toBeInTheDocument();
  });

  it('should render iOS CTA button', () => {
    render(<HeroSection />);
    expect(screen.getByText(/iOS için İndir/i)).toBeInTheDocument();
  });

  it('should render Android CTA button', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Android için İndir/i)).toBeInTheDocument();
  });

  it('should render social proof metrics', () => {
    render(<HeroSection />);
    expect(screen.getByText(/Milyar Ürün Verisi/i)).toBeInTheDocument();
    expect(screen.getByText(/Aktif Kullanıcı/i)).toBeInTheDocument();
  });

  it('should have accessibility region for metrics', () => {
    render(<HeroSection />);
    const region = screen.getByRole('region', { name: /CORIA istatistikleri/i });
    expect(region).toBeInTheDocument();
  });
});
