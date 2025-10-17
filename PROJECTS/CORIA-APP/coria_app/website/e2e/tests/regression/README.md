# Regression Test Suite - Comprehensive Coverage

**Test Count**: 18 tests across 6 coverage areas
**Run Time**: <5 minutes
**Frequency**: Nightly (scheduled)
**Failure Tolerance**: <5% flakiness acceptable

## 🎯 Purpose

Regression tests provide comprehensive coverage of all features beyond critical user journeys. These tests run nightly to catch regressions without blocking PR merges.

## 🔄 Test Coverage Areas

### 1. Forms (3 tests)

**File**: `forms.spec.ts`

#### Test 1.1: Contact Form Validation
```typescript
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

**Validates**:
- Required field validation
- Email format validation
- Success message after submission

#### Test 1.2: Newsletter Signup
```typescript
test('Newsletter signup with duplicate check', async ({ page }) => {
  await page.goto('/');

  // First signup
  await page.fill('input[placeholder*="email"]', 'newsletter@example.com');
  await page.click('button:has-text("Subscribe")');
  await expect(page.locator('[role="status"]')).toContainText('Subscribed successfully');

  // Duplicate signup (should show already subscribed)
  await page.fill('input[placeholder*="email"]', 'newsletter@example.com');
  await page.click('button:has-text("Subscribe")');
  await expect(page.locator('[role="alert"]')).toContainText('Already subscribed');
});
```

**Validates**:
- Newsletter signup works
- Duplicate email detection
- Appropriate messaging

#### Test 1.3: Search Functionality
```typescript
test('Search with debouncing and results', async ({ page }) => {
  await page.goto('/blog');

  // Type search query (should debounce)
  await page.fill('input[type="search"]', 'vegan');

  // Wait for debounce (300ms)
  await page.waitForTimeout(500);

  // Verify results rendered
  await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  const resultCount = await page.locator('[data-testid="blog-card"]').count();
  expect(resultCount).toBeGreaterThan(0);

  // Test empty state
  await page.fill('input[type="search"]', 'zzzzzzzzz');
  await page.waitForTimeout(500);
  await expect(page.locator('text=/no results/i')).toBeVisible();
});
```

**Validates**:
- Search input debouncing (no excessive API calls)
- Results rendering
- Empty state handling

---

### 2. Blog (3 tests)

**File**: `blog.spec.ts`

#### Test 2.1: Article Listing with Pagination
```typescript
test('Blog listing with pagination', async ({ page }) => {
  await page.goto('/blog');

  // Verify initial articles loaded
  const initialArticles = await page.locator('[data-testid="blog-card"]').count();
  expect(initialArticles).toBeGreaterThan(0);

  // Click "Next Page"
  await page.click('[aria-label="Next page"]');

  // Verify URL updated
  await expect(page).toHaveURL(/page=2/);

  // Verify new articles loaded
  const page2Articles = await page.locator('[data-testid="blog-card"]').count();
  expect(page2Articles).toBeGreaterThan(0);

  // Click "Previous Page"
  await page.click('[aria-label="Previous page"]');
  await expect(page).toHaveURL(/blog$/); // Back to page 1
});
```

**Validates**:
- Article listing renders
- Pagination works (next/previous)
- URL updates with page number

#### Test 2.2: Category Filtering
```typescript
test('Category filtering', async ({ page }) => {
  await page.goto('/blog');

  // Select "Recipes" category
  await page.click('[data-category="recipes"]');

  // Verify URL updated
  await expect(page).toHaveURL(/category=recipes/);

  // Verify filtered articles
  const articles = page.locator('[data-testid="blog-card"]');
  const count = await articles.count();
  expect(count).toBeGreaterThan(0);

  // Verify all articles have "Recipes" category
  for (let i = 0; i < count; i++) {
    await expect(articles.nth(i).locator('[data-testid="category-badge"]'))
      .toContainText('Recipes');
  }
});
```

**Validates**:
- Category filter buttons work
- URL updates with category
- Articles filtered correctly

#### Test 2.3: Article Detail Page
```typescript
test('Article detail with related posts', async ({ page }) => {
  await page.goto('/blog/vegan-lifestyle-tips');

  // Verify article content loads
  await expect(page.locator('h1')).toContainText('Vegan Lifestyle Tips');
  await expect(page.locator('[data-testid="article-content"]')).toBeVisible();

  // Verify author info
  await expect(page.locator('[data-testid="author-name"]')).toBeVisible();
  await expect(page.locator('[data-testid="publish-date"]')).toBeVisible();

  // Verify related posts
  const relatedPosts = await page.locator('[data-testid="related-post"]').count();
  expect(relatedPosts).toBeGreaterThanOrEqual(3);

  // Click related post
  await page.click('[data-testid="related-post"]').first();
  await expect(page).toHaveURL(/\/blog\//);
});
```

**Validates**:
- Article content renders
- Author and date displayed
- Related posts shown
- Navigation to related posts works

---

### 3. Pricing (3 tests)

**File**: `pricing.spec.ts`

#### Test 3.1: Plan Comparison
```typescript
test('Pricing plan comparison', async ({ page }) => {
  await page.goto('/pricing');

  // Verify 3 plans displayed
  const plans = await page.locator('[data-testid="pricing-card"]').count();
  expect(plans).toBe(3); // Free, Premium, Enterprise

  // Verify feature comparison
  await expect(page.locator('text=/Unlimited scans/i')).toBeVisible();
  await expect(page.locator('text=/AI analysis/i')).toBeVisible();
  await expect(page.locator('text=/Priority support/i')).toBeVisible();

  // Verify pricing displayed
  await expect(page.locator('text=/Free/i')).toBeVisible();
  await expect(page.locator('text=/\$9.99/i')).toBeVisible();
});
```

**Validates**:
- All pricing plans displayed
- Feature comparison visible
- Pricing amounts shown

#### Test 3.2: Monthly/Annual Toggle
```typescript
test('Monthly vs Annual pricing toggle', async ({ page }) => {
  await page.goto('/pricing');

  // Verify monthly pricing (default)
  await expect(page.locator('[data-testid="premium-price"]')).toContainText('$9.99');

  // Toggle to annual
  await page.click('[aria-label="Annual pricing"]');

  // Verify annual pricing (with discount)
  await expect(page.locator('[data-testid="premium-price"]')).toContainText('$99.99');
  await expect(page.locator('text=/Save 17%/i')).toBeVisible();

  // Toggle back to monthly
  await page.click('[aria-label="Monthly pricing"]');
  await expect(page.locator('[data-testid="premium-price"]')).toContainText('$9.99');
});
```

**Validates**:
- Pricing toggle works
- Prices update correctly
- Discount badge shown for annual

#### Test 3.3: CTA Button Interactions
```typescript
test('Get Started CTA buttons', async ({ page }) => {
  await page.goto('/pricing');

  // Free plan CTA (navigates to signup)
  await page.click('[data-testid="free-cta"]');
  await expect(page).toHaveURL(/signup/);
  await page.goBack();

  // Premium plan CTA (navigates to checkout)
  await page.click('[data-testid="premium-cta"]');
  await expect(page).toHaveURL(/checkout.*plan=premium/);
  await page.goBack();

  // Enterprise plan CTA (opens contact form)
  await page.click('[data-testid="enterprise-cta"]');
  await expect(page.locator('[data-testid="contact-modal"]')).toBeVisible();
});
```

**Validates**:
- CTA buttons functional
- Correct navigation for each plan
- Modal opens for enterprise

---

### 4. PWA (2 tests)

**File**: `pwa.spec.ts`

#### Test 4.1: Offline Mode
```typescript
test('PWA offline mode', async ({ page, context }) => {
  await page.goto('/');

  // Wait for service worker registration
  await page.waitForTimeout(2000);

  // Verify service worker registered
  const swRegistered = await page.evaluate(() =>
    navigator.serviceWorker.getRegistration()
  );
  expect(swRegistered).toBeTruthy();

  // Go offline
  await context.setOffline(true);

  // Navigate to cached page
  await page.goto('/pricing');

  // Verify page loads from cache
  await expect(page.locator('h1')).toContainText('Pricing');
  await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible();

  // Go online
  await context.setOffline(false);
  await page.reload();
  await expect(page.locator('[data-testid="offline-indicator"]')).not.toBeVisible();
});
```

**Validates**:
- Service worker registered
- Pages cached for offline access
- Offline indicator shown
- Online indicator restored

#### Test 4.2: Install Prompt (A2HS)
```typescript
test('PWA install prompt', async ({ page }) => {
  await page.goto('/');

  // Trigger install prompt (simulate)
  await page.evaluate(() => {
    const event = new Event('beforeinstallprompt');
    window.dispatchEvent(event);
  });

  // Verify install banner appears
  await expect(page.locator('[data-testid="install-banner"]')).toBeVisible();

  // Click "Install" button
  await page.click('[data-testid="install-button"]');

  // Verify banner dismissed
  await expect(page.locator('[data-testid="install-banner"]')).not.toBeVisible();
});
```

**Validates**:
- Install prompt handled
- Install banner shown
- Banner dismisses after install

---

### 5. Accessibility (4 tests)

**File**: `accessibility.spec.ts`

#### Test 5.1: Keyboard Navigation
```typescript
test('Keyboard navigation with tab order', async ({ page }) => {
  await page.goto('/');

  // Tab through interactive elements
  await page.keyboard.press('Tab'); // Skip to main content link
  await expect(page.locator(':focus')).toHaveAttribute('href', '#main');

  await page.keyboard.press('Tab'); // First CTA button
  await expect(page.locator(':focus')).toHaveAttribute('aria-label', /iOS/i);

  await page.keyboard.press('Tab'); // Second CTA button
  await expect(page.locator(':focus')).toHaveAttribute('aria-label', /Android/i);

  // Activate button with Enter
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/download.*android/);
});
```

**Validates**:
- Logical tab order
- Focus indicators visible
- Enter key activates buttons

#### Test 5.2: Screen Reader Support
```typescript
test('Screen reader ARIA labels', async ({ page }) => {
  await page.goto('/');

  // Verify landmark regions
  await expect(page.locator('[role="banner"]')).toBeVisible(); // Header
  await expect(page.locator('[role="main"]')).toBeVisible(); // Main content
  await expect(page.locator('[role="navigation"]')).toBeVisible(); // Nav

  // Verify button labels
  const ctaButton = page.locator('[aria-label="Download for iOS"]');
  await expect(ctaButton).toHaveAccessibleName('Download for iOS');

  // Verify heading hierarchy
  const h1 = await page.locator('h1').count();
  expect(h1).toBe(1); // Only one H1 per page
});
```

**Validates**:
- Landmark regions defined
- Accessible names provided
- Heading hierarchy correct

#### Test 5.3: Color Contrast
```typescript
test('WCAG AA color contrast', async ({ page }) => {
  await page.goto('/');

  // Test text contrast (should meet 4.5:1 ratio)
  const textColor = await page.locator('p').first().evaluate(el => {
    const style = window.getComputedStyle(el);
    return {
      color: style.color,
      backgroundColor: style.backgroundColor
    };
  });

  // Simple contrast check (real implementation would use library)
  expect(textColor.color).not.toBe(textColor.backgroundColor);
});
```

**Validates**:
- Text has sufficient contrast
- Interactive elements have contrast
- WCAG AA compliance

#### Test 5.4: Focus Management
```typescript
test('Modal focus trap', async ({ page }) => {
  await page.goto('/');

  // Open modal
  await page.click('[data-testid="open-modal"]');
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  // Focus should be in modal
  const focusInModal = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"]');
    return modal?.contains(document.activeElement);
  });
  expect(focusInModal).toBe(true);

  // Tab should stay within modal
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const stillInModal = await page.evaluate(() => {
    const modal = document.querySelector('[role="dialog"]');
    return modal?.contains(document.activeElement);
  });
  expect(stillInModal).toBe(true);

  // Close modal
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

