# I18N Routing & Navigation Guide

**CORIA Website Internationalization - Routing System**
**Date**: 2025-10-11
**Status**: ✅ PRODUCTION READY

---

## 🎯 Overview

Complete guide to locale-aware routing and navigation in the CORIA website using next-intl's routing system.

### Key Features
- ✅ 100% locale-aware navigation
- ✅ Automatic query parameter preservation
- ✅ Cookie-based locale persistence (`NEXT_LOCALE`)
- ✅ Localized pathnames (e.g., `/ozellikler` → `/features`)
- ✅ SEO-optimized with proper `lang` attributes
- ✅ Type-safe routing with TypeScript

---

## 📁 Routing Architecture

### Core Files

**1. Routing Configuration**
- **File**: [src/i18n/routing.ts](../../src/i18n/routing.ts:1)
- **Purpose**: Define locales, default locale, and pathname mappings
- **Exports**: `routing`, `Link`, `redirect`, `usePathname`, `useRouter`

**2. I18N Configuration**
- **File**: [src/i18n/config.ts](../../src/i18n/config.ts:1)
- **Purpose**: Load locale messages and validate incoming locales
- **Exports**: `locales`, `defaultLocale`, `getRequestConfig`

**3. Language Switcher**
- **File**: [src/components/ui/language-switcher.tsx](../../src/components/ui/language-switcher.tsx:1)
- **Purpose**: UI component for locale switching with cookie persistence
- **Features**: Accessibility, keyboard navigation, loading states

**4. Locale Layout**
- **File**: [src/app/[locale]/layout.tsx](../../src/app/[locale]/layout.tsx:1)
- **Purpose**: Root layout with `<html lang={locale}>` and metadata
- **Features**: SEO meta tags, Open Graph, Twitter cards

---

## 🗺️ Pathname Mappings

### Current Localized Routes

```typescript
// From src/i18n/routing.ts
const pathnames = {
  '/': '/',  // Home is same for all locales

  '/features': {
    tr: '/ozellikler',
    en: '/features',
    de: '/funktionen',
    fr: '/fonctionnalites'
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

  // Same for all locales
  '/foundation': '/foundation',
  '/blog': '/blog',
  '/blog/[slug]': '/blog/[slug]'
};
```

### Adding New Routes

**Pattern**: Add to `pathnames` object in [src/i18n/routing.ts](../../src/i18n/routing.ts:14-72)

```typescript
'/new-page': {
  tr: '/yeni-sayfa',
  en: '/new-page',
  de: '/neue-seite',
  fr: '/nouvelle-page'
},

// Dynamic routes
'/new-page/[id]': {
  tr: '/yeni-sayfa/[id]',
  en: '/new-page/[id]',
  de: '/neue-seite/[id]',
  fr: '/nouvelle-page/[id]'
}
```

---

## 🔗 Navigation Patterns

### 1. Using Localized Link Component

**Import from routing configuration** (NOT from 'next/link'):

```typescript
import { Link } from '@/i18n/routing';

// ✅ CORRECT - Automatically localized
<Link href="/features">Features</Link>
<Link href="/features/barcode-scanning">Barcode Scanning</Link>
<Link href={{ pathname: '/features', query: { category: 'ai' } }}>
  AI Features
</Link>

// ❌ WRONG - Don't import from next/link
import { Link } from 'next/link';  // ❌
<Link href="/features">Features</Link>  // Not locale-aware
```

**Key Benefits**:
- Automatic locale prefix (`/tr/ozellikler`, `/en/features`)
- Query parameters preserved automatically
- Type-safe pathname checking
- External pathnames converted to internal

---

### 2. Programmatic Navigation

**Import router from routing configuration**:

```typescript
import { useRouter, usePathname } from '@/i18n/routing';

function MyComponent() {
  const router = useRouter();
  const pathname = usePathname();

  // Navigate to different page
  const handleClick = () => {
    router.push('/features');  // Automatically adds locale prefix
  };

  // Replace current route
  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  // Navigate with query parameters
  const handleSearch = (term: string) => {
    router.push({
      pathname: '/features',
      query: { search: term }
    });
  };

  return <button onClick={handleClick}>Go to Features</button>;
}
```

**Router Methods**:
- `router.push(href, options)` - Navigate with history entry
- `router.replace(href, options)` - Navigate without history entry
- `router.back()` - Go back in history
- `router.forward()` - Go forward in history
- `router.refresh()` - Refresh current route

---

### 3. Server-Side Redirects

```typescript
import { redirect } from '@/i18n/routing';

// In Server Components or Route Handlers
export async function SomeServerAction() {
  const isAuthenticated = await checkAuth();

  if (!isAuthenticated) {
    redirect('/login');  // Automatically adds locale prefix
  }
}
```

---

## 🍪 Locale Persistence

### Cookie Strategy

**Cookie Name**: `NEXT_LOCALE`
**Set By**:
1. Language switcher component (client-side)
2. Middleware (server-side, on every request)

