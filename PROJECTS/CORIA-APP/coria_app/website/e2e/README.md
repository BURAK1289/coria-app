# E2E Testing with Playwright

End-to-end testing suite for CORIA website using Playwright.

## 📋 Test Organization

```
e2e/
├── tests/
│   ├── smoke/           # Critical user journeys (run in CI)
│   └── regression/      # Comprehensive coverage (run nightly)
├── page-objects/        # Page Object Models (POMs)
├── fixtures/            # Test fixtures (authenticated user, etc.)
├── utils/               # Helper functions (locale, theme, etc.)
└── playwright.config.ts # Playwright configuration
```

## 🚀 Quick Start

### Installation

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install --with-deps
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run smoke tests only (critical flows)
npm run test:e2e:smoke

# Run regression tests (comprehensive coverage)
npm run test:e2e:regression

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test file
npx playwright test e2e/tests/smoke/auth-flow.spec.ts

# Run with UI mode (interactive)
npx playwright test --ui
```

## 🧪 Test Suites

### Smoke Tests (15 tests - 100% must pass)

Critical user journeys that must always work:

- **Authentication** (3 tests): Email login, Google OAuth, session persistence
- **Navigation** (4 tests): Bottom nav, deep links, back navigation, 404 handling
- **i18n** (4 tests): Locale switching, persistence, RTL support, translation completeness
- **Theme** (2 tests): Light/dark toggle, preference persistence
- **Scanner** (2 tests): Camera access, barcode detection

**Run Time**: <2 minutes
**Frequency**: Every PR (CI pipeline)
**Failure Tolerance**: 0% (all must pass)

### Regression Tests (18 tests - comprehensive)

Full coverage of all features:

- **Forms** (3 tests): Contact form, newsletter, search validation
- **Blog** (3 tests): Listing, pagination, category filtering
- **Pricing** (3 tests): Plan comparison, feature matrix, CTA interactions
- **PWA** (2 tests): Offline mode, install prompt
- **Accessibility** (4 tests): Keyboard nav, screen reader, color contrast, focus management
- **Performance** (3 tests): Core Web Vitals, image loading, font loading

**Run Time**: <5 minutes
**Frequency**: Nightly (scheduled)
**Failure Tolerance**: <5% flakiness acceptable

## 📄 Page Object Models (POMs)

POMs encapsulate page structure and interactions:

```typescript
// e2e/page-objects/home.page.ts
import { Page, Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly heroHeading: Locator;
  readonly iosCtaButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heroHeading = page.locator('h1');
    this.iosCtaButton = page.locator('[aria-label*="iOS"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async clickIosCta() {
    await this.iosCtaButton.click();
  }
}
```

**Benefits**:
- Centralized selectors (single source of truth)
- Reusable page interactions
- Easier maintenance (change once, update all tests)

## 🔧 Test Fixtures

Fixtures provide reusable test contexts:

```typescript
// e2e/fixtures/index.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedUser: async ({ page }, use) => {
    // Pre-login with mock token
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
    });
    await use(page);
  },
});
```

**Available Fixtures**:
- `authenticatedUser`: Pre-authenticated user session
- `guestUser`: Unauthenticated session
- `adminUser`: Admin role session (future)

## 🛠️ Helper Functions

Common utilities for test scenarios:

```typescript
// e2e/utils/helpers.ts

// Locale switching
export async function changeLocale(page: Page, locale: 'tr' | 'en' | 'de' | 'fr') {
  await page.selectOption('[aria-label="Language"]', locale);
  await page.waitForLoadState('networkidle');
}

// Theme toggling
export async function switchTheme(page: Page) {
  await page.click('[aria-label="Toggle theme"]');
  await page.waitForTimeout(300); // Wait for transition
}

// Custom assertions
export async function verifyTranslation(page: Page, key: string, expectedText: string) {
  const element = page.locator(`[data-i18n-key="${key}"]`);
  await expect(element).toContainText(expectedText);
}
```

## ⚙️ Configuration

### playwright.config.ts

```typescript
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
});
```

**Key Settings**:
- **Timeout**: 30s default (can override per test)
- **Retries**: 2 retries in CI (0 locally for faster feedback)
- **Screenshots**: Captured only on failure
- **Video**: Recorded only on failure
- **Trace**: Generated on first retry (for debugging)

## 🐛 Debugging

### Visual Debugging

```bash
# Run with headed mode (see browser)
npx playwright test --headed

