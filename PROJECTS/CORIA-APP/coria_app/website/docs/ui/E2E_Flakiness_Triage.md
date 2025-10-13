# E2E Test Flakiness Triage Guide

**Purpose**: Systematic approach to debugging and fixing flaky Playwright E2E tests

**Status**: ✅ Active - Sprint 7
**Last Updated**: October 10, 2025

---

## 🎯 Quick Triage Checklist

When a test fails intermittently, follow this checklist:

- [ ] **Check if it's a real flake** (passes on retry)
- [ ] **Review recent code changes** (git log for last 5 commits)
- [ ] **Check trace/video** (playwright show-report)
- [ ] **Run in UI mode** (npm run e2e:ui)
- [ ] **Check network tab** (slow API calls?)
- [ ] **Review console errors** (JavaScript errors?)
- [ ] **Test in isolation** (playwright test path/to/test.spec.ts)
- [ ] **Test with headed mode** (npm run e2e:headed)

---

## 🔍 Common Flakiness Patterns

### Pattern 1: Timeout Waiting for Element

**Symptoms**:
```
TimeoutError: page.locator(...).click: Timeout 15000ms exceeded
```

**Root Causes**:
1. ❌ Using fragile selectors (CSS nth-child, brittle classes)
2. ❌ Element not yet rendered (waiting for API response)
3. ❌ Element rendered but not actionable (covered by modal, offscreen)
4. ❌ Using `waitForLoadState('networkidle')` with analytics

**Solutions**:
```typescript
// ❌ WRONG: Brittle selector
await page.locator('.home-page > div > button:nth-child(3)').click();

// ✅ RIGHT: Stable data-testid
await page.click('[data-testid="cta-button"]');

// ❌ WRONG: Manual timeout (race condition)
await page.waitForTimeout(1000);
await page.click('button');

// ✅ RIGHT: Auto-wait with expect
await expect(page.locator('[data-testid="cta-button"]')).toBeVisible();
await page.click('[data-testid="cta-button"]');

// ❌ WRONG: networkidle hangs with analytics
await page.waitForLoadState('networkidle');

// ✅ RIGHT: domcontentloaded + explicit element wait
await page.waitForLoadState('domcontentloaded');
await expect(page.locator('h1')).toBeVisible();
```

### Pattern 2: Element Not Found

**Symptoms**:
```
Error: locator.textContent: Target closed
Error: Locator expected to be visible, but was not
```

**Root Causes**:
1. ❌ Element removed from DOM before assertion
2. ❌ Navigation happened too quickly
3. ❌ Element hidden by CSS (display:none, visibility:hidden)
4. ❌ Wrong locale/theme causing different rendering

**Solutions**:
```typescript
// ❌ WRONG: Doesn't wait for element to exist
const text = await page.locator('h1').textContent();

// ✅ RIGHT: Waits for element with auto-wait
const text = await page.locator('h1').textContent({ timeout: 10000 });

// ❌ WRONG: No wait for navigation
await page.click('a[href="/features"]');
await expect(page.locator('h1')).toContainText('Features');

// ✅ RIGHT: Wait for URL change
await page.click('a[href="/features"]');
await page.waitForURL('**/features');
await expect(page.locator('h1')).toContainText('Features');

// ✅ BETTER: Use toBeVisible for actionable check
await expect(page.locator('[data-testid="hero-heading"]')).toBeVisible();
await expect(page.locator('[data-testid="hero-heading"]')).toBeAttached();
```

### Pattern 3: Race Conditions with Network

**Symptoms**:
```
Test passes locally but fails in CI
Test fails first run, passes on retry
```

**Root Causes**:
1. ❌ Relying on external API timing
2. ❌ No network mocking for analytics/tracking
3. ❌ Real API calls with variable latency
4. ❌ Image loading from external CDNs

**Solutions**:
```typescript
// ❌ WRONG: Real API calls (flaky timing)
await page.goto('/products');
await expect(page.locator('.product-card')).toHaveCount(10);

// ✅ RIGHT: Mock API responses
import { mockApiEndpoint } from '../fixtures/network-mocks';

await mockApiEndpoint(page, '**/api/products', {
  products: Array(10).fill({ id: 1, name: 'Product' })
});
await page.goto('/products');
await expect(page.locator('.product-card')).toHaveCount(10);

// ✅ RIGHT: Use network mocks fixture
import { applyStandardMocks } from '../fixtures/network-mocks';

await applyStandardMocks(page); // Blocks analytics, tracking
await page.goto('/');
```

