# E2E Testing Guide

**Sprint 7 Deliverable** | **Last Updated**: 2025-10-09
**Purpose**: Comprehensive guide for running, writing, and debugging Playwright E2E tests for the CORIA website

---

## 📚 Table of Contents

1. [Overview](#overview)
2. [Installation & Setup](#installation--setup)
3. [Running Tests](#running-tests)
4. [Test Structure](#test-structure)
5. [Writing New Tests](#writing-new-tests)
6. [Page Object Models](#page-object-models)
7. [Debugging Failed Tests](#debugging-failed-tests)
8. [CI/CD Integration](#cicd-integration)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### What is E2E Testing?

End-to-End (E2E) testing validates critical user journeys by simulating real user interactions in a browser. For CORIA website, this means:

- ✅ Verifying navigation works across all pages
- ✅ Testing locale switching (TR, EN, DE, FR)
- ✅ Validating theme toggle (light/dark)
- ✅ Ensuring CTAs and links function correctly
- ✅ Checking responsive design and accessibility

### Why Playwright?

- **Fast & Reliable**: Auto-waits for elements, reducing flakiness
- **Multi-Browser**: Test on Chromium, Firefox, WebKit
- **Developer Tools**: UI mode, trace viewer, inspector
- **TypeScript Support**: Full type safety and autocomplete
- **Parallel Execution**: Run tests concurrently for speed

### Test Pyramid Position

```
       ╱╲
      ╱  ╲  E2E Tests (15 smoke + 18 regression)
     ╱────╲
    ╱      ╲  Integration Tests (42 tests)
   ╱────────╲
  ╱          ╲  Unit Tests (208 tests)
 ╱────────────╲
```

**E2E tests validate critical user journeys**, not every feature variant.

---

## Installation & Setup

### Prerequisites

- Node.js 20+ installed
- npm or pnpm package manager
- Git repository cloned

### Install Playwright

```bash
cd /path/to/coria_app/website

# Install Playwright test framework
npm install -D @playwright/test

# Install Chromium browser (for smoke tests)
npx playwright install --with-deps chromium

# Optional: Install all browsers (for full regression)
npx playwright install --with-deps
```

### Verify Installation

```bash
# Check Playwright version
npx playwright --version

# Run smoke tests
npm run test:e2e:smoke
```

### Configuration

Playwright configuration is located at:
```
website/playwright.config.ts
```

Key settings:
- **Test directory**: `./e2e/tests`
- **Base URL**: `http://localhost:3000`
- **Retries**: 2 in CI, 0 locally
- **Workers**: 2 in CI, 4 locally
- **Timeout**: 30s per test

---

## Running Tests

### Basic Commands

```bash
# Run all E2E tests
npm run test:e2e

# Run smoke tests only (15 critical tests)
npm run test:e2e:smoke

# Run regression tests only
npm run test:e2e:regression

# Run specific test file
npx playwright test e2e/tests/smoke/navigation.spec.ts

# Run specific test by name
npx playwright test -g "should toggle between light and dark themes"
```

### Interactive Development

```bash
# Open Playwright UI mode (recommended for development)
npm run test:e2e:ui

# Run tests with visible browser
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug
```

### Reports & Artifacts

```bash
# View HTML report
npm run test:e2e:report

# Reports are automatically generated at:
# - playwright-report/index.html
# - test-results/junit.xml (for CI)
```

### Production Build Testing

**Why Test Against Production Build?**

Testing against the development server (`npm run dev`) can hide issues that only appear in production:
- Server-side rendering inconsistencies
- Hydration mismatches between SSR and client
- Performance bottlenecks masked by dev mode overhead
- Build-time optimizations that affect behavior

**Run Smoke Tests on Production Build:**

```bash
# Complete workflow: BUILD → START → TEST → CLEANUP
npm run test:e2e:smoke:prod
```

This command automatically:
1. ✅ Builds production bundle (`npm run build`)
2. 🚀 Starts production server on port 3000 (`npm start`)
3. ⏳ Waits for server health check (max 60s)
4. 🎭 Runs smoke tests with `BASE_URL=http://localhost:3000`
5. 🧹 Kills production server and cleans up (even if tests fail)

**Script Details:**

The [scripts/run-e2e-prod.sh](../../scripts/run-e2e-prod.sh) script handles the complete lifecycle:
- **Server Management**: Starts server in background, stores PID for cleanup
- **Health Checks**: Polls `http://localhost:3000` until ready (HTTP 200/301/302)
- **Automatic Cleanup**: Kills server on exit, error, or interrupt (Ctrl+C)
- **Exit Codes**:
  - `0` - Tests passed
  - `1` - Tests failed
  - `2` - Build failed
  - `3` - Server failed to start

**Server Logs:**

Production server output is saved to `/tmp/next-prod-server.log` for debugging:

```bash
# View server log during or after test run
tail -f /tmp/next-prod-server.log

# Check last 20 lines if server fails to start
tail -20 /tmp/next-prod-server.log
```

**When to Use Production Testing:**

- ✅ **Before merging PRs**: Catch production-only issues early
- ✅ **Debugging timeouts**: Production build is faster and more stable
- ✅ **Performance testing**: Measure real production performance
- ✅ **CI/CD validation**: Mirror CI environment locally
- ❌ **Active development**: Use dev server for faster iteration

**BASE_URL Configuration:**

The `BASE_URL` environment variable is automatically set by the script:
```bash
BASE_URL=http://localhost:3000 npx playwright test --grep @smoke
```

Playwright config uses this via:
```typescript
use: {
  baseURL: process.env.BASE_URL || 'http://localhost:3000',
}
```

**Manual Production Server Control:**

For advanced workflows, manually control the production server:

```bash
# Build and start production server (stays running)
npm run build && npm start

# In another terminal, run tests with custom BASE_URL
BASE_URL=http://localhost:3000 npm run test:e2e:smoke

# When done, kill the server manually
lsof -ti:3000 | xargs kill -9
```

**Troubleshooting Production Tests:**

| Issue | Solution |
|-------|----------|
| Port 3000 already in use | Kill existing server: `lsof -ti:3000 \| xargs kill -9` |
| Server times out (>60s) | Check `/tmp/next-prod-server.log` for errors |
| Build fails | Run `npm run build` separately to see detailed errors |
| Tests hang | Server may not be responding - check health manually: `curl http://localhost:3000` |

---

## Test Structure

### Directory Layout

```
website/
├── e2e/
│   ├── fixtures/
│   │   └── index.ts           # Custom test fixtures
│   ├── page-objects/
│   │   ├── base.page.ts       # Base page class
│   │   ├── home.page.ts       # Home page POM
│   │   ├── navigation.page.ts # Navigation POM
│   │   ├── theme.page.ts      # Theme POM
│   │   └── i18n.page.ts       # i18n POM
│   ├── utils/
│   │   └── helpers.ts         # Test helper functions
│   └── tests/
│       ├── smoke/             # Critical user journeys
│       │   ├── homepage.spec.ts
│       │   ├── navigation.spec.ts
│       │   ├── i18n.spec.ts
│       │   └── theme.spec.ts
│       └── regression/        # Comprehensive coverage
│           └── README.md
├── playwright.config.ts
└── package.json
```

### Test Categories

| Category | Tag | Count | Purpose |
|----------|-----|-------|---------|
| **Smoke** | `@smoke` | 15 | Critical user journeys (must pass 100%) |
| **Regression** | `@regression` | 18 | Comprehensive feature coverage |
| **A11y** | `@a11y` | TBD | Accessibility validation |
| **Performance** | `@perf` | TBD | Core Web Vitals monitoring |

---

## Writing New Tests

### Basic Test Template

```typescript
import { test, expect } from '../../fixtures';
import { HomePage } from '../../page-objects/home.page';

test.describe('@smoke My Feature Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page, locale }) => {
    homePage = new HomePage(page);
    await homePage.goto(locale);
  });

  test('should do something', async () => {
    // Arrange
    await homePage.verifyPageRendered();

    // Act
    await homePage.clickNav('features');

    // Assert
    await expect(homePage.page).toHaveURL(/\/features/);
  });
});
```

### Using Fixtures

**Locale Fixture** (default: 'tr'):
```typescript
test('should load in English', async ({ page, locale }) => {
  // locale is auto-injected, defaults to 'tr'
  await page.goto(`/${locale}`);
});

// Override default locale
test.use({ locale: 'en' });
test('should use English', async ({ page, locale }) => {
  expect(locale).toBe('en');
});
```

**Theme Fixture** (default: 'system'):
```typescript
test.use({ theme: 'dark' });
test('should use dark theme', async ({ page, theme }) => {
  // theme is pre-configured to 'dark'
});
```

**Authenticated User Fixture**:
```typescript
test('should have authenticated user', async ({ authenticatedUser }) => {
  expect(authenticatedUser.email).toBe('test@coria.app');
  expect(authenticatedUser.token).toBeTruthy();
});
```

**Guest/Auth Page Fixtures**:
```typescript
test('guest page automatically navigates', async ({ guestPage }) => {
  // guestPage is already at homepage
  await expect(guestPage).toHaveURL(/\//);
});

test('auth page has mock auth', async ({ authPage }) => {
  // authPage has localStorage auth state
  const token = await authPage.evaluate(() => localStorage.getItem('auth-token'));
  expect(token).toBeTruthy();
});
```

### Test Naming Conventions

✅ **Good**:
```typescript
test('should toggle between light and dark themes')
test('should persist locale after page reload')
test('should navigate to all pages successfully')
```

❌ **Bad**:
```typescript
test('test1') // Not descriptive
test('it works') // Too vague
test('should test the navigation feature') // Redundant "test"
```

### Assertions Best Practices

```typescript
// ✅ Use locator-based assertions
await expect(page.locator('h1')).toBeVisible();
await expect(page.locator('[data-testid="nav-features"]')).toHaveText('Features');

// ✅ Use URL assertions
await expect(page).toHaveURL(/\/features/);

// ✅ Use auto-wait assertions
await expect(element).toBeVisible(); // Waits up to 5s

// ❌ Don't use manual waits unless necessary
await page.waitForTimeout(5000); // Flaky!
```

---

## Page Object Models

### What are POMs?

Page Object Models (POMs) encapsulate page interactions into reusable classes, improving:
- **Maintainability**: Change selectors in one place
- **Readability**: Tests use semantic methods, not raw selectors
- **Reusability**: Share page logic across multiple tests

### Using Existing POMs

```typescript
import { HomePage } from '../../page-objects/home.page';

test('example', async ({ page }) => {
  const homePage = new HomePage(page);

  // Navigate
  await homePage.goto('tr');

  // Verify
  await homePage.verifyHeroVisible();
  await homePage.verifyCtaButtons();

  // Interact
  await homePage.clickIosDownload();
});
```

### Creating New POMs

```typescript
import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class MyFeaturePage extends BasePage {
  readonly heading: Locator;
  readonly ctaButton: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = page.locator('h1');
    this.ctaButton = page.locator('[data-testid="cta-button"]');
  }

  async clickCta() {
    await this.ctaButton.click();
    await this.waitForPageLoad();
  }

  async verifyHeading(expectedText: string) {
    await expect(this.heading).toContainText(expectedText);
  }
}
```

### BasePage Methods

All POMs extend `BasePage` which provides:

```typescript
// Navigation
await page.goto('/features', 'en');
await page.clickNav('pricing');
await page.clickLogo();
await page.goBack();
await page.goForward();

// Theme
await page.toggleTheme();
await page.getCurrentTheme(); // 'light' | 'dark'
await page.waitForTheme('dark');

// Locale
await page.switchLocale('de');
await page.getCurrentLocale(); // 'tr' | 'en' | 'de' | 'fr'
await page.waitForLocale('fr');

// Verification
await page.verifyNavigationVisible();
await page.verifyLogoVisible();
await page.verifyUrl('/features', 'en');
await page.verifyNoConsoleErrors();

// Utilities
await page.waitForPageLoad();
await page.screenshot('debug-screenshot');
const url = page.getCurrentUrl();
const title = await page.getTitle();
```

---

## Debugging Failed Tests

### Quick Debug Commands

```bash
# Run specific test in debug mode
npx playwright test -g "failing test name" --debug

# Run with visible browser + slow motion
npx playwright test --headed --slow-mo=1000

# Generate trace on failure
npx playwright test --trace on
```

### Using Playwright Inspector

When a test fails:

1. **Run in debug mode**:
   ```bash
   npm run test:e2e:debug
   ```

2. **Step through test**:
   - Click "Step over" button
   - Inspect DOM at each step
   - View console logs
   - Check network requests

3. **Pause at specific point**:
   ```typescript
   test('debug example', async ({ page }) => {
     await page.goto('/');
     await page.pause(); // Playwright pauses here
     await page.click('button');
   });
   ```

### Viewing Traces

Traces capture full test execution (screenshots, network, console):

```bash
# Generate trace for failed tests
npx playwright test --trace on-first-retry

# View trace file
npx playwright show-trace test-results/trace.zip
```

Trace viewer shows:
- 📸 Screenshots at every step
- 🌐 Network requests/responses
- 📝 Console logs and errors
- 🔍 DOM snapshots
- ⏱️ Timeline of actions

### Common Failure Patterns

#### 1. Element Not Found

**Error**: `locator.click: Timeout 30000ms exceeded`

**Cause**: Element doesn't exist or not visible

**Fix**:
```typescript
// ❌ Too generic selector
await page.click('button');

// ✅ Use data-testid for stability
await page.click('[data-testid="submit-button"]');

// ✅ Wait for element to be visible
await page.waitForSelector('[data-testid="submit-button"]', { state: 'visible' });
await page.click('[data-testid="submit-button"]');
```

#### 2. Flaky Tests

**Symptoms**: Test passes/fails randomly

**Causes**:
- Race conditions (animations, async data)
- Network delays
- Hardcoded waits

**Fixes**:
```typescript
// ❌ Hardcoded waits (flaky!)
await page.waitForTimeout(3000);
await page.click('button');

// ✅ Wait for specific condition
await page.waitForLoadState('networkidle');
await page.click('button');

// ✅ Use auto-waiting assertions
await expect(page.locator('button')).toBeVisible();
await page.click('button');
```

#### 3. Locale/Theme State Issues

**Symptoms**: Tests fail in CI but pass locally

**Cause**: State from previous tests not cleaned up

**Fix**:
```typescript
test.beforeEach(async ({ page }) => {
  // Clear localStorage
  await page.evaluate(() => localStorage.clear());

  // Clear cookies
  await page.context().clearCookies();

  // Navigate fresh
  await page.goto('/');
});
```

### Debugging Screenshots

Take screenshots at any point:

```typescript
test('debug with screenshots', async ({ page }) => {
  await page.goto('/');
  await page.screenshot({ path: 'debug-step-1.png', fullPage: true });

  await page.click('button');
  await page.screenshot({ path: 'debug-step-2.png', fullPage: true });
});
```

Screenshots are auto-saved on failure at:
```
test-results/<test-name>/test-failed-1.png
```

---

## CI/CD Integration

### GitHub Actions Workflow

E2E tests run automatically in CI pipeline:

**File**: `.github/workflows/ci.yml`

```yaml
e2e-smoke:
  name: E2E Smoke Tests
  runs-on: ubuntu-latest
  timeout-minutes: 15
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - name: Install Playwright browsers
      run: npx playwright install --with-deps chromium
    - run: npm run test:e2e:smoke
    - uses: actions/upload-artifact@v3
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

### CI Test Strategy

| Environment | Tests Run | Browsers | Retries |
|-------------|-----------|----------|---------|
| **PR** | Smoke tests | Chromium | 2 |
| **Nightly** | Regression | Chromium, Firefox, WebKit | 1 |
| **Release** | All tests | All browsers | 0 |

### Viewing CI Reports

When tests fail in CI:

1. Go to **Actions** tab in GitHub
2. Click failed workflow run
3. Download **playwright-report** artifact
4. Unzip and open `index.html`

---

## Best Practices

### Test Design

✅ **DO**:
- Write independent, isolated tests
- Use Page Object Models for reusability
- Test critical user journeys, not every variant
- Use semantic selectors (data-testid preferred)
- Keep tests focused (one behavior per test)

❌ **DON'T**:
- Hardcode waits (`waitForTimeout`)
- Test implementation details
- Create test dependencies (test1 must run before test2)
- Use fragile selectors (CSS classes, nth-child)

### Selector Priority

1. **data-testid** (best): `[data-testid="nav-features"]`
2. **Semantic attributes**: `[aria-label="Close dialog"]`
3. **Text content**: `page.getByText('Submit')`
4. **Accessible role**: `page.getByRole('button', { name: 'Submit' })`
5. **CSS selectors** (avoid): `.btn-primary.active`

### Performance

```typescript
// ✅ Run independent actions in parallel
await Promise.all([
  page.waitForLoadState('networkidle'),
  page.waitForSelector('[data-testid="content"]'),
]);

// ✅ Reuse Page Objects
const homePage = new HomePage(page);
await homePage.goto('tr');
// Don't create new HomePage repeatedly

// ❌ Sequential waits (slow)
await page.waitForLoadState('load');
await page.waitForLoadState('domcontentloaded');
await page.waitForLoadState('networkidle');
```

---

## Troubleshooting

### Common Issues

#### Issue: Playwright not installed

**Symptoms**:
```
Error: Executable doesn't exist at /path/to/chromium
```

**Solution**:
```bash
npx playwright install --with-deps
```

#### Issue: Port 3000 already in use

**Symptoms**:
```
Error: http://localhost:3000 is already in use
```

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run tests manually
npm run dev # In terminal 1
npm run test:e2e # In terminal 2
```

#### Issue: Tests fail only in CI

**Symptoms**: Tests pass locally, fail in GitHub Actions

**Possible Causes**:
- Timing differences (CI is slower)
- Missing environment variables
- Browser differences

**Solution**:
```typescript
// Increase timeouts for CI
test.setTimeout(process.env.CI ? 60000 : 30000);

// Use explicit waits
await page.waitForLoadState('networkidle');
```

#### Issue: Locale tests failing

**Symptoms**: Locale switch doesn't work

**Solution**:
```typescript
// Verify locale dropdown opens
await page.click('[data-testid="locale-selector"]');
await page.waitForTimeout(300); // Wait for animation

// Then click locale option
await page.click('[data-testid="locale-option-en"]');
await page.waitForURL(/\/en\//);
```

### Getting Help

1. **Check Playwright docs**: https://playwright.dev
2. **Check test logs**: `test-results/results.json`
3. **Review traces**: `npx playwright show-trace trace.zip`
4. **Ask team**: Share screenshots + trace files

---

## Appendix: Test Coverage Matrix

### Smoke Tests (15 tests)

| Area | Tests | Status |
|------|-------|--------|
| **Homepage** | 10 | ✅ |
| **Navigation** | 7 | ✅ |
| **i18n** | 7 | ✅ |
| **Theme** | 7 | ✅ |

### Regression Tests (18 tests planned)

| Area | Tests | Status |
|------|-------|--------|
| **Forms** | 3 | 📋 Planned |
| **Blog** | 3 | 📋 Planned |
| **Pricing** | 3 | 📋 Planned |
| **PWA** | 2 | 📋 Planned |
| **Accessibility** | 4 | 📋 Planned |
| **Performance** | 3 | 📋 Planned |

---

**Document Status**: ✅ Complete
**Last Reviewed**: 2025-10-09
**Next Review**: Sprint 8 (post-regression implementation)
