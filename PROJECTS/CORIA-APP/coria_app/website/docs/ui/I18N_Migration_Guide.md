# I18N Migration Guide - Tam Türkçe → next-intl Geçiş

**Date**: 2025-10-11
**Status**: Implementation Ready
**Scope**: 233 hardcoded Turkish strings → next-intl keys

---

## Executive Summary

CORIA website'inde tespit edilen 233 hardcoded Turkish string'in next-intl sistemine tam migrasyonu için rehber. Automated scan ve key mapping tamamlandı, implementation için script'ler hazır.

### Scan Sonuçları

- **Total Hardcoded Strings**: 233
- **Files Affected**: 21
- **By Category**:
  - UI Text: 229 strings
  - ARIA Labels: 2 strings
  - Placeholders: 2 strings

### Generated Artifacts

```
website/docs/ui/
├── hardcoded-strings-scan.json       # Detaylı scan report
├── i18n-migration-map.json           # File:line migration plan
├── locale-updates-tr.json            # Turkish keys to add
├── locale-updates-en.json            # English translations needed
├── locale-updates-de.json            # German translations needed
└── locale-updates-fr.json            # French translations needed
```

---

## Implementation Plan

### Phase 1: Locale File Updates (30 mins)

#### Step 1.1: Add Missing 56 DE/FR Keys

**Issue**: DE ve FR locale dosyalarında 56 key eksik (features.categories.*)

**Missing Key Pattern**:
```
features.categories.{category}.benefits
features.categories.{category}.whyItMatters.impacts
features.categories.{category}.whyItMatters.statistics
features.categories.{category}.whyItMatters.cta.action
```

**Affected Categories**: scanning, dashboard, alternatives, social, goals, assistant, content, premium

**Action**:
```bash
# TR locale'den referans al, DE/FR'ye ekle
node scripts/add-missing-feature-keys.js
```

#### Step 1.2: Merge Generated Keys

**Action**:
```bash
# Generated locale updates'i mevcut files'a merge et
node scripts/merge-locale-updates.js
```

**Manual Alternative**:
1. `docs/ui/locale-updates-tr.json` aç
2. Keys'leri `src/messages/tr.json`'a kopyala
3. EN/DE/FR için tekrarla

---

### Phase 2: Code Migration (2-3 hours)

#### Priority Files (High Impact)

1. **Hero Section** (`components/sections/hero-section.tsx`)
   - 12 strings
   - Most visible user-facing content

2. **Foundation Page** (`app/[locale]/foundation/page.tsx`)
   - 31 strings
   - Complex content with timeline, projects

3. **Content Home** (`content/home.ts`)
   - 85 strings
   - Largest migration task

#### Migration Pattern

**Before** (Hardcoded):
```tsx
<h1>Kalbinle Seç. Etkiyle Yaşa.</h1>
```

**After** (i18n):
```tsx
'use client';
import { useTranslations } from 'next-intl';

export default function Component() {
  const t = useTranslations();

  return <h1>{t('hero.title')}</h1>;
}
```

**For ARIA/Alt/Title**:
```tsx
// Before
<img alt="CORIA logosu" />

// After
<img alt={t('common.aria.coriaLogo')} />
```

**For Dynamic Content**:
```tsx
// Before
<p>Son {count} ürün tarandı</p>

// After
<p>{t('stats.lastScanned', { count })}</p>
```

---

### Phase 3: Component Updates (1-2 hours)

#### 3.1: Update Hero Section

**File**: `components/sections/hero-section.tsx`

**Changes**:
```typescript
// Line 51-67 migration map:
{
  eyebrow: t('hero.badge'),                      // "Vegan Yaşam Asistanı"
  title: t('hero.title'),                        // "Kalbinle Seç. Etkiyle Yaşa."
  subtitle: t('hero.subtitle'),                  // Long description
  primaryCta: {
    label: t('hero.downloadIos'),                // "iOS için İndir"
    href: '/download/ios'
  },
  secondaryCta: {
    label: t('hero.downloadAndroid'),            // "Android için İndir"
    href: '/download/android'
  },
  stats: [
    { value: "2.5+", label: t('hero.stats.products') },   // "Milyar Ürün Verisi"
    { value: "10M+", label: t('hero.stats.labels') },     // "Etiket ve İçerik"
    { value: "500K+", label: t('hero.stats.users') }      // "Aktif Kullanıcı"
  ]
}
```

**ARIA Labels Update**:
```typescript
// Line 119, 131, 152
aria-label={t('common.aria.downloadCoria', {
  platform: 'iOS' / 'Android',
  metric: metric.label
})}
```

