# Sprint 7 Backlog: E2E Testing, Component Coverage & CI/CD Pipeline

**Sprint Duration**: October 11-14, 2025 (4 days)
**Story Points**: 47 SP
**Estimated Effort**: 32.5 hours
**Team**: 1 developer (Full-stack + QA focus)
**Status**: 📋 **PLANNED** (Ready for execution)

---

## 🎯 Sprint Goals

1. **E2E Test Coverage**: Validate critical user journeys with Playwright (8 coverage areas)
2. **Component Test Completion**: Achieve ≥85% coverage for remaining UI components
3. **CI/CD Automation**: Implement 5-stage quality pipeline with automated gates

**Sprint 7 Value**: Production-ready quality assurance through automated E2E validation, complete component coverage, and CI/CD quality enforcement.

---

## 📊 Sprint Overview

| Epic | Story Points | Tasks | Estimated Hours |
|------|--------------|-------|-----------------|
| Epic 1: E2E Test Infrastructure & User Flows | 20 SP | 5 | 15.5h |
| Epic 2: Component Test Coverage Completion | 15 SP | 4 | 8.5h |
| Epic 3: CI/CD Pipeline & Quality Gates | 12 SP | 4 | 8.5h |
| **Total** | **47 SP** | **13** | **32.5h** |

---

## 🚀 Epic 1: E2E Test Infrastructure & Core User Flows (20 SP)

**Goal**: Establish Playwright testing infrastructure and validate critical user journeys

### Task 1.1: Playwright Setup & Configuration ⚙️
**Story Points**: 3 SP
**Estimated Time**: 2 hours
**Priority**: 🔴 CRITICAL (Blocker for all E2E work)

**Acceptance Criteria**:
- [x] Install `@playwright/test` dependency (latest stable)
- [x] Create `playwright.config.ts` with multi-browser support (chromium, firefox, webkit)
- [x] Configure base URL, timeouts, screenshot/video capture
- [x] Setup `e2e/` directory structure (tests/, fixtures/, page-objects/)
- [x] Verify Playwright installation with sample test

**Deliverables**:
- `playwright.config.ts` (browser configs, retry logic, reporters)
- `e2e/` directory structure
- `e2e/example.spec.ts` (verification test)

**Configuration Example**:
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### Task 1.2: E2E Test Fixtures & Utilities 🧰
**Story Points**: 2 SP
**Estimated Time**: 1.5 hours
**Priority**: 🟡 HIGH

**Acceptance Criteria**:
- [x] Create authenticated user fixture (pre-login state)
- [x] Create guest user fixture (unauthenticated state)
- [x] Locale switching helpers (`changeLocale`, `verifyTranslation`)
- [x] Theme toggle helpers (`switchTheme`, `verifyThemeApplied`)
- [x] Custom assertions (`toHaveAccessibleName`, `toBeVisibleInViewport`)

**Deliverables**:
- `e2e/fixtures/index.ts` (authenticated/guest user fixtures)
- `e2e/utils/helpers.ts` (locale, theme, assertion helpers)

**Example Fixture**:
```typescript
// e2e/fixtures/index.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedUser: async ({ page }, use) => {
    // Pre-login with mock token
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token-12345');
      localStorage.setItem('user', JSON.stringify({
        email: 'test@coria.app',
        name: 'Test User'
      }));
    });
    await page.goto('/dashboard');
    await use(page);
  },
});
```

---

### Task 1.3: Page Object Models (POMs) 📄
**Story Points**: 4 SP
**Estimated Time**: 3 hours
**Priority**: 🟡 HIGH

**Acceptance Criteria**:
- [x] HomePage POM: navigation, hero section, CTA buttons
- [x] ScannerPage POM: camera access, barcode detection
- [x] ProfilePage POM: user stats, settings, premium features
- [x] BlogPage POM: article listing, pagination, search, filters
- [x] PricingPage POM: plan comparison, feature toggles, CTAs

**Deliverables**:
- `e2e/page-objects/home.page.ts`
- `e2e/page-objects/scanner.page.ts`
- `e2e/page-objects/profile.page.ts`
- `e2e/page-objects/blog.page.ts`
- `e2e/page-objects/pricing.page.ts`

**Example POM**:
```typescript
// e2e/page-objects/home.page.ts
import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heroHeading: Locator;
  readonly iosCtaButton: Locator;
  readonly androidCtaButton: Locator;
  readonly bottomNav: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroHeading = page.locator('h1');
    this.iosCtaButton = page.locator('[aria-label*="iOS"]');
    this.androidCtaButton = page.locator('[aria-label*="Android"]');
    this.bottomNav = page.locator('nav[aria-label="Bottom navigation"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickIosCta() {
    await this.iosCtaButton.click();
  }

  async navigateToScanner() {
    await this.bottomNav.locator('[aria-label="Scanner"]').click();
  }
}
```

---

### Task 1.4: Smoke Test Suite - Critical User Journeys 🔥
**Story Points**: 5 SP
**Estimated Time**: 4 hours
**Priority**: 🔴 CRITICAL (Must pass 100%)

**Test Coverage** (15 tests):
1. **Authentication** (3 tests):
   - Email login flow (happy path)
   - Google OAuth flow (mocked)
   - Session persistence after reload

2. **Navigation** (4 tests):
   - Bottom navigation: all tabs accessible
   - Deep link navigation (blog article)
   - Back navigation (browser back button)
   - 404 handling (invalid routes)

