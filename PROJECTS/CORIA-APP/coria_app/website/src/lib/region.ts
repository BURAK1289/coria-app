/**
 * Region Detection and Persistence
 *
 * Priority order:
 * 1. URL query param: ?region=US|EU|TR (override)
 * 2. Cookie: REGION cookie value
 * 3. Locale mapping: tr→TR, de/fr→EU, en→US
 * 4. Default: US
 */

import { type Region } from '@/data/pricing';
import { type Locale } from '@/types/localization';

const REGION_COOKIE_NAME = 'REGION';
const REGION_COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Locale to Region Mapping
 */
const LOCALE_TO_REGION_MAP: Record<Locale, Region> = {
  tr: 'TR',
  en: 'US',
  de: 'EU',
  fr: 'EU',
};

/**
 * Get region from URL query parameter
 */
function getRegionFromQuery(): Region | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const region = params.get('region')?.toUpperCase();

  if (region === 'US' || region === 'EU' || region === 'TR') {
    return region as Region;
  }

  return null;
}

/**
 * Get region from cookie
 */
function getRegionFromCookie(): Region | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  const regionCookie = cookies.find((c) => c.trim().startsWith(`${REGION_COOKIE_NAME}=`));

  if (regionCookie) {
    const region = regionCookie.split('=')[1].trim().toUpperCase();
    if (region === 'US' || region === 'EU' || region === 'TR') {
      return region as Region;
    }
  }

  return null;
}

/**
 * Get region from locale
 */
function getRegionFromLocale(locale: Locale): Region {
  return LOCALE_TO_REGION_MAP[locale] || 'US';
}

/**
 * Set region cookie
 */
export function setRegionCookie(region: Region): void {
  if (typeof document === 'undefined') return;

  document.cookie = `${REGION_COOKIE_NAME}=${region}; path=/; max-age=${REGION_COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * Detect region with priority order
 *
 * Priority:
 * 1. URL query param (?region=US)
 * 2. Cookie (REGION)
 * 3. Locale mapping (tr→TR, de/fr→EU, en→US)
 * 4. Default (US)
 */
export function detectRegion(locale: Locale): Region {
  // 1. Check URL query param (highest priority)
  const queryRegion = getRegionFromQuery();
  if (queryRegion) {
    // Persist the query param override to cookie
    setRegionCookie(queryRegion);
    return queryRegion;
  }

  // 2. Check cookie
  const cookieRegion = getRegionFromCookie();
  if (cookieRegion) {
    return cookieRegion;
  }

  // 3. Map from locale
  const localeRegion = getRegionFromLocale(locale);

  // Set default cookie on first visit
  setRegionCookie(localeRegion);

  return localeRegion;
}

/**
 * Change region and persist to cookie
 */
export function changeRegion(newRegion: Region): void {
  setRegionCookie(newRegion);

  // Optionally update URL query param without page reload
  if (typeof window !== 'undefined') {
    const url = new URL(window.location.href);
    url.searchParams.set('region', newRegion);
    window.history.replaceState({}, '', url.toString());
  }
}

/**
 * Format price with Intl.NumberFormat
 */
export function formatPrice(
  amount: number,
  region: Region,
  options?: Intl.NumberFormatOptions
): string {
  const currencyMap: Record<Region, { currency: string; locale: string }> = {
    US: { currency: 'USD', locale: 'en-US' },
    EU: { currency: 'EUR', locale: 'de-DE' },
    TR: { currency: 'TRY', locale: 'tr-TR' },
  };

  const { currency, locale } = currencyMap[region];

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });

  return formatter.format(amount);
}

/**
 * Calculate yearly discount percentage
 */
export function calculateYearlyDiscount(monthlyPrice: number, yearlyPrice: number): number {
  const monthlyTotal = monthlyPrice * 12;
  const savings = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;
  return Math.round(savings);
}

/**
 * Validate region value
 */
export function isValidRegion(value: string | null | undefined): value is Region {
  return value === 'US' || value === 'EU' || value === 'TR';
}
