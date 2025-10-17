import { readFileSync, writeFileSync } from 'fs';

const file = 'src/lib/formatting.ts';
let content = readFileSync(file, 'utf8');

// Fix 1: Replace formatCurrency to auto-map locale to currency
const oldFormatCurrency = `export function formatCurrency(
  amount: number,
  locale: Locale,
  options: CurrencyOptions = { currency: 'TRY' }
): string {
  const localeMap: Record<Locale, string> = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
  };

  const formatOptions: Intl.NumberFormatOptions = {
    style: options.style || 'currency',
    currency: options.currency,
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  };

  try {
    return new Intl.NumberFormat(localeMap[locale], formatOptions).format(amount);
  } catch {
    // Fallback to Turkish formatting
    return new Intl.NumberFormat('tr-TR', formatOptions).format(amount);
  }
}`;

const newFormatCurrency = `export function formatCurrency(
  amount: number,
  locale: Locale,
  options?: Partial<CurrencyOptions>
): string {
  const localeMap: Record<Locale, string> = {
    tr: 'tr-TR',
    en: 'en-US',
    de: 'de-DE',
    fr: 'fr-FR',
  };

  // Auto-map locale to appropriate currency if not specified
  const currencyMap: Record<Locale, string> = {
    tr: 'TRY',
    en: 'USD',
    de: 'EUR',
    fr: 'EUR',
  };

  const currency = options?.currency || currencyMap[locale];

  const formatOptions: Intl.NumberFormatOptions = {
    style: options?.style || 'currency',
    currency,
    minimumFractionDigits: options?.minimumFractionDigits ?? 2,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  };

  try {
    return new Intl.NumberFormat(localeMap[locale], formatOptions).format(amount);
  } catch {
    // Fallback to Turkish formatting
    return new Intl.NumberFormat('tr-TR', formatOptions).format(amount);
  }
}`;

content = content.replace(oldFormatCurrency, newFormatCurrency);

// Fix 2: Add invalid date handling to formatDate
const oldDateObj = `  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;`;

const newDateObj = `  // Handle invalid dates
  let dateObj: Date;
  if (typeof date === 'string' || typeof date === 'number') {
    dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
  } else {
    dateObj = date;
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date';
    }
  }`;

content = content.replace(oldDateObj, newDateObj);

writeFileSync(file, content, 'utf8');
console.log('✅ Fixed formatting.ts');