### Pattern 4: Locale/Theme Dependent Flakiness

**Symptoms**:
```
Test fails only in specific locale (de, fr)
Test fails only in dark mode
```

**Root Causes**:
1. ❌ Hardcoded text expectations (locale-specific)
2. ❌ CSS selectors dependent on theme classes
3. ❌ Missing translations causing layout shifts

**Solutions**:
```typescript
// ❌ WRONG: Hardcoded locale assumption
await expect(page.locator('h1')).toHaveText('Hoş geldiniz'); // Only works in tr

// ✅ RIGHT: Locale-agnostic assertion
await expect(page.locator('h1')).toBeVisible();
await expect(page.locator('h1')).not.toContainText('hero.'); // No translation keys

// ❌ WRONG: Theme-dependent selector
await page.locator('.dark .button-primary').click();

// ✅ RIGHT: Theme-independent data-testid
await page.click('[data-testid="cta-button"]');

// ✅ RIGHT: Test across all locales
test.describe('@smoke i18n Tests', () => {
  const locales = ['tr', 'en', 'de', 'fr'];
  
  for (const locale of locales) {
    test(`should load in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator('h1')).toBeVisible();
    });
  }
});
```

### Pattern 5: Animation/Transition Timing

**Symptoms**:
```
Test fails because element still animating
Click happens during transition (element moves)
```

**Root Causes**:
1. ❌ Clicking during CSS transition
2. ❌ Scroll animation not complete
3. ❌ Modal fade-in/fade-out timing

**Solutions**:
```typescript
// ❌ WRONG: Click during animation
await page.click('[data-testid="theme-toggle"]');
await expect(page.locator('html')).toHaveClass('dark'); // Fails during transition

// ✅ RIGHT: Wait for animation complete
await page.click('[data-testid="theme-toggle"]');
await page.waitForFunction(() => {
  const html = document.documentElement;
  return !html.classList.contains('transitioning');
}, { timeout: 1000 }).catch(() => {});
await expect(page.locator('html')).toHaveClass('dark');

// ✅ BETTER: Use Playwright's built-in actionability checks
await page.click('[data-testid="theme-toggle"]'); // Auto-waits for actionability
await page.waitForSelector('html.dark', { state: 'attached' });

// For scroll animations
await page.locator('#features').scrollIntoViewIfNeeded();
await page.waitForTimeout(300); // Brief wait for smooth scroll
await expect(page.locator('#features')).toBeInViewport();
```

---

## 🛠️ Debugging Tools

### 1. Playwright UI Mode (Recommended)

```bash
npm run e2e:ui
```

**Benefits**:
- Interactive test execution
- Step-through debugging
- Time-travel debugging
- Visual selector picker

**Usage**:
1. Run `npm run e2e:ui`
2. Select failing test
3. Click "Pick locator" to find stable selectors
4. Use timeline to see exact failure point
5. Click "Watch mode" to re-run on file changes

### 2. Trace Viewer

```bash
# Traces are auto-generated on failure (playwright.config.ts)
# View last test trace:
npx playwright show-trace trace.zip
```

**Features**:
- Network requests timeline
- DOM snapshots at each step
- Console logs
- Screenshots at each action

### 3. Headed Mode (Visual Debugging)

```bash
npm run e2e:headed
```

**When to Use**:
- See actual browser behavior
- Verify element visibility
- Check timing issues
- Validate interactions

### 4. Debug Mode (Step-Through)

```bash
npm run e2e:debug
```

**Features**:
- Pause before each action
- Chrome DevTools integration
- Console access
- Manual DOM inspection

### 5. Video Recording

```bash
# Videos auto-recorded on failure (playwright.config.ts)
# Location: test-results/[test-name]/video.webm
```

---

## 📊 Flakiness Investigation Workflow

```
┌─────────────────────────────────────┐
│   Test Failed Intermittently?       │
└───────────┬─────────────────────────┘
            │
            v
┌─────────────────────────────────────┐
│ 1. Run 10x: npm run e2e:smoke       │
│    Count failures (flake rate)      │
└───────────┬─────────────────────────┘
            │
            v
┌─────────────────────────────────────┐
│ 2. Check trace/video:               │
│    npx playwright show-trace        │
│    Look for: timeouts, network,     │
│    selector failures                │
└───────────┬─────────────────────────┘
            │
            v