3. **i18n** (4 tests):
   - Locale switching: TR → EN → DE → FR
   - Locale persistence across navigation
   - RTL support verification (future: Arabic)
   - Translation completeness (no key leakage)

4. **Theme** (2 tests):
   - Theme toggle: Light → Dark → Light
   - Theme preference persistence

5. **Scanner** (2 tests):
   - Camera access permission
   - Barcode scan simulation

**Deliverables**:
- `e2e/tests/smoke/auth-flow.spec.ts`
- `e2e/tests/smoke/navigation.spec.ts`
- `e2e/tests/smoke/i18n.spec.ts`
- `e2e/tests/smoke/theme.spec.ts`
- `e2e/tests/smoke/scanner.spec.ts`
- `e2e/tests/smoke/README.md` (scenario documentation)

**Example Test**:
```typescript
// e2e/tests/smoke/auth-flow.spec.ts
import { test, expect } from '@playwright/test';

test('Email login flow', async ({ page }) => {
  await page.goto('/');
  await page.click('[aria-label="Login"]');
  await page.fill('input[type="email"]', 'test@coria.app');
  await page.fill('input[type="password"]', 'SecurePass123');
  await page.click('button[type="submit"]');

  // Verify successful login
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  await expect(page.locator('h1')).toContainText('Hoş Geldin');
});

test('Session persistence after reload', async ({ page }) => {
  // Login first
  await page.goto('/');
  await page.click('[aria-label="Login"]');
  await page.fill('input[type="email"]', 'test@coria.app');
  await page.fill('input[type="password"]', 'SecurePass123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');

  // Reload page
  await page.reload();

  // Verify still authenticated
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

---

### Task 1.5: Regression Test Suite - Comprehensive Coverage 🔄
**Story Points**: 6 SP
**Estimated Time**: 5 hours
**Priority**: 🟢 MEDIUM (Can defer some tests)

**Test Coverage** (18 tests):
1. **Forms** (3 tests):
   - Contact form: required fields, email validation, success message
   - Newsletter signup: duplicate check, confirmation email
   - Search: debouncing, empty state, results rendering

2. **Blog** (3 tests):
   - Article listing: pagination (prev/next)
   - Category filtering: select category, verify filtered results
   - Article detail: navigation, related posts, social sharing

3. **Pricing** (3 tests):
   - Plan comparison: feature matrix rendering
   - Plan selection: monthly/annual toggle
   - CTA interactions: "Get Started" buttons

4. **PWA** (2 tests):
   - Offline mode: service worker registration, cached pages
   - Install prompt: A2HS banner, install flow

5. **Accessibility** (4 tests):
   - Keyboard navigation: tab order, focus indicators
   - Screen reader: ARIA labels, landmark regions
   - Color contrast: WCAG AA compliance
   - Focus management: modal traps, skip links

6. **Performance** (3 tests):
   - Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1
   - Image loading: lazy loading, responsive images
   - Font loading: FOUT prevention, preload

**Deliverables**:
- `e2e/tests/regression/forms.spec.ts`
- `e2e/tests/regression/blog.spec.ts`
- `e2e/tests/regression/pricing.spec.ts`
- `e2e/tests/regression/pwa.spec.ts`
- `e2e/tests/regression/accessibility.spec.ts`
- `e2e/tests/regression/performance.spec.ts`
- `e2e/tests/regression/README.md` (scenario documentation)

**Example Test**:
```typescript
// e2e/tests/regression/forms.spec.ts
import { test, expect } from '@playwright/test';

test('Contact form validation', async ({ page }) => {
  await page.goto('/contact');

  // Submit empty form
  await page.click('button[type="submit"]');
  await expect(page.locator('[role="alert"]')).toContainText('Name is required');

  // Fill with invalid email
  await page.fill('input[name="name"]', 'John Doe');
  await page.fill('input[name="email"]', 'invalid-email');
  await page.click('button[type="submit"]');
  await expect(page.locator('[role="alert"]')).toContainText('Invalid email');

  // Submit valid form
  await page.fill('input[name="email"]', 'john@example.com');
  await page.fill('textarea[name="message"]', 'Test message');
  await page.click('button[type="submit"]');
  await expect(page.locator('[role="status"]')).toContainText('Message sent successfully');
});
```

---

## 🧪 Epic 2: Component Test Coverage Completion (15 SP)

**Goal**: Achieve ≥85% test coverage for remaining UI components

### Task 2.1: Container Component Tests 📦
**Story Points**: 4 SP
**Estimated Time**: 2.5 hours
**Priority**: 🟡 HIGH

**Test Scenarios** (8+ cases):
- Size variants: sm, md, lg, xl (4 tests)
- Padding variants: none, sm, md, lg (4 tests)
- Responsive behavior: mobile, tablet, desktop breakpoints (3 tests)
- Semantic HTML: renders correct element (article, section, div) (3 tests)
- Accessibility: ARIA regions, landmarks (2 tests)
- Children rendering: complex nested content (2 tests)

**Target Coverage**: ≥85%

**Deliverable**: `src/test/components/ui/container.test.tsx`

**Example Tests**:
```typescript
// src/test/components/ui/container.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from '@/components/ui';