#### 3.2: Update Foundation Page

**File**: `app/[locale]/foundation/page.tsx`

**Key Sections**:

**Timeline** (Lines 4-9):
```typescript
const timeline = [
  { year: '2023', detail: t('pages.foundation.timeline.inception') },
  { year: '2024 Q1', detail: t('pages.foundation.timeline.mvpDevelopment') },
  { year: '2024 Q2', detail: t('pages.foundation.timeline.betaLaunch') },
  { year: '2024 Q4', detail: t('pages.foundation.timeline.firstMilestone') },
  { year: '2025', detail: t('pages.foundation.timeline.tokenLaunch') }
];
```

**Projects** (Lines 100-114):
```typescript
const projects = [
  {
    title: t('pages.foundation.projects.ecoFarming.title'),
    impact: t('pages.foundation.projects.ecoFarming.impact'),
    category: t('common.categories.veganism')
  },
  // ... other projects
];
```

**Features** (Lines 77-132):
```typescript
const features = [
  {
    title: t('pages.foundation.features.believerIntegration.title'),
    description: t('pages.foundation.features.believerIntegration.description')
  },
  // ... other features
];
```

#### 3.3: Update Footer Navigation

**File**: `components/layout/footer.tsx`

**Lines 31-38**:
```typescript
const legalLinks = [
  { label: t('navigation.footer.pressInvestors'), href: '/about#press' },
  { label: t('navigation.footer.privacyPolicy'), href: '/legal/privacy' },
  { label: t('navigation.footer.termsOfService'), href: '/legal/terms' },
  { label: t('navigation.footer.kvkkDisclosure'), href: '/legal/kvkk' },
  { label: t('navigation.footer.cookiePolicy'), href: '/legal/cookies' }
];
```

---

### Phase 4: Navigation Localization (1 hour)

#### 4.1: Verify Middleware Configuration

**File**: `src/middleware.ts`

