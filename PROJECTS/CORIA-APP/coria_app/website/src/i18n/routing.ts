import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['tr', 'en', 'de', 'fr'],

  // Used when no locale matches
  defaultLocale: 'tr',

  // The `pathnames` object holds pairs of internal and
  // external paths. Based on the locale, the external
  // paths are rewritten to the shared, internal ones.
  pathnames: {
    // If all locales use the same pathname, a single
    // string or only the internal pathname can be provided
    '/': '/',
    '/features': {
      tr: '/ozellikler',
      en: '/features',
      de: '/funktionen',
      fr: '/fonctionnalites'
    },
    '/features/[category]': {
      tr: '/ozellikler/[category]',
      en: '/features/[category]',
      de: '/funktionen/[category]',
      fr: '/fonctionnalites/[category]'
    },
    '/features/[category]/[feature]': {
      tr: '/ozellikler/[category]/[feature]',
      en: '/features/[category]/[feature]',
      de: '/funktionen/[category]/[feature]',
      fr: '/fonctionnalites/[category]/[feature]'
    },
    '/pricing': {
      tr: '/fiyatlandirma',
      en: '/pricing',
      de: '/preise',
      fr: '/tarifs'
    },
    '/about': {
      tr: '/hakkimizda',
      en: '/about',
      de: '/uber-uns',
      fr: '/a-propos'
    },
    '/contact': {
      tr: '/iletisim',
      en: '/contact',
      de: '/kontakt',
      fr: '/contact'
    },
    '/foundation': {
      tr: '/foundation',
      en: '/foundation',
      de: '/foundation',
      fr: '/foundation'
    },
    '/blog': {
      tr: '/blog',
      en: '/blog',
      de: '/blog',
      fr: '/blog'
    },
    '/blog/[slug]': {
      tr: '/blog/[slug]',
      en: '/blog/[slug]',
      de: '/blog/[slug]',
      fr: '/blog/[slug]'
    }
  }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);