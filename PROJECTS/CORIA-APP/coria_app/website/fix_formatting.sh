#!/bin/bash
# Fix formatting.ts - locale-to-currency mapping and invalid date handling

# Backup
cp src/lib/formatting.ts src/lib/formatting.ts.bak

# Replace formatCurrency function (lines 17-42)
sed -i.tmp '17,42d' src/lib/formatting.ts
sed -i.tmp '16 r /dev/stdin' src/lib/formatting.ts << 'NEWCODE'
export function formatCurrency(
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
}
NEWCODE

# Replace formatDate function (lines 106-139) with invalid date handling
sed -i.tmp '118,118s/const dateObj = typeof date/#const dateObj = typeof date/' src/lib/formatting.ts
sed -i.tmp '118 a\  // Handle invalid dates\n  let dateObj: Date;\n  if (typeof date === "string" || typeof date === "number") {\n    dateObj = new Date(date);\n    if (isNaN(dateObj.getTime())) {\n      return "Invalid Date";\n    }\n  } else {\n    dateObj = date;\n    if (isNaN(dateObj.getTime())) {\n      return "Invalid Date";\n    }\n  }' src/lib/formatting.ts

# Clean temp files
rm -f src/lib/formatting.ts.tmp

echo "✅ formatting.ts updated successfully"