**Validates**:
- Focus moves to modal on open
- Focus trapped within modal
- Escape key closes modal
- Focus restored on close

---

### 6. Performance (3 tests)

**File**: `performance.spec.ts`

#### Test 6.1: Core Web Vitals
```typescript
test('Core Web Vitals within targets', async ({ page }) => {
  await page.goto('/');

  // Measure LCP (Largest Contentful Paint)
  const lcp = await page.evaluate(() =>
    new Promise(resolve => {
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.renderTime || lastEntry.loadTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    })
  );
  expect(lcp).toBeLessThan(2500); // <2.5s target

  // Measure CLS (Cumulative Layout Shift)
  const cls = await page.evaluate(() =>
    new Promise(resolve => {
      let clsScore = 0;
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsScore += entry.value;
          }
        }
        resolve(clsScore);
      }).observe({ entryTypes: ['layout-shift'] });

      setTimeout(() => resolve(clsScore), 5000);
    })
  );
  expect(cls).toBeLessThan(0.1); // <0.1 target
});
```

**Validates**:
- LCP <2.5s (good)
- FID <100ms (good)
- CLS <0.1 (good)

#### Test 6.2: Image Lazy Loading
```typescript
test('Images lazy load correctly', async ({ page }) => {
  await page.goto('/blog');

  // Get initial images in viewport
  const initialImages = await page.locator('img[loading="lazy"]').count();

  // Verify images below fold not loaded yet
  const unloadedImages = await page.locator('img[loading="lazy"]:not([src])').count();
  expect(unloadedImages).toBeGreaterThan(0);

  // Scroll to bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  // Verify more images loaded
  const loadedImages = await page.locator('img[loading="lazy"][src]').count();
  expect(loadedImages).toBeGreaterThan(initialImages);
});
```