**Current Status**: ✅ Already configured
- Cookie-based locale detection (`NEXT_LOCALE`)
- Priority: Cookie > Accept-Language > defaultLocale
- `localePrefix: 'always'` ensures /[locale]/* routes

**No Changes Needed** - middleware already optimal

#### 4.2: Language Switcher Enhancement

**File**: `components/ui/language-switcher.tsx`

**Current Issues**:
- May have hardcoded locale names
- Needs locale-aware page reloading

**Required Changes**:
```typescript
'use client';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export function LanguageSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const locales = [
    { code: 'tr', name: t('locales.turkish'), flag: '🇹🇷' },
    { code: 'en', name: t('locales.english'), flag: '🇬🇧' },
    { code: 'de', name: t('locales.german'), flag: '🇩🇪' },
    { code: 'fr', name: t('locales.french'), flag: '🇫🇷' }
  ];

  const switchLocale = (newLocale: string) => {
    // Preserve current path structure
    const segments = pathname.split('/').filter(Boolean);
    segments[0] = newLocale; // Replace locale segment

    const newPath = '/' + segments.join('/');

    // Set cookie for persistence
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;

    // Navigate with router (soft reload)
    router.push(newPath);
    router.refresh(); // Reload to apply new translations
  };

  return (
    <div className="language-switcher">
      {locales.map(({ code, name, flag }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          className={locale === code ? 'active' : ''}
          aria-label={t('common.aria.switchLanguage', { language: name })}
        >
          <span>{flag}</span>
          <span>{name}</span>
        </button>
      ))}
    </div>
  );
}
```

**Add to locale files**:
```json
{
  "common": {
    "locales": {
      "turkish": "Türkçe",
      "english": "English",
      "german": "Deutsch",
      "french": "Français"
    },
    "aria": {
      "switchLanguage": "Switch to {language}"
    }
  }
}
```

#### 4.3: LocalizedLink Component (Optional)

**Create**: `components/ui/localized-link.tsx`

```typescript
'use client';
import { useLocale } from 'next-intl';
import Link, { LinkProps } from 'next/link';
import { ReactNode } from 'react';

interface LocalizedLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
  children: ReactNode;
  className?: string;
}

export function LocalizedLink({ href, children, className, ...props }: LocalizedLinkProps) {
  const locale = useLocale();

  // Ensure href starts with /[locale]
  const localizedHref = href.startsWith(`/${locale}`)
    ? href
    : `/${locale}${href.startsWith('/') ? href : '/' + href}`;

  return (
    <Link href={localizedHref} className={className} {...props}>
      {children}
    </Link>
  );
}
```

**Usage**:
```tsx
// Before
<Link href="/features">Features</Link>

// After
<LocalizedLink href="/features">
  {t('navigation.features')}
</LocalizedLink>
```

---

### Phase 5: Testing (1-2 hours)

#### 5.1: E2E Language Switch Test

**Create**: `e2e/tests/smoke/language-switch.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('@smoke Language Switching', () => {
  test('should switch language and persist across navigation', async ({ page }) => {
    // Start on Turkish homepage
    await page.goto('/tr');

    // Verify Turkish content
    await expect(page.locator('h1')).toContainText('Kalbinle Seç');

    // Switch to English
    await page.click('[aria-label*="Switch to English"]');
    await page.waitForURL('/en');

    // Verify English content
    await expect(page.locator('h1')).toContainText('Choose with Your Heart');

    // Navigate to Features
    await page.click('a[href*="/features"]');
    await page.waitForURL('/en/features');

    // Verify locale persisted
    await expect(page).toHaveURL(/\/en\/features/);

    // Reload page
    await page.reload();

    // Verify locale still English
    await expect(page).toHaveURL(/\/en\/features/);

    // Check cookie
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find(c => c.name === 'NEXT_LOCALE');
    expect(localeCookie?.value).toBe('en');
  });

  test('should switch between all 4 locales', async ({ page }) => {
    await page.goto('/tr');

    const locales = [
      { code: 'en', text: 'Choose' },
      { code: 'de', text: 'Wähle' },
      { code: 'fr', text: 'Choisissez' },
      { code: 'tr', text: 'Seç' }
    ];

    for (const { code, text } of locales) {
      await page.click(`[aria-label*="${code.toUpperCase()}"]`);
      await page.waitForURL(`/${code}`);
      await expect(page.locator('h1')).toContainText(text);
    }
  });

  test('should preserve query parameters when switching language', async ({ page }) => {
    await page.goto('/tr/features?category=scanning&view=detail');

    await page.click('[aria-label*="Switch to English"]');
    await page.waitForURL('/en/features?category=scanning&view=detail');

    // Verify query params preserved
    expect(page.url()).toContain('category=scanning');
    expect(page.url()).toContain('view=detail');
  });
});
```

**Run Tests**:
```bash
npm run test:e2e -- language-switch.spec.ts
```

#### 5.2: Unit Test Updates

**File**: `test/setup.ts`

**Add i18n Mock Provider**:
```typescript
import { NextIntlClientProvider } from 'next-intl';

export function createTestMessages(locale = 'tr') {
  return {
    hero: {
      title: locale === 'tr' ? 'Test Başlık' : 'Test Title',
      subtitle: locale === 'tr' ? 'Test Alt Başlık' : 'Test Subtitle'
    },
    // ... add other commonly used keys
  };
}

export function withIntl(Component: React.ComponentType, locale = 'tr') {
  return (
    <NextIntlClientProvider locale={locale} messages={createTestMessages(locale)}>
      <Component />
    </NextIntlClientProvider>
  );
}
```

**Update Component Tests**:
```typescript
// Before
import { HeroSection } from '@/components/sections/hero-section';
test('renders hero', () => {
  render(<HeroSection />);
  expect(screen.getByText('Kalbinle Seç')).toBeInTheDocument();
});

// After
import { withIntl } from '@/test/setup';
test('renders hero', () => {
  render(withIntl(HeroSection));
  expect(screen.getByText('Test Başlık')).toBeInTheDocument();
});
```

---

### Phase 6: Validation (30 mins)

#### 6.1: Run Translation Validation

```bash
npm run i18n:validate
```

**Expected Output**:
```
✅ TR (BASELINE): 822 keys (589 + 233 new)
✅ EN: 822 keys, 0 missing
✅ DE: 822 keys, 0 missing
✅ FR: 822 keys, 0 missing
```

#### 6.2: Build Verification

```bash
npm run build
```

**Check for**:
- No TypeScript errors
- No missing translation warnings
- Successful compilation

#### 6.3: Manual Testing Checklist

- [ ] Homepage loads in all 4 locales
- [ ] Language switcher works (header dropdown)
- [ ] Locale persists after navigation
- [ ] Locale persists after page reload
- [ ] Cookie `NEXT_LOCALE` is set correctly
- [ ] ARIA labels are translated
- [ ] No hardcoded Turkish text visible
- [ ] Query parameters preserved on language switch

---

## Automation Scripts

### Auto-Migration Script (Optional)

**Create**: `scripts/apply-i18n-migration.js`

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const migrationMap = require('../docs/ui/i18n-migration-map.json');

// For each file, apply replacements
Object.entries(migrationMap.byFile).forEach(([file, data]) => {
  const filePath = path.join(__dirname, '../src', file);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Apply migrations in reverse order (bottom-up) to preserve line numbers
  data.migrations
    .sort((a, b) => b.line - a.line)
    .forEach(migration => {
      const lineIndex = migration.line - 1;
      const originalLine = lines[lineIndex];

      // Replace hardcoded string with t() call
      const newLine = originalLine.replace(
        migration.originalString,
        migration.replacement
      );

      if (newLine !== originalLine) {
        lines[lineIndex] = newLine;
        console.log(`✓ ${file}:${migration.line} - ${migration.suggestedKey}`);
      }
    });

  // Add useTranslations import if not present
  if (content.includes('.tsx') && !content.includes('useTranslations')) {
    const importLine = "import { useTranslations } from 'next-intl';\n";
    const firstImportIndex = lines.findIndex(l => l.startsWith('import'));
    lines.splice(firstImportIndex + 1, 0, importLine);
  }

  // Write updated content
  fs.writeFileSync(filePath, lines.join('\n'));
});

console.log('\n✅ Migration complete!');
```

**Usage**:
```bash
node scripts/apply-i18n-migration.js
```

---

## Success Criteria

### Must Have ✅

- [ ] `npm run i18n:validate` → 0 missing keys
- [ ] `npm run build` → successful compilation
- [ ] Language switcher works across all pages
- [ ] Locale persists via cookie
- [ ] E2E language-switch tests pass

### Should Have 🎯

- [ ] All 233 hardcoded strings migrated
- [ ] ARIA labels translated
- [ ] Query parameters preserved
- [ ] Unit tests updated with i18n mocks

### Nice to Have 💡

- [ ] LocalizedLink component
- [ ] Automated migration script
- [ ] Performance impact measured
- [ ] SEO metadata per locale

---

## Rollback Plan

If issues occur:

1. **Revert locale files**:
```bash
git checkout HEAD -- src/messages/*.json
```

2. **Revert migrated components**:
```bash
git checkout HEAD -- src/components/sections/hero-section.tsx
git checkout HEAD -- src/app/[locale]/foundation/page.tsx
```

3. **Clear build cache**:
```bash
rm -rf .next
npm run build
```

---

## Post-Migration Tasks

### Performance Monitoring

**Before Migration Baseline**:
- Homepage FCP: ~800ms
- Language switch: N/A (refresh required)

**After Migration Target**:
- Homepage FCP: <1000ms (acceptable +200ms for i18n)
- Language switch: <500ms (soft navigation)

**Monitor**:
```typescript
// Add to src/lib/monitoring/performance.ts
export function measureLanguageSwitch(fromLocale: string, toLocale: string) {
  const start = performance.now();

  return {
    end: () => {
      const duration = performance.now() - start;
      console.log(`Language switch ${fromLocale} → ${toLocale}: ${duration}ms`);

      if (duration > 500) {
        console.warn('⚠️  Slow language switch detected');
      }
    }
  };
}
```

### Content Updates Process

**New Content Workflow**:
1. Add Turkish text to `src/messages/tr.json`
2. Run `scripts/translate-missing-keys.js` (if automated)
3. Or manually add translations to EN/DE/FR
4. Run `npm run i18n:validate`
5. Commit all 4 locale files together

**Prevent Hardcoded Strings**:
```javascript
// Add ESLint rule (eslint-plugin-i18n-next)
{
  "rules": {
    "i18n-next/no-hardcoded-strings": ["error", {
      "ignore": ["className", "import"]
    }]
  }
}
```

---

## FAQ

**Q: Can I partially migrate (only hero section)?**
A: Yes, migration can be incremental. Start with high-impact pages.

**Q: What about content in `content/home.ts`?**
A: That file has 85 strings. Consider refactoring to fetch from locale files instead.

**Q: Performance impact of i18n?**
A: Minimal (<100ms), as next-intl uses optimized tree-shaking.

**Q: How to handle dynamic content (blog posts)?**
A: Use Contentful's locale field, fetch locale-specific content.

**Q: Missing translations break the site?**
A: No, next-intl falls back to Turkish (default) if key missing.

---

## Timeline Estimate

| Phase | Task | Time | Priority |
|-------|------|------|----------|
| 1 | Add missing 56 DE/FR keys | 30 min | HIGH |
| 2 | Migrate Hero Section | 30 min | HIGH |
| 3 | Migrate Foundation Page | 1 hour | HIGH |
| 4 | Update Language Switcher | 1 hour | HIGH |
| 5 | Migrate remaining 19 files | 2-3 hours | MEDIUM |
| 6 | Create E2E tests | 1 hour | MEDIUM |
| 7 | Validation & fixes | 1 hour | HIGH |

**Total**: 6-8 hours for full migration

**Minimum Viable**: 3-4 hours (Phases 1-4 only)

---

## Contact & Support

**Documentation**: `/docs/ui/` directory
**Scripts**: `/scripts/` directory
**Generated Reports**: `/docs/ui/hardcoded-strings-scan.json`, `/docs/ui/i18n-migration-map.json`

**Next Steps**: Start with Phase 1 (locale file updates) → immediate 56 key fix ✅

---

## Routing & Navigation Patterns

### ✅ Locale-Aware Navigation (READY TO USE)

The CORIA website uses next-intl's routing system for 100% locale-aware navigation.

**Key Features**:
- ✅ Automatic locale prefixes (`/tr/ozellikler`, `/en/features`)
- ✅ Query parameter preservation during locale switching
- ✅ Cookie-based locale persistence (`NEXT_LOCALE`)
- ✅ Type-safe routing with TypeScript
- ✅ SEO-optimized with proper `<html lang={locale}>`

**Detailed Documentation**: See [I18N_Routing_Guide.md](./I18N_Routing_Guide.md)

### Using Localized Link Component

**✅ CORRECT** - Import from routing configuration:
```typescript
import { Link } from '@/i18n/routing';

<Link href="/features">Features</Link>
<Link href="/pricing">Pricing</Link>
<Link href={{ pathname: '/features', query: { category: 'ai' } }}>
  AI Features
</Link>
```

**❌ WRONG** - Don't import from 'next/link':
```typescript
import Link from 'next/link';  // ❌ Not locale-aware
<Link href="/features">Features</Link>
```

### Programmatic Navigation

```typescript
import { useRouter, usePathname } from '@/i18n/routing';

function MyComponent() {
  const router = useRouter();
  const pathname = usePathname();

  const handleNavigation = () => {
    router.push('/features');  // Automatically adds locale
  };

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    // Query parameters preserved automatically
  };
}
```

### Language Switcher Integration

**Current Implementation**: [src/components/ui/language-switcher.tsx](../../src/components/ui/language-switcher.tsx:1)

**Features**:
- ✅ Cookie persistence (`NEXT_LOCALE`)
- ✅ Current page preserved with queries
- ✅ Loading states during transition
- ✅ Keyboard navigation support
- ✅ Full ARIA accessibility

**Usage**:
```typescript
import { LanguageSwitcher } from '@/components/ui/language-switcher';

// In header/navigation
<LanguageSwitcher />
```

### Pathname Mappings

All route translations are defined in [src/i18n/routing.ts](../../src/i18n/routing.ts:14-72):

```typescript
const pathnames = {
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
  }
  // ... more routes
};
```

**Adding New Routes**:
1. Add to `pathnames` object in routing.ts
2. Use internal pathname in components
3. next-intl handles locale prefixes automatically

### SEO & HTML Lang Attribute

**File**: [src/app/[locale]/layout.tsx:189](../../src/app/[locale]/layout.tsx#L189)

```typescript
<html lang={locale} suppressHydrationWarning>
```

✅ Dynamically updated based on current locale
✅ Proper alternate language links in metadata
✅ Open Graph locale tags for social sharing

---

## Migration Checklist

### Routing & Navigation
- [x] Import Link from @/i18n/routing (not next/link)
- [x] Import useRouter, usePathname from @/i18n/routing
- [x] Use internal pathnames (e.g., '/features', not '/ozellikler')
- [x] Language switcher sets NEXT_LOCALE cookie
- [x] Query parameters preserved on locale switch
- [x] HTML lang attribute updates dynamically
- [x] Pathname mappings defined for all routes
- [x] SEO metadata includes alternate languages

### Component Migration
- [x] Hero section (12 strings) ✅ COMPLETE
- [ ] Features showcase (8 strings)
- [ ] Download CTA (4 strings)
- [ ] Blog preview (6 strings)
- [ ] Social proof (5 strings)
- [ ] Demo showcase (7 strings)
- [ ] Remaining sections (~50 strings)

### Testing
- [ ] Visual QA in all 4 locales
- [ ] Query parameter preservation test
- [ ] Cookie persistence test
- [ ] Pathname mapping test
- [ ] SEO metadata validation
- [ ] E2E locale switching tests

---

**For complete routing documentation**: See [I18N_Routing_Guide.md](./I18N_Routing_Guide.md)