**Cookie Configuration**:
```typescript
document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;
```

**Cookie Attributes**:
- `path=/` - Available site-wide
- `max-age=31536000` - 1 year expiration
- `samesite=lax` - CSRF protection

### How It Works

1. **Initial Visit**:
   - User visits without locale preference
   - Middleware checks `NEXT_LOCALE` cookie (not set)
   - Falls back to `Accept-Language` header
   - Redirects to detected/default locale

2. **Language Switch**:
   - User clicks language switcher
   - Component sets `NEXT_LOCALE` cookie
   - Router navigates to new locale
   - Cookie persists across sessions

3. **Return Visit**:
   - User returns to site
   - Middleware reads `NEXT_LOCALE` cookie
   - Redirects to preferred locale automatically

---

## 🎛️ Language Switcher Component

### Current Implementation

**File**: [src/components/ui/language-switcher.tsx](../../src/components/ui/language-switcher.tsx:1)

**Key Features**:
- ✅ Dropdown with all 4 locales (TR, EN, DE, FR)
- ✅ Cookie persistence on locale change
- ✅ Current page preserved with query parameters
- ✅ Loading state during transition
- ✅ Keyboard navigation (Arrow keys, Enter, Escape)
- ✅ Click-outside to close
- ✅ Full accessibility (ARIA attributes)
- ✅ Visual indication of selected language

### Usage

```typescript
import { LanguageSwitcher } from '@/components/ui/language-switcher';

// In navigation or header
<LanguageSwitcher />
```

**Integration Points**:
- [Navigation component](../../src/components/layout/navigation.tsx) - Header
- [Footer component](../../src/components/layout/footer.tsx) - Footer (optional)

---

## 📱 Query Parameter Preservation

### Automatic Preservation

next-intl's router **automatically preserves** query parameters during locale switching:

```typescript
// User is on: /tr/ozellikler?category=ai&sort=popular
// User switches to English
// Result: /en/features?category=ai&sort=popular

// Implementation (handled internally by next-intl)
router.replace(pathname, { locale: 'en' });
// Query parameters automatically preserved
```

### Manual Query Handling

If you need to modify queries during navigation:

```typescript
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';

function SearchComponent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = (term: string) => {
    // Create new URLSearchParams, preserving existing
    const params = new URLSearchParams(searchParams.toString());
    params.set('search', term);

    // Navigate with updated query
    router.push(`${pathname}?${params.toString()}`);
  };
}
```

---

## 🧭 Pathname Utilities

### Getting Current Pathname

```typescript
import { usePathname } from '@/i18n/routing';

function MyComponent() {
  const pathname = usePathname();
  // Returns INTERNAL pathname (e.g., '/features')
  // NOT external locale-specific pathname (e.g., '/tr/ozellikler')

  const isActive = pathname === '/features';

  return (
    <Link
      href="/features"
      className={isActive ? 'active' : ''}
    >
      Features
    </Link>
  );
}
```

**Important**: `usePathname()` returns the internal pathname WITHOUT the locale prefix.

---

## 🔍 SEO Optimization

### HTML Lang Attribute

