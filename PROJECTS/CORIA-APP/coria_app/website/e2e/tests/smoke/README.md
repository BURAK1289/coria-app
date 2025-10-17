# Smoke Test Suite - Critical User Journeys

**Test Count**: 15 tests across 5 coverage areas
**Run Time**: <2 minutes
**Frequency**: Every PR (CI pipeline)
**Failure Tolerance**: 0% (all must pass)

## 🎯 Purpose

Smoke tests validate critical user journeys that must always work. These tests run in CI for every PR and must pass 100% of the time before merge.

## 🔥 Test Coverage Areas

### 1. Authentication (3 tests)

**File**: `auth-flow.spec.ts`

#### Test 1.1: Email Login Flow
```typescript
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
```

**Validates**:
- Login form renders correctly
- Email/password validation works
- Successful authentication redirects to dashboard
- User menu appears after login

#### Test 1.2: Google OAuth Flow
```typescript
test('Google OAuth flow', async ({ page }) => {
  // Mock Google OAuth response
  await page.route('**/auth/google', route => route.fulfill({
    status: 200,
    body: JSON.stringify({
      token: 'mock-token-12345',
      user: { email: 'test@gmail.com', name: 'Test User' }
    })
  }));

  await page.goto('/');
  await page.click('[aria-label="Sign in with Google"]');

  // Verify successful OAuth login
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
});
```

**Validates**:
- Google OAuth button present
- OAuth flow completes successfully
- User redirected to dashboard