describe('Container Component', () => {
  it('renders with default size (md)', () => {
    render(<Container>Content</Container>);
    expect(screen.getByText('Content')).toHaveClass('max-w-4xl');
  });

  it('renders all size variants', () => {
    const { rerender } = render(<Container size="sm">Content</Container>);
    expect(screen.getByText('Content')).toHaveClass('max-w-2xl');

    rerender(<Container size="lg">Content</Container>);
    expect(screen.getByText('Content')).toHaveClass('max-w-6xl');

    rerender(<Container size="xl">Content</Container>);
    expect(screen.getByText('Content')).toHaveClass('max-w-7xl');
  });

  it('applies padding variants', () => {
    const { rerender } = render(<Container padding="none">Content</Container>);
    expect(screen.getByText('Content')).toHaveClass('px-0');

    rerender(<Container padding="sm">Content</Container>);
    expect(screen.getByText('Content')).toHaveClass('px-4');

    rerender(<Container padding="lg">Content</Container>);
    expect(screen.getByText('Content')).toHaveClass('px-8');
  });

  it('renders as different semantic elements', () => {
    const { rerender } = render(<Container as="article">Content</Container>);
    expect(screen.getByRole('article')).toBeInTheDocument();

    rerender(<Container as="section">Content</Container>);
    expect(screen.getByRole('region')).toBeInTheDocument();
  });

  it('handles responsive breakpoints', () => {
    render(<Container size="sm" className="lg:max-w-7xl">Content</Container>);
    const element = screen.getByText('Content');
    expect(element).toHaveClass('max-w-2xl', 'lg:max-w-7xl');
  });

  it('has proper accessibility landmarks', () => {
    render(<Container as="section" aria-label="Main content">Content</Container>);
    const element = screen.getByRole('region', { name: 'Main content' });
    expect(element).toBeInTheDocument();
  });
});
```

---

### Task 2.2: Grid Component Tests 📐
**Story Points**: 5 SP
**Estimated Time**: 3 hours
**Priority**: 🟡 HIGH

**Test Scenarios** (10+ cases):
- Column variants: 1-12 cols across breakpoints (6 tests)
- Gap variants: none, xs, sm, md, lg, xl (6 tests)
- Responsive grid: col changes at breakpoints (4 tests)
- Auto-fit/auto-fill behavior (2 tests)
- Alignment: justify, align items (4 tests)
- Nested grids: grid within grid (2 tests)

**Target Coverage**: ≥85%

**Deliverable**: `src/test/components/ui/grid.test.tsx`

**Example Tests**:
```typescript
// src/test/components/ui/grid.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Grid } from '@/components/ui';

