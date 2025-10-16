'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { Button } from '@/components/ui';
import { MobileNavigation } from '@/components/ui/mobile-navigation';
import { cn } from '@/lib/utils';
import { getHomeContent } from '@/content/home';

interface NavigationProps {
  className?: string;
}

const NAVIGATION_ITEMS = [
  { key: 'features', href: '/features', external: false },
  { key: 'pricing', href: '/pricing', external: false },
  { key: 'blog', href: 'https://medium.com/@coria.app.com', external: true },
  { key: 'foundation', href: '/foundation', external: false },
  { key: 'about', href: '/about', external: false }
] as const;

export function Navigation({ className = '' }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const t = useTranslations('navigation');
  const locale = useLocale();
  const homeContent = getHomeContent(locale);
  const pathname = usePathname();

  // Handle scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.getElementById('mobile-menu');
      const button = document.getElementById('mobile-menu-button');
      
      if (isOpen && nav && button && 
          !nav.contains(event.target as Node) && 
          !button.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }

    return pathname.startsWith(href);
  };

  const handleSmoothScroll = (e: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    // Only handle smooth scrolling for same-page anchors
    if (href.startsWith('#')) {
      e.preventDefault();
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
        setIsOpen(false);
      }
    } else if (pathname === '/' && href === '/') {
      // Scroll to top if already on homepage
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Navigation */}
      <header
        className={cn(
          'hidden lg:block fixed inset-x-0 top-0 z-[9999] transition-all duration-500',
          className
        )}
      >
        <div className="px-6 py-4">
          <nav
            className={cn(
              'mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border-none bg-[var(--foam)] px-8 py-4 transition-all duration-500'
            )}
            aria-label="Primary navigation"
          >
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link
                href="/"
                locale={locale}
                className="group inline-block align-middle transition-all duration-300 hover:-translate-y-0.5"
                onClick={(e) => handleSmoothScroll(e, '/')}
                aria-label={t('logoAria')}
                data-testid="nav-logo"
              >
                <span className="logo-ring-3 relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--foam)] p-0">
                  <Image
                    src="/coria-app-logo.webp"
                    alt="CORIA logosu"
                    width={48}
                    height={48}
                    className="object-contain"
                    style={{ width: 'auto', height: '100%' }}
                    priority
                  />
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="flex items-center gap-2">
              {NAVIGATION_ITEMS.map((item) => {
                if (item.external) {
                  return (
                    <a
                      key={item.key}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                        'text-gray-600 hover:bg-coria-primary/5 hover:text-coria-primary'
                      )}
                      data-testid={`nav-${item.key}`}
                    >
                      {t(item.key)}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    locale={locale}
                    className={cn(
                      'rounded-full px-4 py-2 text-sm font-medium transition-all duration-300',
                      isActive(item.href)
                        ? 'bg-coria-primary/10 text-coria-primary shadow-sm'
                        : 'text-gray-600 hover:bg-coria-primary/5 hover:text-coria-primary'
                    )}
                    onClick={(e) => handleSmoothScroll(e, item.href)}
                    data-testid={`nav-${item.key}`}
                  >
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Actions */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Button
                variant="primary"
                size="sm"
                asChild
                className="hidden xl:inline-flex shadow-md !text-white"
              >
                <a
                  href="https://play.google.com/store/apps/details?id=com.coria.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="cta-android-nav"
                  className="!text-white hover:!text-white"
                >
                  {t('downloadAndroid')}
                </a>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNavigation />
    </>
  );
}
