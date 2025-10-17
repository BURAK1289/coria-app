'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { useState, useTransition, useCallback, useEffect, useRef } from 'react';
import type {
  MouseEventHandler,
  KeyboardEventHandler,
  FocusEventHandler
} from '@/types/events';
import { logger } from '@/lib/logger';

const languages = {
  tr: { name: 'Türkçe', flag: '🇹🇷', label: 'TR' },
  en: { name: 'English', flag: '🇺🇸', label: 'EN' },
  de: { name: 'Deutsch', flag: '🇩🇪', label: 'DE' },
  fr: { name: 'Français', flag: '🇫🇷', label: 'FR' },
} as const;

type LanguageKey = keyof typeof languages;

export function LanguageSwitcher() {
  const currentLocale = useLocale();
const isLanguageKey = (value: string): value is LanguageKey => value in languages;
const locale: LanguageKey = isLanguageKey(currentLocale) ? currentLocale : 'tr';
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [isOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
    return undefined;
  }, [isOpen]);

  const handleLanguageChange = useCallback((newLocale: LanguageKey) => {
    startTransition(() => {
      try {
        // Set cookie for persistence (middleware will also set it, but this ensures immediate availability)
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; samesite=lax`;

        const nextHref = pathname as Parameters<typeof router.replace>[0];
        router.replace(nextHref, { locale: newLocale });
        setIsOpen(false);
      } catch (error) {
        logger.error('Failed to change language:', error);
      }
    });
  }, [router, pathname]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleButtonClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    handleToggle();
  };

  const handleButtonKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleToggle();
        break;
      case 'ArrowDown':
        event.preventDefault();
        setIsOpen(true);
        // Focus first option
        setTimeout(() => {
          const firstOption = dropdownRef.current?.querySelector('button');
          firstOption?.focus();
        }, 0);
        break;
    }
  };

  const handleOptionClick = useCallback((lang: string): MouseEventHandler<HTMLButtonElement> => {
    return (event) => {
      event.stopPropagation();
      if (isLanguageKey(lang)) {
        handleLanguageChange(lang);
      }
    };
  }, [handleLanguageChange]);

  const handleOptionKeyDown = useCallback((lang: string, index: number): KeyboardEventHandler<HTMLButtonElement> => {
    return (event) => {
      const options = Array.from(dropdownRef.current?.querySelectorAll('button') || []);
      
      switch (event.key) {
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (isLanguageKey(lang)) {
            handleLanguageChange(lang);
          }
          break;
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = (index + 1) % options.length;
          (options[nextIndex] as HTMLButtonElement)?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          const prevIndex = index === 0 ? options.length - 1 : index - 1;
          (options[prevIndex] as HTMLButtonElement)?.focus();
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'Tab':
          setIsOpen(false);
          break;
      }
    };
  }, [handleLanguageChange]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        onKeyDown={handleButtonKeyDown}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coria-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPending}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Current language: ${languages[locale]?.name} (${languages[locale]?.label}). Click to change language.`}
        id="language-switcher-button"
        data-testid="locale-selector"
      >
        <span aria-hidden="true">{languages[locale]?.flag}</span>
        <span>{languages[locale]?.label}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
            role="listbox"
            aria-labelledby="language-switcher-button"
          >
            {routing.locales.map((lang, index) => {
              const langKey = isLanguageKey(lang) ? lang : locale;
              const isSelected = locale === langKey;
              
              return (
                <button
                  key={lang}
                  onClick={handleOptionClick(lang)}
                  onKeyDown={handleOptionKeyDown(lang, index)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left text-sm transition-colors hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                    isSelected
                      ? 'bg-coria-green/10 text-coria-green font-medium'
                      : 'text-gray-700'
                  }`}
                  disabled={isPending}
                  role="option"
                  aria-label={`Switch to ${languages[langKey]?.name} (${languages[langKey]?.label})`}
                  aria-selected={isSelected}
                  tabIndex={isOpen ? 0 : -1}
                  data-testid={`locale-option-${langKey}`}
                >
                  <span aria-hidden="true">{languages[langKey]?.flag}</span>
                  <span>{languages[langKey]?.label}</span>
                  {isSelected && (
                    <svg 
                      className="ml-auto h-4 w-4" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}