# Run with UI mode (interactive)
npx playwright test --ui

# Debug specific test
npx playwright test --debug e2e/tests/smoke/auth-flow.spec.ts
```

### Trace Viewer

```bash
# Generate trace on failure
npx playwright test --trace on

# Open trace viewer
npx playwright show-trace trace.zip
```

### Screenshots

Failed tests automatically capture screenshots:
- Location: `test-results/[test-name]/[screenshot].png`
- Includes: Full page screenshot at failure point

## 🚦 CI Integration

### GitHub Actions

```yaml
# .github/workflows/ci.yml
e2e-smoke:
  name: E2E Smoke Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
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
```

**Performance**:
- Smoke tests: <2 minutes in CI
- Regression tests: <5 minutes (nightly only)
- Total pipeline: <8 minutes (with parallel jobs)

## 📊 Test Stability

### Avoiding Flakiness

```typescript
// ❌ WRONG: Manual timeouts (brittle)
await page.waitForTimeout(1000);
await page.click('button');

// ✅ RIGHT: Built-in auto-waiting (stable)
await page.click('button'); // Waits for actionability

// ❌ WRONG: Brittle CSS selectors
await page.click('.home-page > div > button:nth-child(3)');

// ✅ RIGHT: Stable data-testid attributes
await page.click('[data-testid="cta-button"]');

// ❌ WRONG: Network dependencies (flaky)
const response = await fetch('https://api.example.com/products');

// ✅ RIGHT: Mocked API responses (stable)
await page.route('**/api/products', route =>
  route.fulfill({ body: JSON.stringify(mockProducts) })
);
```

### Flakiness Targets

- **Smoke Suite**: 0% flakiness (100% reliable)
- **Regression Suite**: <5% flakiness acceptable
- **Action**: Investigate and fix any flaky tests within 24 hours

## 🎯 Best Practices

### 1. Test User Outcomes, Not Implementation

```typescript
// ❌ WRONG: Testing implementation details
await expect(page.evaluate(() => localStorage.getItem('token'))).toBeTruthy();

// ✅ RIGHT: Testing user-visible outcomes
await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
```

### 2. Use Page Object Models

```typescript
// ❌ WRONG: Duplicate selectors in every test
await page.click('[aria-label="Login"]');
await page.fill('input[type="email"]', 'test@example.com');

// ✅ RIGHT: Centralized in POM
const homePage = new HomePage(page);
await homePage.login('test@example.com', 'password');
```

### 3. Isolate Tests

```typescript
// ❌ WRONG: Tests depend on each other
test('login', async () => { /* login logic */ });
test('view profile', async () => { /* assumes logged in */ });

// ✅ RIGHT: Each test is independent
test('view profile', async ({ authenticatedUser }) => {
  // Uses fixture for pre-authenticated state
  await authenticatedUser.goto('/profile');
});
```

### 4. Mock External Dependencies

```typescript
// ❌ WRONG: Real API calls (slow, flaky)
await page.goto('/products'); // Calls real API

// ✅ RIGHT: Mocked API responses (fast, stable)
await page.route('**/api/products', route =>
  route.fulfill({ body: JSON.stringify(mockProducts) })
);
```

## 📈 Metrics & Monitoring

### Key Metrics

- **Test Success Rate**: Target >95% (smoke: 100%)
- **Execution Time**: Smoke <2min, Regression <5min
- **Flakiness Rate**: Target <5%
- **Coverage**: 8 critical user flows (100%)

### Monitoring

```bash
# Generate HTML report
npx playwright test --reporter=html

# Open report
npx playwright show-report
```

## 🔗 Related Documentation

- **Sprint 7 Backlog**: [Sprint7_Backlog.md](../docs/ui/Sprint7_Backlog.md)
- **CI/CD Quality Gates**: [CI_CD_Quality_Gates.md](../docs/ui/CI_CD_Quality_Gates.md)
- **Manual UI Test Kit**: [Manual_UI_Test_Execution_Kit.md](../docs/ui/Manual_UI_Test_Execution_Kit.md)

## 📞 Support

- **Flaky Tests**: Investigate within 24 hours, fix or skip
- **New Test Scenarios**: Add to regression suite, not smoke
- **Performance Issues**: Profile with trace viewer, optimize selectors

---

**Document Version**: 1.0
**Last Updated**: October 10, 2025
**Status**: ✅ Ready for Sprint 7 Execution