┌─────────────────────────────────────┐
│ 3. Run in UI mode:                  │
│    npm run e2e:ui                   │
│    Step through failing test        │
└───────────┬─────────────────────────┘
            │
            v
┌─────────────────────────────────────┐
│ 4. Identify pattern from guide      │
│    (timeout, race condition, etc.)  │
└───────────┬─────────────────────────┘
            │
            v
┌─────────────────────────────────────┐
│ 5. Apply fix from solutions         │
│    (stable selectors, mocks, waits) │
└───────────┬─────────────────────────┘
            │
            v
┌─────────────────────────────────────┐
│ 6. Verify: Run 10x again            │
│    Should pass 10/10                │
└─────────────────────────────────────┘
```

---

## ✅ Best Practices for Stable Tests

### 1. Use Stable Selectors

**Priority Order**:
1. `data-testid` attributes ← **BEST**
2. `aria-label` attributes
3. `role` attributes
4. Text content (locale-independent)
5. CSS classes (avoid)
6. nth-child (never use)

**Example**:
```typescript
// ✅ BEST
await page.click('[data-testid="submit-button"]');

// ✅ GOOD
await page.click('button[aria-label="Submit form"]');

// ⚠️ OK (if stable)
await page.click('button[role="button"]:has-text("Submit")');

// ❌ BAD
await page.click('.form-container > div > button.primary');

// ❌ NEVER
await page.locator('button').nth(2).click();
```

### 2. Leverage Auto-Wait

Playwright automatically waits for:
- Element to be attached to DOM
- Element to be visible
- Element to be stable (not animating)
- Element to receive events (not covered)
- Element to be enabled

```typescript
// ✅ GOOD: Auto-wait built-in
await page.click('[data-testid="button"]');
await page.fill('[data-testid="input"]', 'text');
await expect(page.locator('[data-testid="result"]')).toBeVisible();

// ❌ BAD: Manual waits (fragile)
await page.waitForTimeout(1000);
await page.click('[data-testid="button"]');
```

### 3. Use expect Assertions

```typescript
// ✅ GOOD: Retries assertion with auto-wait
await expect(page.locator('h1')).toBeVisible();
await expect(page.locator('h1')).toContainText('Welcome');

// ❌ BAD: No retry, fails immediately
const isVisible = await page.locator('h1').isVisible();
expect(isVisible).toBe(true);
```

### 4. Mock External Dependencies

```typescript
import { applyStandardMocks } from '../fixtures/network-mocks';

test.beforeEach(async ({ page }) => {
  await applyStandardMocks(page); // Blocks analytics, tracking
});
```

### 5. Test Isolation

```typescript
test.beforeEach(async ({ page }) => {
  // Fresh state for each test
  await page.context().clearCookies();
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});
```

---

## 📈 Flakiness Metrics

### Acceptable Thresholds

- **Smoke Tests**: 0% flakiness (100% reliability)
- **Regression Tests**: <5% flakiness
- **Action Required**: >5% flakiness = immediate investigation

### Measuring Flakiness

```bash
# Run test 10 times and measure pass rate
for i in {1..10}; do
  npm run e2e:smoke -- --grep "test name" >> results.txt
done

# Calculate pass rate
grep -c "passed" results.txt # Should be 10/10 for smoke tests
```

### Tracking Flakiness

Create issue for any test that:
- Fails >1 time in 10 runs (10% flakiness)
- Requires retry to pass in CI
- Shows inconsistent behavior across environments

---

## 🚨 When to Skip vs Fix

### Skip Temporarily (with ticket)

```typescript
test.skip('flaky test - investigating #ISSUE-123', async ({ page }) => {
  // Test code
});
```

**Criteria for skipping**:
- Investigation requires >2 hours
- Blocking other development
- Non-critical user flow
- **Must have tracking ticket**

### Fix Immediately

**Criteria for immediate fix**:
- Critical user flow (login, checkout)
- Smoke test failure
- Blocks PR merges
- Flakiness >20%

---

## 📚 Related Documentation

- [E2E Testing Guide](E2E_Testing_Guide.md)
- [Playwright Configuration](../../playwright.config.ts)
- [Network Mocks](../../e2e/fixtures/network-mocks.ts)
- [Sprint 7 Backlog](Sprint7_Backlog.md)

---

**Next Review**: After achieving 31/31 green smoke test status
**Owner**: QA Team / Test Automation
**Status**: ✅ Ready for Use