#### Test 1.3: Session Persistence
```typescript
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

**Validates**:
- Authentication token persisted in localStorage
- User remains logged in after page reload
- No re-authentication required

---

### 2. Navigation (4 tests)

**File**: `navigation.spec.ts`

#### Test 2.1: Bottom Navigation - All Tabs Accessible
```typescript
test('Bottom navigation - all tabs accessible', async ({ page }) => {
  await page.goto('/');

  // Test Home tab
  await page.click('[aria-label="Home"]');
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toBeVisible();

  // Test Scanner tab (direct camera access)
  await page.click('[aria-label="Scanner"]');
  await expect(page.locator('video')).toBeVisible(); // Camera feed

  // Test Profile tab
  await page.click('[aria-label="Profile"]');
  await expect(page).toHaveURL('/profile');
});
```

**Validates**:
- Bottom navigation renders on all pages
- All 3 tabs (Home, Scanner, Profile) are clickable
- Scanner directly opens camera (no intermediate screen)

#### Test 2.2: Deep Link Navigation
```typescript
test('Deep link navigation', async ({ page }) => {
  // Navigate directly to blog article
  await page.goto('/blog/vegan-lifestyle-tips');
  await expect(page.locator('h1')).toContainText('Vegan Lifestyle Tips');

  // Navigate back to blog listing
  await page.goBack();
  await expect(page).toHaveURL('/blog');
  await expect(page.locator('[data-testid="blog-listing"]')).toBeVisible();
});
```

**Validates**:
- Deep links work correctly
- Browser back button functions properly
- Navigation state preserved

#### Test 2.3: Back Navigation
```typescript
test('Browser back button navigation', async ({ page }) => {
  await page.goto('/');
  await page.click('[href="/pricing"]');
  await expect(page).toHaveURL('/pricing');

  // Use browser back
  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

**Validates**:
- Browser back button works correctly
- Navigation history preserved
- Page state restored after back navigation

#### Test 2.4: 404 Handling
```typescript
test('404 page for invalid routes', async ({ page }) => {
  await page.goto('/non-existent-page');
  await expect(page.locator('h1')).toContainText('404');
  await expect(page.locator('[href="/"]')).toBeVisible(); // Home link
});
```

**Validates**:
- Invalid routes show 404 page
- 404 page has link back to home

---

### 3. Internationalization (4 tests)

**File**: `i18n.spec.ts`

#### Test 3.1: Locale Switching TR → EN
```typescript
test('Locale switching: Turkish → English', async ({ page }) => {
  await page.goto('/');

  // Default Turkish
  await expect(page.locator('h1')).toContainText('Kalbinle Seç');

  // Switch to English
  await page.selectOption('[aria-label="Language"]', 'en');
  await expect(page.locator('h1')).toContainText('Choose with Your Heart');
});
```

**Validates**:
- Locale switcher renders correctly
- Text updates when locale changes
- No page reload required (client-side switch)

#### Test 3.2: Locale Switching EN → DE → FR
```typescript
test('Locale switching: EN → DE → FR', async ({ page }) => {
  await page.goto('/');

  // Switch to German
  await page.selectOption('[aria-label="Language"]', 'de');
  await expect(page.locator('h1')).toContainText('Wähle mit deinem Herzen');

  // Switch to French
  await page.selectOption('[aria-label="Language"]', 'fr');
  await expect(page.locator('h1')).toContainText('Choisir avec ton cœur');
});
```

**Validates**:
- All 4 locales functional (tr, en, de, fr)
- Translations load correctly
- No broken translations

#### Test 3.3: Locale Persistence Across Navigation
```typescript
test('Locale persistence across navigation', async ({ page }) => {
  await page.goto('/');

  // Switch to German
  await page.selectOption('[aria-label="Language"]', 'de');
  await expect(page.locator('[aria-label="Sprache"]')).toHaveValue('de');

  // Navigate to pricing page
  await page.click('[href="/pricing"]');

  // Verify German still active
  await expect(page.locator('[aria-label="Sprache"]')).toHaveValue('de');
  await expect(page.locator('h1')).toContainText('Preise'); // German
});
```

**Validates**:
- Locale preference persisted in localStorage
- Locale maintained across page navigation
- No locale reset on navigation

#### Test 3.4: Translation Completeness
```typescript
test('No missing translations (key leakage)', async ({ page }) => {
  const locales = ['tr', 'en', 'de', 'fr'];

  for (const locale of locales) {
    await page.goto('/');
    await page.selectOption('[aria-label="Language"]', locale);

    // Check for untranslated keys (e.g., "common.button.submit")
    const keyLeakage = await page.locator('text=/^[a-z]+\.[a-z]+\.[a-z]+$/i').count();
    expect(keyLeakage).toBe(0); // No untranslated keys
  }
});
```

**Validates**:
- No missing translations in any locale
- i18n keys not shown to users
- Translation files complete

---

### 4. Theme (2 tests)

**File**: `theme.spec.ts`

#### Test 4.1: Theme Toggle Light → Dark
```typescript
test('Theme toggle: Light → Dark', async ({ page }) => {
  await page.goto('/');

  // Verify light theme (default)
  await expect(page.locator('html')).toHaveAttribute('class', /light/);

  // Toggle to dark theme
  await page.click('[aria-label="Toggle theme"]');
  await expect(page.locator('html')).toHaveAttribute('class', /dark/);

  // Verify visual change (background color)
  const bgColor = await page.locator('body').evaluate(el =>
    window.getComputedStyle(el).backgroundColor
  );
  expect(bgColor).toMatch(/rgb\(17, 24, 39\)/); // gray-900
});
```

**Validates**:
- Theme toggle button present
- Theme switches from light to dark
- Visual changes apply (background color)

#### Test 4.2: Theme Preference Persistence
```typescript
test('Theme preference persistence', async ({ page, context }) => {
  await page.goto('/');

  // Switch to dark theme
  await page.click('[aria-label="Toggle theme"]');
  await expect(page.locator('html')).toHaveAttribute('class', /dark/);

  // Close page
  await page.close();

  // Open new page in same context
  const newPage = await context.newPage();
  await newPage.goto('/');

  // Verify dark theme persisted
  await expect(newPage.locator('html')).toHaveAttribute('class', /dark/);
});
```

**Validates**:
- Theme preference saved to localStorage
- Theme persisted across browser sessions
- No theme reset on reload

---

### 5. Scanner (2 tests)

**File**: `scanner.spec.ts`

#### Test 5.1: Camera Access Permission
```typescript
test('Camera access permission', async ({ page, context }) => {
  // Grant camera permission
  await context.grantPermissions(['camera']);

  await page.goto('/');
  await page.click('[aria-label="Scanner"]');

  // Verify camera feed visible
  await expect(page.locator('video')).toBeVisible();

  // Verify video playing
  const videoPlaying = await page.locator('video').evaluate(v => !v.paused);
  expect(videoPlaying).toBe(true);
});
```

**Validates**:
- Camera permission requested
- Camera feed renders when permission granted
- Video element playing (not paused)

#### Test 5.2: Barcode Scan Simulation
```typescript
test('Barcode scan simulation', async ({ page }) => {
  await page.goto('/scanner');

  // Mock barcode detection event
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('barcode-detected', {
      detail: { code: '8714100770122', format: 'EAN_13' }
    }));
  });

  // Verify product result displayed
  await expect(page.locator('[data-testid="product-result"]')).toBeVisible();
  await expect(page.locator('h2')).toContainText('Alpro Soya Milk');
});
```

**Validates**:
- Barcode detection event handled
- Product lookup triggered
- Result displayed to user

---

## 🚦 Success Criteria

### Pass Criteria
- ✅ All 15 tests passing (100% success rate)
- ✅ Total execution time <2 minutes
- ✅ Zero flaky tests (0% flakiness)
- ✅ All critical user flows validated

### Failure Criteria
- ❌ Any test failure (must investigate and fix immediately)
- ❌ Execution time >3 minutes (performance issue)
- ❌ Flaky tests (investigate and stabilize)

## 📊 Monitoring

### Daily Metrics
- **Success Rate**: Track pass/fail rate over time
- **Execution Time**: Monitor for performance regressions
- **Flakiness**: Identify and fix flaky tests within 24 hours

### Alerting
- **Pipeline Failure**: Email team immediately
- **Flakiness >5%**: Investigate root cause
- **Performance >3 min**: Optimize slow tests

## 🔧 Maintenance

### Adding New Smoke Tests
1. Identify critical user journey
2. Write test following existing patterns
3. Ensure test is stable (run 10x locally)
4. Add to CI pipeline
5. Monitor for 1 week for flakiness

### Removing Smoke Tests
1. Justify why test no longer critical
2. Move to regression suite (don't delete)
3. Update documentation
4. Monitor for impact

---

**Document Version**: 1.0
**Last Updated**: October 10, 2025
**Status**: ✅ Ready for Sprint 7 Implementation