describe('Grid Component', () => {
  it('renders with default 1 column', () => {
    render(<Grid>Content</Grid>);
    expect(screen.getByText('Content')).toHaveClass('grid-cols-1');
  });

  it('renders all column variants', () => {
    const { rerender } = render(<Grid cols={3}>Content</Grid>);
    expect(screen.getByText('Content')).toHaveClass('grid-cols-3');

    rerender(<Grid cols={12}>Content</Grid>);
    expect(screen.getByText('Content')).toHaveClass('grid-cols-12');
  });

  it('applies gap variants', () => {
    const { rerender } = render(<Grid gap="none">Content</Grid>);
    expect(screen.getByText('Content')).toHaveClass('gap-0');

    rerender(<Grid gap="md">Content</Grid>);
    expect(screen.getByText('Content')).toHaveClass('gap-4');

    rerender(<Grid gap="xl">Content</Grid>);
    expect(screen.getByText('Content')).toHaveClass('gap-8');
  });

  it('handles responsive column changes', () => {
    render(
      <Grid cols={1} className="md:grid-cols-2 lg:grid-cols-4">
        Content
      </Grid>
    );
    const element = screen.getByText('Content');
    expect(element).toHaveClass('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
  });

  it('renders nested grids correctly', () => {
    render(
      <Grid cols={2} data-testid="outer-grid">
        <Grid cols={2} data-testid="inner-grid">
          Nested Content
        </Grid>
      </Grid>
    );
    expect(screen.getByTestId('outer-grid')).toHaveClass('grid-cols-2');
    expect(screen.getByTestId('inner-grid')).toHaveClass('grid-cols-2');
  });

  it('applies alignment utilities', () => {
    render(
      <Grid cols={3} className="justify-items-center items-center">
        Content
      </Grid>
    );
    const element = screen.getByText('Content');
    expect(element).toHaveClass('justify-items-center', 'items-center');
  });
});
```

---

### Task 2.3: Heading Component Tests 📝
**Story Points**: 3 SP
**Estimated Time**: 1.5 hours
**Priority**: 🟡 HIGH

**Test Scenarios** (6+ cases):
- Semantic levels: h1-h6 with 'as' prop (6 tests)
- Size variants: sm, md, lg, xl, 2xl, 3xl, 4xl (7 tests)
- Weight variants: normal, medium, semibold, bold (4 tests)
- Gradient text: bg-clip-text with gradient (2 tests)
- Accessibility: aria-level matches semantic (3 tests)

**Target Coverage**: ≥85%

**Deliverable**: `src/test/components/ui/heading.test.tsx`

---

### Task 2.4: Text Component Tests 📄
**Story Points**: 3 SP
**Estimated Time**: 1.5 hours
**Priority**: 🟡 HIGH

**Test Scenarios** (6+ cases):
- Size variants: xs, sm, base, lg, xl, 2xl (6 tests)
- Color variants: default, muted, accent, error (4 tests)
- Weight variants: normal, medium, semibold, bold (4 tests)
- Semantic variants: p, span, div, label (4 tests)
- Accessibility: proper role and semantics (2 tests)

**Target Coverage**: ≥85%

**Deliverable**: `src/test/components/ui/text.test.tsx`

---

## ⚙️ Epic 3: CI/CD Pipeline & Quality Gates (12 SP)

**Goal**: Automate quality enforcement with 5-stage CI/CD pipeline

### Task 3.1: GitHub Actions Workflow Configuration 🔧
**Story Points**: 4 SP
**Estimated Time**: 3 hours
**Priority**: 🔴 CRITICAL

**Acceptance Criteria**:
- [x] Create `.github/workflows/ci.yml` with 5 parallel jobs
- [x] Job 1: Lint & Type Check (ESLint + TypeScript strict)
- [x] Job 2: Unit Tests (Vitest with v8 coverage)
- [x] Job 3: E2E Smoke Tests (Playwright critical flows only)
- [x] Job 4: i18n Validation (missing keys check)
- [x] Job 5: Build Verification (production build)
- [x] Setup Node.js caching (npm, playwright browsers)
- [x] Configure test artifacts upload (coverage reports, screenshots)
- [x] **Enhanced E2E Smoke Job** (CI Quality Gate Update):
  - [x] Add environment variables (CI=true, BASE_URL) for Playwright config
  - [x] Configure retry strategy (2 retries via process.env.CI)
  - [x] Enable trace capture on first retry (on-first-retry mode)
  - [x] Configure video recording (retain-on-failure only)
  - [x] Add production build step for stable performance (<2 min target)
  - [x] Upload enhanced artifacts (traces, videos, screenshots)
  - [x] Add flakiness triage link on failure
  - [x] Document in CI_CD_Pipeline_Guide.md
  - [x] Create ci_e2e_smoke_patch.yml reference configuration

**Deliverable**: `.github/workflows/ci.yml`

**Pipeline Architecture**:
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests

  e2e-smoke:
    name: E2E Smoke Tests
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      - run: npm run test:e2e:smoke
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

  i18n-validation:
    name: i18n Validation
    runs-on: ubuntu-latest
    timeout-minutes: 3
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run validate:i18n

  build:
    name: Production Build
    runs-on: ubuntu-latest
    timeout-minutes: 10
    needs: [lint, unit-tests, i18n-validation]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: .next/
          retention-days: 3
```

**Performance Target**: Pipeline completes in <8 minutes (parallel execution)

---

### Task 3.2: Quality Gate Definitions 🚦
**Story Points**: 3 SP
**Estimated Time**: 2 hours
**Priority**: 🔴 CRITICAL

**Quality Gates** (all must pass):

1. **Gate 1: Code Quality**
   - Zero ESLint errors
   - Zero TypeScript errors
   - No unused variables/imports

2. **Gate 2: Test Success**
   - 100% unit test success rate (238 tests passing)
   - 100% E2E smoke test success rate (15 tests passing)
   - No flaky tests (max 2 retries allowed)

3. **Gate 3: Coverage**
   - Overall coverage ≥60% (with exceptions for non-MVP)
   - Critical modules (lib/*, components/ui/*) ≥80%
   - No coverage regressions (must maintain Sprint 6 levels)

4. **Gate 4: i18n Integrity**
   - Zero missing keys across all 4 locales (tr, en, de, fr)
   - Zero empty translation values
   - Zero key leakage (untranslated keys)

5. **Gate 5: Build Success**
   - Production build completes without errors
   - Build size within budget (<500KB initial JS)
   - No console warnings in build output

**Deliverable**: `docs/ui/CI_CD_Quality_Gates.md`

**Gate Enforcement**: PR cannot merge if any gate fails

---

### Task 3.3: Coverage Reporting Integration 📊
**Story Points**: 2 SP
**Estimated Time**: 1.5 hours
**Priority**: 🟢 MEDIUM

**Acceptance Criteria**:
- [x] Configure Vitest coverage thresholds in `vitest.config.ts`
- [x] Setup Codecov integration for PR comments
- [x] Configure coverage badge generation (shields.io)
- [x] Exclude non-MVP files from coverage calculation

**Deliverable**: Updated `vitest.config.ts` + Codecov integration

**Coverage Configuration**:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        'e2e/**',
        '**/*.test.{ts,tsx}',
        '**/*.config.{ts,js}',
        '**/node_modules/**',
        '**/dist/**',
      ],
      thresholds: {
        global: {
          statements: 60,
          branches: 60,
          functions: 60,
          lines: 60,
        },
        // Critical modules require higher coverage
        'src/lib/**': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        'src/components/ui/**': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
  },
});
```

---

### Task 3.4: i18n Validation Script ✅
**Story Points**: 3 SP
**Estimated Time**: 2 hours
**Priority**: 🟡 HIGH

**Acceptance Criteria**:
- [x] Create `scripts/validate-i18n.ts`
- [x] Load all locale JSON files (tr, en, de, fr)
- [x] Compare keys across locales (detect missing/extra keys)
- [x] Validate translation quality (no empty strings, no key leakage)
- [x] Exit with error code if validation fails
- [x] Integrate into CI pipeline (Job 4)

**Deliverable**: `scripts/validate-i18n.ts` + CI integration

**Script Implementation**:
```typescript
// scripts/validate-i18n.ts
import { readFileSync } from 'fs';
import { join } from 'path';