**File**: [src/app/[locale]/layout.tsx:189](../../src/app/[locale]/layout.tsx#L189)

```typescript
<html lang={locale} suppressHydrationWarning>
```

✅ Dynamically set based on current locale
✅ Helps search engines understand content language
✅ Improves accessibility for screen readers

### Alternate Language Links

**Metadata Configuration**: [src/app/[locale]/layout.tsx:79-102](../../src/app/[locale]/layout.tsx#L79-L102)

```typescript
alternates: {
  canonical: `${baseUrl}/${locale}`,
  languages: {
    'tr': `${baseUrl}/tr`,
    'en': `${baseUrl}/en`,
    'de': `${baseUrl}/de`,
    'fr': `${baseUrl}/fr`
  }
}
```

**Generated HTML**:
```html
<link rel="canonical" href="https://coria.app/tr" />
<link rel="alternate" hreflang="tr" href="https://coria.app/tr" />
<link rel="alternate" hreflang="en" href="https://coria.app/en" />
<link rel="alternate" hreflang="de" href="https://coria.app/de" />
<link rel="alternate" hreflang="fr" href="https://coria.app/fr" />
```

### Open Graph Locale

**Configuration**: [src/app/[locale]/layout.tsx:107](../../src/app/[locale]/layout.tsx#L107)

```typescript
openGraph: {
  locale: locale === 'tr' ? 'tr_TR'
    : locale === 'en' ? 'en_US'
    : locale === 'de' ? 'de_DE'
    : 'fr_FR'
}
```

---

## 🎨 Best Practices

### 1. Always Use Localized Navigation

```typescript
// ✅ CORRECT
import { Link, useRouter } from '@/i18n/routing';

// ❌ WRONG
import Link from 'next/link';
import { useRouter } from 'next/navigation';
```

### 2. Internal Pathnames Only

```typescript
// ✅ CORRECT - Use internal pathnames
<Link href="/features">Features</Link>
<Link href="/pricing">Pricing</Link>

// ❌ WRONG - Don't use localized pathnames
<Link href="/ozellikler">Features</Link>  // Hard-coded Turkish
<Link href="/tr/ozellikler">Features</Link>  // Including locale prefix
```

### 3. Type-Safe Routing

```typescript
// routing.ts exports typed functions
import { Link } from '@/i18n/routing';

// TypeScript will error on invalid pathnames
<Link href="/invalid-route">  // ❌ Type error
<Link href="/features">       // ✅ Valid
```

### 4. Preserve Semantics

```typescript
// When pathname changes meaning in different locales
'/features/barcode-scanning'  // English
'/ozellikler/barkod-tarama'   // Turkish

// next-intl handles this automatically via pathname mappings
```

---

## 🧪 Testing Locale Switching

### E2E Tests

```typescript
// e2e/locale-switching.spec.ts
test('should preserve query params on locale switch', async ({ page }) => {
  await page.goto('/tr/ozellikler?category=ai');

  // Switch to English
  await page.click('[data-testid="locale-selector"]');
  await page.click('[data-testid="locale-option-en"]');

  // Verify URL changed correctly
  await expect(page).toHaveURL('/en/features?category=ai');

  // Verify cookie was set
  const cookies = await page.context().cookies();
  const localeCookie = cookies.find(c => c.name === 'NEXT_LOCALE');
  expect(localeCookie?.value).toBe('en');
});

test('should switch to correct pathname for locale', async ({ page }) => {
  await page.goto('/tr/fiyatlandirma');

  // Switch to German
  await page.click('[data-testid="locale-selector"]');
  await page.click('[data-testid="locale-option-de"]');

  // Verify correct German pathname
  await expect(page).toHaveURL('/de/preise');
});
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Link Not Locale-Aware

**Symptom**: Links go to `/features` instead of `/en/features`

**Cause**: Using `next/link` instead of routing Link

**Solution**:
```typescript
// ❌ WRONG
import Link from 'next/link';

// ✅ CORRECT
import { Link } from '@/i18n/routing';
```

---

### Issue 2: Lost Query Parameters

**Symptom**: Query params disappear after locale switch

**Cause**: Using `window.location` or manual URL construction

**Solution**: Use routing utilities
```typescript
// ❌ WRONG
window.location.href = `/${newLocale}${pathname}`;

// ✅ CORRECT
router.replace(pathname, { locale: newLocale });
```

---

### Issue 3: Hard-Coded Locale Paths

**Symptom**: Turkish paths hard-coded in components

**Cause**: Not using internal pathnames

**Solution**:
```typescript
// ❌ WRONG
<Link href="/ozellikler">Features</Link>

// ✅ CORRECT
<Link href="/features">Features</Link>
```

---

### Issue 4: Cookie Not Persisting

**Symptom**: Locale resets on page refresh

**Cause**: Cookie not set correctly or middleware issue

**Solution**: Verify cookie attributes
```typescript
// Correct cookie format
document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; samesite=lax`;

// Check in DevTools > Application > Cookies
// Should see NEXT_LOCALE with 1 year expiration
```

---

## 📚 Additional Resources

### Internal Documentation
- [I18N Implementation Summary](./I18N_Implementation_Summary.md) - Project overview
- [I18N Coverage Report](./I18N_Coverage_Report.md) - Translation status
- [Hero Section Migration](./Hero_Section_Migration_Report.md) - Component migration example

### next-intl Documentation
- Routing: https://next-intl-docs.vercel.app/docs/routing
- Navigation APIs: https://next-intl-docs.vercel.app/docs/routing/navigation
- Middleware: https://next-intl-docs.vercel.app/docs/routing/middleware

### Next.js Documentation
- Internationalization: https://nextjs.org/docs/app/building-your-application/routing/internationalization
- Metadata: https://nextjs.org/docs/app/building-your-application/optimizing/metadata

---

## ✅ Checklist for Developers

When working with routing and navigation:

- [ ] Import `Link` from `@/i18n/routing`, not `next/link`
- [ ] Import `useRouter`, `usePathname` from `@/i18n/routing`
- [ ] Use internal pathnames (e.g., `/features`, not `/ozellikler`)
- [ ] Let next-intl handle locale prefixes automatically
- [ ] Test locale switching preserves query parameters
- [ ] Verify `NEXT_LOCALE` cookie is set on locale change
- [ ] Check `<html lang={locale}>` updates correctly
- [ ] Add new routes to `pathnames` in routing.ts
- [ ] Update E2E tests for new localized routes

---

**Last Updated**: 2025-10-11
**Status**: ✅ Production Ready
**Locale Support**: TR, EN, DE, FR (4 languages)