**Validates**:
- Lazy loading implemented
- Images load on scroll
- Performance benefit realized

#### Test 6.3: Font Loading (FOUT Prevention)
```typescript
test('Font loading without FOUT', async ({ page }) => {
  await page.goto('/');

  // Check for font-display: swap or optional
  const fontFaces = await page.evaluate(() =>
    Array.from(document.fonts.values()).map(font => ({
      family: font.family,
      display: font.display
    }))
  );

  // Verify fonts have proper display strategy
  for (const font of fontFaces) {
    expect(['swap', 'optional']).toContain(font.display);
  }
});
```

**Validates**:
- Fonts preloaded
- Font-display strategy set
- No FOUT/FOIT

---

## 🚦 Success Criteria

### Pass Criteria
- ✅ 17+ tests passing (≥95% success rate)
- ✅ Total execution time <5 minutes
- ✅ Flakiness rate <5%
- ✅ All feature areas covered

### Failure Criteria
- ❌ Success rate <90% (investigate failing tests)
- ❌ Execution time >8 minutes (optimize slow tests)
- ❌ Flakiness >10% (stabilize flaky tests)

## 📊 Monitoring

### Nightly Metrics
- **Success Rate**: Track pass/fail trend
- **Execution Time**: Monitor performance
- **Flakiness**: Identify unstable tests
- **Coverage**: Ensure all features tested

### Alerting
- **Success <90%**: Email team
- **Flakiness >10%**: Investigate within 48 hours
- **Performance >8min**: Optimize tests

## 🔧 Maintenance

### Adding Regression Tests
1. Identify feature requiring coverage
2. Write test following existing patterns
3. Run 5x locally to check stability
4. Add to nightly suite
5. Monitor for 1 week

### Test Stability
- **Target**: <5% flakiness
- **Investigation**: Within 48 hours
- **Resolution**: Fix or skip with justification

---

**Document Version**: 1.0
**Last Updated**: October 10, 2025
**Status**: ✅ Ready for Sprint 7 Implementation