const LOCALES = ['tr', 'en', 'de', 'fr'] as const;
const LOCALE_DIR = join(__dirname, '../src/locales');

interface LocaleData {
  [key: string]: string | LocaleData;
}

interface ValidationResult {
  locale: string;
  missingKeys: string[];
  extraKeys: string[];
  emptyValues: string[];
  keyLeakage: string[];
}

function loadLocale(locale: string): LocaleData {
  const filePath = join(LOCALE_DIR, `${locale}.json`);
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function flattenKeys(obj: LocaleData, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenKeys(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }

  return result;
}

function validateLocales(): ValidationResult[] {
  const localeData = LOCALES.map(locale => ({
    locale,
    data: flattenKeys(loadLocale(locale))
  }));

  // Use Turkish as reference (primary locale)
  const referenceKeys = new Set(Object.keys(localeData[0].data));

  const results: ValidationResult[] = [];

  for (const { locale, data } of localeData) {
    const currentKeys = new Set(Object.keys(data));

    // Find missing keys (in reference but not in current)
    const missingKeys = [...referenceKeys].filter(k => !currentKeys.has(k));

    // Find extra keys (in current but not in reference)
    const extraKeys = [...currentKeys].filter(k => !referenceKeys.has(k));

    // Find empty values
    const emptyValues = Object.entries(data)
      .filter(([_, value]) => !value || value.trim() === '')
      .map(([key]) => key);

    // Find key leakage (value is same as key, untranslated)
    const keyLeakage = Object.entries(data)
      .filter(([key, value]) => value === key)
      .map(([key]) => key);

    results.push({
      locale,
      missingKeys,
      extraKeys,
      emptyValues,
      keyLeakage
    });
  }

  return results;
}

// Main execution
const results = validateLocales();
let hasErrors = false;

for (const result of results) {
  if (result.missingKeys.length > 0 ||
      result.extraKeys.length > 0 ||
      result.emptyValues.length > 0 ||
      result.keyLeakage.length > 0) {
    hasErrors = true;

    console.error(`❌ Validation failed for locale: ${result.locale}`);

    if (result.missingKeys.length > 0) {
      console.error(`  Missing keys (${result.missingKeys.length}):`);
      result.missingKeys.forEach(k => console.error(`    - ${k}`));
    }

    if (result.extraKeys.length > 0) {
      console.error(`  Extra keys (${result.extraKeys.length}):`);
      result.extraKeys.forEach(k => console.error(`    - ${k}`));
    }

    if (result.emptyValues.length > 0) {
      console.error(`  Empty values (${result.emptyValues.length}):`);
      result.emptyValues.forEach(k => console.error(`    - ${k}`));
    }

    if (result.keyLeakage.length > 0) {
      console.error(`  Key leakage (${result.keyLeakage.length}):`);
      result.keyLeakage.forEach(k => console.error(`    - ${k}`));
    }
  } else {
    console.log(`✅ Locale validation passed: ${result.locale}`);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log('\n✅ All locales validated successfully!');
```

**package.json script**:
```json
{
  "scripts": {
    "validate:i18n": "tsx scripts/validate-i18n.ts",
    "test:e2e:smoke": "playwright test --grep @smoke",
    "test:e2e:regression": "playwright test --grep @regression",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## 📅 Day-by-Day Execution Plan

### Day 1 (October 11) - E2E Infrastructure Setup
**Focus**: Playwright setup, fixtures, and Page Object Models
**Story Points**: 9 SP
**Estimated Time**: 8 hours

**Morning (4h)**:
- ✅ Task 1.1: Playwright Setup & Configuration (2h)
- ✅ Task 1.2: E2E Test Fixtures & Utilities (1.5h)

**Afternoon (4h)**:
- ✅ Task 1.3: Page Object Models (3/5 POMs completed)

**Deliverables**:
- `playwright.config.ts`
- `e2e/` directory structure
- `e2e/fixtures/index.ts`
- `e2e/utils/helpers.ts`
- 3 Page Object Models (HomePage, ScannerPage, ProfilePage)

**Success Criteria**:
- Playwright runs sample test successfully
- All fixtures work in test environment
- POMs provide stable selectors

---

### Day 2 (October 12) - E2E Tests + Component Tests
**Focus**: Complete POMs, smoke tests, and start component tests
**Story Points**: 16 SP
**Estimated Time**: 10 hours

**Morning (4h)**:
- ✅ Task 1.3: Complete remaining POMs (BlogPage, PricingPage) (1h)
- ✅ Task 1.4: Smoke Test Suite (3/5 test files) (3h)

**Afternoon (6h)**:
- ✅ Task 1.4: Complete smoke tests (2/5 test files) (1h)
- ✅ Task 2.1: Container Component Tests (2.5h)
- ✅ Task 2.2: Grid Component Tests (2.5h partial)

**Deliverables**:
- 5 complete Page Object Models
- 15 smoke tests (auth, navigation, i18n, theme, scanner)
- Container component tests (8+ cases, ≥85% coverage)
- Grid component tests (5/10 cases completed)

**Success Criteria**:
- All 15 smoke tests passing (100% success rate)
- Container coverage ≥85%
- Grid coverage ≥40% (partial completion)

---

### Day 3 (October 13) - Component Tests + CI/CD
**Focus**: Complete component tests and setup CI pipeline
**Story Points**: 14 SP
**Estimated Time**: 9 hours

**Morning (4h)**:
- ✅ Task 2.2: Complete Grid Component Tests (0.5h)
- ✅ Task 2.3: Heading Component Tests (1.5h)
- ✅ Task 2.4: Text Component Tests (1.5h)

**Afternoon (5h)**:
- ✅ Task 3.1: GitHub Actions Workflow Configuration (3h)
- ✅ Task 3.2: Quality Gate Definitions (2h)

**Deliverables**:
- Grid component tests (10+ cases, ≥85% coverage)
- Heading component tests (6+ cases, ≥85% coverage)
- Text component tests (6+ cases, ≥85% coverage)
- `.github/workflows/ci.yml` (5-stage pipeline)
- `docs/ui/CI_CD_Quality_Gates.md`

**Success Criteria**:
- All component tests passing (30 new tests)
- All components ≥85% coverage
- CI pipeline runs successfully on test branch

---

### Day 4 (October 14) - Regression Tests + Final Integration
**Focus**: E2E regression suite and i18n validation
**Story Points**: 8 SP
**Estimated Time**: 5.5 hours

**Morning (3h)**:
- ✅ Task 1.5: Regression Test Suite (all 18 tests)

**Afternoon (2.5h)**:
- ✅ Task 3.3: Coverage Reporting Integration (1.5h)
- ✅ Task 3.4: i18n Validation Script (1h)

**Deliverables**:
- 18 regression tests (forms, blog, pricing, PWA, a11y, performance)
- Updated `vitest.config.ts` with coverage thresholds
- `scripts/validate-i18n.ts`
- Complete CI/CD pipeline (all 5 gates enforced)

**Success Criteria**:
- All regression tests passing
- Coverage reporting works in CI
- i18n validation blocks PRs with missing keys
- Full pipeline passes on main branch

---

## ✅ Sprint Success Criteria

### Quality Gates (All must pass)
- [x] **Lint**: Zero ESLint errors, zero TypeScript errors
- [x] **Unit Tests**: 100% success rate (238 tests: 208 existing + 30 new)
- [x] **E2E Smoke**: 100% pass rate (15 critical tests)
- [x] **i18n**: Zero missing/extra keys across all locales
- [x] **Build**: Successful production build

### Coverage Targets
- [x] Container component: ≥85% coverage with 8+ test cases
- [x] Grid component: ≥85% coverage with 10+ test cases
- [x] Heading component: ≥85% coverage with 6+ test cases
- [x] Text component: ≥85% coverage with 6+ test cases
- [x] Overall critical modules: ≥80% coverage maintained

### E2E Test Coverage (8 areas)
- [x] Authentication: Email/Google/Apple login flows (3 tests)
- [x] Navigation: Bottom nav + deep links + back navigation (4 tests)
- [x] i18n: Locale switching (tr/en/de/fr) + persistence (4 tests)
- [x] Theme: Light/dark toggle + persistence (2 tests)
- [x] Scanner: Camera access + barcode detection (2 tests)
- [x] Forms: Contact form + newsletter + search validation (3 tests)
- [x] Blog: Listing + pagination + filtering (3 tests)
- [x] PWA: Offline mode + install prompt (2 tests)

### CI/CD Infrastructure
- [x] GitHub Actions workflow configured (5 parallel jobs)
- [x] Coverage reporting integrated (Codecov)
- [x] Test artifacts uploaded (coverage, screenshots)
- [x] Pipeline completes in <8 minutes

### Documentation Deliverables
- [x] `docs/ui/Sprint7_Backlog.md` (this document)
- [x] `docs/ui/CI_CD_Quality_Gates.md` (quality standards)
- [x] `e2e/README.md` (E2E test guide)
- [x] `e2e/tests/smoke/README.md` (smoke test scenarios)
- [x] `e2e/tests/regression/README.md` (regression test scenarios)

### Performance Benchmarks
- [x] Unit test execution: <5s (238 tests total)
- [x] E2E smoke suite: <2 minutes (15 critical tests)
- [x] CI pipeline: <8 minutes (all 5 jobs parallel)
- [x] Coverage report generation: <10s

### Sprint Completion Criteria
- Total Story Points: **47 SP delivered** (100%)
- Total Tasks: **13 tasks completed**
- Quality: **All 5 quality gates passing**
- Documentation: **All 5 deliverables created**
- Time: **32.5 hours over 4 days** (±10% acceptable)

---

## ⚠️ Risk Assessment & Mitigation

### Risk 1: E2E Test Flakiness 🎲
**Probability**: HIGH | **Impact**: HIGH

**Concern**: Playwright tests may fail intermittently due to timing issues, network dependencies, or environment inconsistencies.

**Mitigation Strategies**:
- Use built-in auto-waiting (avoid manual `setTimeout`)
- Implement retry logic for flaky tests (max 2 retries)
- Use `data-testid` attributes for stable selectors (avoid brittle CSS selectors)
- Set appropriate timeouts (30s default, 60s for slow operations)
- Mock external API calls to avoid network dependencies
- Run tests in headless mode for consistency

**Acceptance**: <5% flakiness rate (smoke suite must be 100% reliable)

---

### Risk 2: Coverage Target Not Met 📊
**Probability**: MEDIUM | **Impact**: MEDIUM

**Concern**: Component tests may not reach 85% coverage target due to edge cases or complex conditional logic.

**Mitigation Strategies**:
- Focus on critical paths first (happy path + error states)
- Use coverage reports to identify gaps systematically
- Write behavior-focused tests (avoid implementation details)
- Qualified pass option if non-critical code remains untested
- Prioritize Container and Grid (most complex components)

**Acceptance**: ≥80% coverage acceptable with justification for gaps

---

### Risk 3: CI Pipeline Performance ⏱️
**Probability**: MEDIUM | **Impact**: MEDIUM

**Concern**: Pipeline may take >10 minutes, slowing feedback loop and developer productivity.

**Mitigation Strategies**:
- Parallel job execution (5 jobs: lint, test, e2e, i18n, build)
- Aggressive caching (npm, playwright browsers)
- Smoke tests only in CI (regression tests run nightly)
- Optimize test execution (`--maxWorkers=4` for unit tests)
- Use `chromium` only for E2E (skip firefox, webkit in CI)

**Acceptance**: Pipeline completes in <8 minutes on average

---

### Risk 4: i18n Key Drift 🌍
**Probability**: LOW | **Impact**: HIGH

**Concern**: Locales may become out of sync during development, causing missing translations in production.

**Mitigation Strategies**:
- Automated validation script (blocks PR merge)
- TR as source of truth (other locales must match)
- Pre-commit hook for i18n validation (future enhancement)
- Clear error messages with missing key locations
- Developer education on i18n workflow

**Acceptance**: Zero i18n errors in CI (strict enforcement)

---

### Risk 5: Playwright Browser Installation 📦
**Probability**: LOW | **Impact**: LOW

**Concern**: CI may fail to install browsers due to large downloads or network issues.

**Mitigation Strategies**:
- Use `playwright install --with-deps chromium` (single browser)
- Cache playwright browsers in CI (GitHub Actions cache)
- Fallback to chromium only if full install fails
- Retry browser installation on failure (max 2 retries)

**Acceptance**: Browser installation success rate >99%

---

## 🎓 Lessons Learned from Sprint 6 Applied to Sprint 7

### Applied Best Practices ✅

1. **Early Blocker Resolution** (Sprint 6 success)
   - **Sprint 6**: Path aliasing fixed early, unblocked all testing
   - **Sprint 7 Application**: Setup Playwright early (Day 1), resolve environment issues before test writing
   - **Benefit**: Avoid late-sprint blockers

2. **Qualified Pass Framework** (Sprint 6 innovation)
   - **Sprint 6**: 2% overall coverage accepted with 90%+ critical modules
   - **Sprint 7 Application**: Apply same logic - critical E2E flows (login, navigation) must be 100%, less critical flows (blog comments) can be deferred
   - **Benefit**: Focus on highest-value testing

3. **Test Quality Over Quantity** (Sprint 6 success)
   - **Sprint 6**: Behavior-focused assertions, avoid implementation details
   - **Sprint 7 Application**: E2E tests should test user outcomes, not internal state
   - **Example**: Test "user sees welcome message" NOT "localStorage.getItem('token') exists"

4. **Documentation Excellence** (Sprint 6 success)
   - **Sprint 6**: Detailed day summaries, lessons learned, interconnected docs
   - **Sprint 7 Application**: Document E2E test scenarios, CI pipeline decisions, troubleshooting guide
   - **Benefit**: Knowledge preservation for future sprints

5. **Framework Separation** (Sprint 6 success)
   - **Sprint 6**: Clean Vitest vs Playwright separation (no config conflicts)
   - **Sprint 7 Application**: Maintain separation - unit tests stay in `src/test/`, E2E in `e2e/`
   - **Benefit**: Clear mental model, no configuration conflicts

### Avoided Anti-Patterns ❌

1. **Pre-existing Test Failures** (Sprint 6 challenge)
   - **Sprint 6**: 20 failing tests inherited, took time to fix
   - **Sprint 7 Avoidance**: All 208 tests passing before Sprint 7 start
   - **Strategy**: Never start new sprint with failing tests

2. **Coverage Report Timeouts** (Sprint 6 challenge)
   - **Sprint 6**: Playwright tests caused coverage timeout
   - **Sprint 7 Avoidance**: Exclude `e2e/` from coverage collection in `vitest.config.ts`
   - **Strategy**: Separate E2E and unit test coverage

3. **Late Documentation** (avoided in Sprint 6)
   - **Sprint 6**: Documentation created incrementally (Day 1, Day 2, Final)
   - **Sprint 7 Application**: Write test documentation alongside test code
   - **Strategy**: Each E2E test file has accompanying README with scenarios

---

## 🔮 Post-Sprint 7 State & Next Steps

### Production-Ready Capabilities After Sprint 7

- ✅ **100% Critical User Flows Validated**: E2E smoke suite covers all essential journeys
- ✅ **100% UI Component Coverage**: All 7 UI components tested (Button, Card, Container, Grid, Heading, Text, MotionProvider)
- ✅ **Automated Quality Enforcement**: CI pipeline blocks PRs with failing tests or coverage regressions
- ✅ **i18n Integrity Guaranteed**: 4 locales always in sync (tr, en, de, fr)
- ✅ **Production Build Confidence**: Every commit validated with production build

### Immediate Post-Sprint 7 Actions

1. **Run Full Regression Suite** (nightly, not in PR CI)
   - Schedule nightly runs at 2 AM (cron: `0 2 * * *`)
   - Email team if regression tests fail
   - Monitor flakiness rate (<5% acceptable)

2. **Establish Baseline Metrics**
   - Test execution time (unit: <5s, E2E smoke: <2min)
   - Coverage percentages (critical modules: 80%+)
   - Pipeline success rate (target: >95%)

3. **Train Team on E2E Test Writing**
   - Playwright best practices session
   - Page Object Model patterns
   - Test stability techniques (avoid flakiness)

4. **Document CI/CD Troubleshooting**
   - Common pipeline failures (network timeout, browser crashes)
   - Resolution steps (retry, cache clear, dependency update)
   - Escalation path (who to contact for CI issues)

5. **Setup Monitoring Dashboards**
   - Test health dashboard (success rate, flakiness)
   - Pipeline performance (execution time trends)
   - Coverage trends (track coverage over time)

### Sprint 8 Preview (Future Work)

Based on Sprint 7 foundation, Sprint 8 should focus on:

1. **Performance Testing** (8 SP)
   - Lighthouse CI integration (automated Core Web Vitals monitoring)
   - Performance budgets (initial JS <500KB, LCP <2.5s)
   - Bundle size tracking (prevent regressions)

2. **Accessibility Automation** (6 SP)
   - axe-core integration (automated WCAG 2.1 AA validation)
   - Color contrast testing (all text meets 4.5:1 ratio)
   - Keyboard navigation testing (all interactive elements accessible)

3. **Visual Regression Testing** (5 SP)
   - Percy/Chromatic integration (screenshot comparison)
   - Component visual regression (prevent unintended UI changes)
   - Responsive breakpoint validation (mobile, tablet, desktop)

4. **Load Testing** (4 SP)
   - k6 scripts for API endpoints (simulate 100+ concurrent users)
   - Stress testing (identify breaking points)
   - Database query optimization (based on load test results)

5. **Security Scanning** (4 SP)
   - OWASP dependency check (vulnerable package detection)
   - Snyk integration (automated vulnerability scanning)
   - Secret scanning (prevent API key leaks)

**Sprint 8 Total**: ~27 SP (2-3 days)

---

## 📈 Sprint 7 Value Delivered

**For Users** 👥:
- Confidence in stable, bug-free application (critical flows validated)
- Consistent multi-language experience (i18n integrity guaranteed)
- Fast, reliable performance (automated quality gates)

**For Developers** 👨‍💻:
- Fast feedback loop (<8 min pipeline)
- Clear quality standards (5 automated gates)
- Reduced manual testing burden (E2E automation)
- Prevented regressions (every PR validated)

**For Product** 📊:
- Release confidence (100% critical flows tested)
- Reduced bug escape rate (comprehensive E2E coverage)
- Faster iteration (automated quality assurance)
- Quantifiable quality metrics (coverage, test success rate)

**For Business** 💼:
- Reduced QA costs (automation replaces manual testing)
- Faster time-to-market (CI/CD pipeline enables rapid deployment)
- Lower maintenance costs (prevented technical debt through quality gates)
- Increased customer satisfaction (fewer production bugs)

---

## 📋 Sprint 7 Task Checklist

### Epic 1: E2E Test Infrastructure & User Flows (20 SP)
- [ ] Task 1.1: Playwright Setup & Configuration (3 SP, 2h)
- [ ] Task 1.2: E2E Test Fixtures & Utilities (2 SP, 1.5h)
- [ ] Task 1.3: Page Object Models (4 SP, 3h)
- [ ] Task 1.4: Smoke Test Suite (5 SP, 4h)
- [ ] Task 1.5: Regression Test Suite (6 SP, 5h)

### Epic 2: Component Test Coverage Completion (15 SP)
- [ ] Task 2.1: Container Component Tests (4 SP, 2.5h)
- [ ] Task 2.2: Grid Component Tests (5 SP, 3h)
- [ ] Task 2.3: Heading Component Tests (3 SP, 1.5h)
- [ ] Task 2.4: Text Component Tests (3 SP, 1.5h)

### Epic 3: CI/CD Pipeline & Quality Gates (12 SP)
- [ ] Task 3.1: GitHub Actions Workflow Configuration (4 SP, 3h)
- [ ] Task 3.2: Quality Gate Definitions (3 SP, 2h)
- [ ] Task 3.3: Coverage Reporting Integration (2 SP, 1.5h)
- [ ] Task 3.4: i18n Validation Script (3 SP, 2h)

---

## 📚 References & Related Documents

- **Sprint 6 Final Summary**: [Sprint6_Final_Summary.md](./Sprint6_Final_Summary.md) (context for Sprint 7)
- **UI Remediation Plan**: [UI_Remediation_Plan.md](./UI_Remediation_Plan.md) (master remediation plan)
- **Next Steps Guide**: [NEXT_STEPS_GUIDE.md](./NEXT_STEPS_GUIDE.md) (quick action guide)
- **Manual UI Test Kit**: [Manual_UI_Test_Execution_Kit.md](./Manual_UI_Test_Execution_Kit.md) (manual testing scenarios)
- **Core Web Vitals Report**: [Core_Web_Vitals_Report.md](./Core_Web_Vitals_Report.md) (performance benchmarks)

---

**Document Version**: 1.0
**Last Updated**: October 10, 2025
**Created By**: Workflow Generation (Sequential Thinking)
**Status**: ✅ Ready for Sprint 7 Execution
