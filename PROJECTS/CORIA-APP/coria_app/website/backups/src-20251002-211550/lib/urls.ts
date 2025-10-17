import { Locale } from '@/types/localization';
import { routing } from '@/i18n/routing';

/**
 * URL generation utilities for internationalized routes
 */

export interface UrlOptions {
  locale?: Locale;
  params?: Record<string, string>;
  searchParams?: Record<string, string>;
  absolute?: boolean;
  baseUrl?: string;
}

/**
 * Generate localized URL for a given path
 */
export function generateLocalizedUrl(
  path: string,
  options: UrlOptions = {}
): string {
  const {
    locale = routing.defaultLocale,
    params = {},
    searchParams = {},
    absolute = false,
    baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://coria.app'
  } = options;

  // Replace path parameters
  let finalPath = path;
  Object.entries(params).forEach(([key, value]) => {
    finalPath = finalPath.replace(`[${key}]`, value);
  });

  // Add locale prefix if not default locale
  if (locale !== routing.defaultLocale) {
    finalPath = `/${locale}${finalPath}`;
  }

  // Add search parameters
  const searchParamsString = new URLSearchParams(searchParams).toString();
  if (searchParamsString) {
    finalPath += `?${searchParamsString}`;
  }

  // Return absolute or relative URL
  if (absolute) {
    return `${baseUrl}${finalPath}`;
  }

  return finalPath;
}

/**
 * Generate alternate URLs for all supported locales
 */
export function generateAlternateUrls(
  path: string,
  options: Omit<UrlOptions, 'locale'> = {}
): Record<Locale, string> {
  const alternates: Record<string, string> = {};

  routing.locales.forEach(locale => {
    alternates[locale] = generateLocalizedUrl(path, { ...options, locale });
  });

  return alternates as Record<Locale, string>;
}

/**
 * Generate hreflang attributes for SEO
 */
export function generateHreflangUrls(
  path: string,
  options: Omit<UrlOptions, 'locale'> = {}
): Record<string, string> {
  const hreflangMap: Record<Locale, string> = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
  };

  const hreflangs: Record<string, string> = {};

  routing.locales.forEach(locale => {
    const url = generateLocalizedUrl(path, { ...options, locale, absolute: true });
    hreflangs[hreflangMap[locale]] = url;
  });

  // Add x-default for the default locale
  hreflangs['x-default'] = generateLocalizedUrl(path, { 
    ...options, 
    locale: routing.defaultLocale, 
    absolute: true 
  });

  return hreflangs;
}

/**
 * Get canonical URL for a page
 */
export function getCanonicalUrl(
  path: string,
  locale: Locale,
  options: Omit<UrlOptions, 'locale'> = {}
): string {
  return generateLocalizedUrl(path, { ...options, locale, absolute: true });
}

/**
 * Generate sitemap URLs for all locales
 */
export function generateSitemapUrls(
  paths: string[],
  options: Omit<UrlOptions, 'locale'> = {}
): Array<{
  url: string;
  locale: Locale;
  alternates: Record<Locale, string>;
  lastModified?: Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}> {
  const sitemapUrls: Array<{
    url: string;
    locale: Locale;
    alternates: Record<Locale, string>;
    lastModified?: Date;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  }> = [];

  paths.forEach(path => {
    routing.locales.forEach(locale => {
      const url = generateLocalizedUrl(path, { ...options, locale, absolute: true });
      const alternates = generateAlternateUrls(path, { ...options, absolute: true });

      sitemapUrls.push({
        url,
        locale,
        alternates,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: path === '/' ? 1.0 : 0.8,
      });
    });
  });

  return sitemapUrls;
}

/**
 * Parse locale from URL pathname
 */
export function parseLocaleFromPath(pathname: string): {
  locale: Locale;
  pathWithoutLocale: string;
} {
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (firstSegment && routing.locales.includes(firstSegment as Locale)) {
    return {
      locale: firstSegment as Locale,
      pathWithoutLocale: '/' + segments.slice(1).join('/'),
    };
  }

  return {
    locale: routing.defaultLocale,
    pathWithoutLocale: pathname,
  };
}

/**
 * Get localized pathname from routing configuration
 */
export function getLocalizedPathname(
  pathname: string,
  locale: Locale
): string {
  // Check if the pathname exists in the routing pathnames configuration
  const pathnames = routing.pathnames as Record<string, string | Record<Locale, string>>;
  
  for (const [internalPath, externalPaths] of Object.entries(pathnames)) {
    if (typeof externalPaths === 'string') {
      if (pathname === externalPaths) {
        return internalPath;
      }
    } else {
      const localizedPath = externalPaths[locale];
      if (pathname === localizedPath) {
        return internalPath;
      }
    }
  }

  return pathname;
}

/**
 * Get external pathname for a locale
 */
export function getExternalPathname(
  internalPath: string,
  locale: Locale
): string {
  const pathnames = routing.pathnames as Record<string, string | Record<Locale, string>>;
  const externalPaths = pathnames[internalPath];

  if (!externalPaths) {
    return internalPath;
  }

  if (typeof externalPaths === 'string') {
    return externalPaths;
  }

  return externalPaths[locale] || internalPath;
}

/**
 * Build breadcrumb navigation with localized paths
 */
export function buildBreadcrumbs(
  pathname: string,
  locale: Locale,
  labels: Record<string, string> = {}
): Array<{
  label: string;
  href: string;
  isActive: boolean;
}> {
  const { pathWithoutLocale } = parseLocaleFromPath(pathname);
  const segments = pathWithoutLocale.split('/').filter(Boolean);
  
  const breadcrumbs = [
    {
      label: labels['/'] || 'Home',
      href: generateLocalizedUrl('/', { locale }),
      isActive: segments.length === 0,
    },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isActive = index === segments.length - 1;
    
    breadcrumbs.push({
      label: labels[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: generateLocalizedUrl(currentPath, { locale }),
      isActive,
    });
  });

  return breadcrumbs;
}

/**
 * Generate Open Graph URLs
 */
export function generateOpenGraphUrls(
  path: string,
  locale: Locale,
  options: Omit<UrlOptions, 'locale'> = {}
): {
  url: string;
  alternateLocales: Array<{
    locale: string;
    url: string;
  }>;
} {
  const url = generateLocalizedUrl(path, { ...options, locale, absolute: true });
  
  const alternateLocales = routing.locales
    .filter(l => l !== locale)
    .map(l => ({
      locale: l,
      url: generateLocalizedUrl(path, { ...options, locale: l, absolute: true }),
    }));

  return {
    url,
    alternateLocales,
  };
}

/**
 * Validate and normalize URL
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url, 'https://example.com');
    return urlObj.pathname + urlObj.search + urlObj.hash;
  } catch {
    return url.startsWith('/') ? url : `/${url}`;
  }
}

/**
 * Check if URL is external
 */
export function isExternalUrl(url: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}