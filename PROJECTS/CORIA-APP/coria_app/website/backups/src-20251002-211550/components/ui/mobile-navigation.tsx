'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { ThemeToggle } from '@/components/ui';
import { X, Menu, Star, DollarSign, Info, MessageCircle, BookOpen, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { 
  MouseEventHandler,
  KeyboardEventHandler,
  FocusEventHandler
} from '@/types/events';

interface MobileNavigationProps {
  className?: string;
  onNavigate?: (path: string) => void;
}

export function MobileNavigation({ className = '', onNavigate }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('navigation');
  const pathname = usePathname();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Add aria-hidden to main content when menu is open
      const main = document.querySelector('main');
      if (main) {
        main.setAttribute('aria-hidden', 'true');
      }
    } else {
      document.body.style.overflow = 'unset';
      // Remove aria-hidden from main content
      const main = document.querySelector('main');
      if (main) {
        main.removeAttribute('aria-hidden');
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
      const main = document.querySelector('main');
      if (main) {
        main.removeAttribute('aria-hidden');
      }
    };
  }, [isOpen]);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape: (event: KeyboardEvent) => void = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
    return undefined;
  }, [isOpen]);

  const navigationItems = [
    { key: 'features', href: '/features', icon: Star },
    { key: 'pricing', href: '/pricing', icon: DollarSign },
    { key: 'blog', href: '/blog', icon: BookOpen },
    { key: 'foundation', href: '/foundation', icon: Leaf },
    { key: 'about', href: '/about', icon: Info },
    { key: 'contact', href: '/contact', icon: MessageCircle },
  ];

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleLinkClick = useCallback((href: string) => {
    setIsOpen(false);
    onNavigate?.(href);
  }, [onNavigate]);

  const handleMenuButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    handleToggle();
  };

  const handleMenuButtonKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  const handleOverlayClick: MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    handleClose();
  };

  const handleOverlayKeyDown: KeyboardEventHandler<HTMLDivElement> = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClose();
    }
  };

  const handleNavItemKeyDown = useCallback((href: string): KeyboardEventHandler<HTMLAnchorElement> => {
    return (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleLinkClick(href);
      }
    };
  }, [handleLinkClick]);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={handleMenuButtonClick}
        onKeyDown={handleMenuButtonKeyDown}
        className={cn(
          'mobile-nav-button lg:hidden fixed top-4 right-4 z-50',
          'bg-white/90 backdrop-blur-sm rounded-full p-3',
          'shadow-lg border border-gray-200',
          'touch-target transition-all duration-200',
          'hover:bg-white active:scale-95',
          'focus:outline-none focus:ring-2 focus:ring-coria-primary focus:ring-offset-2',
          className
        )}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation-menu"
        aria-haspopup="true"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-gray-700" aria-hidden="true" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" aria-hidden="true" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="mobile-nav-overlay lg:hidden"
          onClick={handleOverlayClick}
          onKeyDown={handleOverlayKeyDown}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

      {/* Mobile Navigation Panel */}
      <div
        id="mobile-navigation-menu"
        className={cn(
          'mobile-nav-panel lg:hidden safe-area-top safe-area-right',
          isOpen && 'open'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-nav-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[var(--foam)] shadow-sm">
                <Image
                  src="/coria-app-logo.svg"
                  alt="CORIA logosu"
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                  priority
                />
              </span>
              <span 
                id="mobile-nav-title"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                CORIA
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-6" role="navigation" aria-label="Main navigation">
            <div className="space-y-2 px-4">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => handleLinkClick(item.href)}
                    onKeyDown={handleNavItemKeyDown(item.href)}
                    className={cn(
                      'mobile-nav-item flex items-center space-x-3 rounded-lg transition-colors',
                      'touch-target w-full text-left',
                      'focus:outline-none focus:ring-2 focus:ring-coria-primary focus:ring-offset-2',
                      isActive
                        ? 'bg-coria-green text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                    aria-current={isActive ? 'page' : undefined}
                    tabIndex={isOpen ? 0 : -1}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="font-medium">{t(item.key)}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-700 safe-area-bottom">
            <div className="space-y-4">
              {/* App Download Links */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('downloadApp')}
                </p>
                <div className="flex space-x-2">
                  <a
                    href="#"
                    className="flex-1 bg-black text-white rounded-lg px-3 py-2 text-sm font-medium text-center touch-target focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
                    onClick={() => handleLinkClick('#')}
                    onKeyDown={handleNavItemKeyDown('#')}
                    tabIndex={isOpen ? 0 : -1}
                    aria-label="Download from App Store"
                  >
                    App Store
                  </a>
                  <a
                    href="#"
                    className="flex-1 bg-green-600 text-white rounded-lg px-3 py-2 text-sm font-medium text-center touch-target focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600"
                    onClick={() => handleLinkClick('#')}
                    onKeyDown={handleNavItemKeyDown('#')}
                    tabIndex={isOpen ? 0 : -1}
                    aria-label="Download from Google Play"
                  >
                    Google Play
                  </a>
                </div>
              </div>

              {/* Contact Info */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center" role="contentinfo">
                <p>© 2024 CORIA</p>
                <p>{t('sustainableLiving')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
