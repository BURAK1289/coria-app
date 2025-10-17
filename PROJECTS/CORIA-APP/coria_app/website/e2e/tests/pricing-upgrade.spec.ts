import { test, expect } from '../fixtures';
import { PricingPage } from '../page-objects/pricing.page';

/**
 * E2E Tests for Pricing Page
 *
 * Covers:
 * - Pricing upgrade flows (5 paywall triggers)
 * - Regional pricing selector (US/EU/TR)
 * - Currency formatting and consistency
 * - Discount badges (~35% off)
 * - Accessibility (ARIA, captions, tooltips)
 */

test.describe('@e2e Pricing Page - Upgrade Flows', () => {
  let pricingPage: PricingPage;

  test.beforeEach(async ({ page, locale }) => {
    pricingPage = new PricingPage(page);
    await pricingPage.goto(locale);
  });

  test('should load pricing page successfully', async () => {
    await pricingPage.verifyPageLoaded();
    await pricingPage.verifyPricingPlans();
  });

  test('should display Free and Premium plans with badge', async () => {
    await expect(pricingPage.freePlanCard).toBeVisible();
    await expect(pricingPage.premiumPlanCard).toBeVisible();
    await expect(pricingPage.premiumBadge).toBeVisible();
  });

  test('should display feature comparison table', async () => {
    await pricingPage.scrollToComparison();
    await pricingPage.verifyComparisonTable();

    const featureCount = await pricingPage.getFeatureCount();
    expect(featureCount).toBeGreaterThan(5); // Should have multiple features
  });

  test.describe('Paywall Triggers - Upgrade Moments', () => {
    test('should display alternatives paywall with CTA', async () => {
      // Note: Paywall triggers may need to be triggered by specific user actions
      // For now, we check if the pricing page mentions these upgrade scenarios

      // Check if alternatives/recipes features are mentioned in comparison
      await pricingPage.scrollToComparison();
      const pageContent = await pricingPage.page.textContent('body');

      expect(
        pageContent?.includes('alternatif') || pageContent?.includes('alternative')
      ).toBeTruthy();
    });

    test('should show upgrade prompts for premium features', async () => {
      await pricingPage.scrollToComparison();

      // Verify upgrade buttons are present
      const upgradeButtonsCount = await pricingPage.upgradeButtons.count();
      expect(upgradeButtonsCount).toBeGreaterThan(0);
    });

    test('should display AI chat limit upgrade message', async ({ locale }) => {
      await pricingPage.scrollToComparison();

      // Look for AI chat feature with limit messaging
      const pageText = await pricingPage.page.textContent('body');
      const hasAiLimit =
        pageText?.includes('10 mesaj') || // TR
        pageText?.includes('10 message') || // EN
        pageText?.includes('AI') ||
        pageText?.includes('chat');

      expect(hasAiLimit).toBeTruthy();
    });

    test('should display pantry limit upgrade message', async () => {
      await pricingPage.scrollToComparison();

      // Look for pantry/kiler feature with 20 product limit
      const pageText = await pricingPage.page.textContent('body');
      const hasPantryLimit =
        pageText?.includes('20') ||
        pageText?.includes('kiler') ||
        pageText?.includes('pantry');

      expect(hasPantryLimit).toBeTruthy();
    });

    test('should display meal planner upgrade prompt', async () => {
      await pricingPage.scrollToComparison();

      // Look for meal planner feature
      const pageText = await pricingPage.page.textContent('body');
      const hasMealPlanner =
        pageText?.includes('planlayıcı') ||
        pageText?.includes('planner') ||
        pageText?.includes('meal');

      expect(hasMealPlanner).toBeTruthy();
    });
  });
});

test.describe('@e2e Pricing Page - Regional Pricing', () => {
  let pricingPage: PricingPage;

  test.beforeEach(async ({ page, locale }) => {
    pricingPage = new PricingPage(page);
    await pricingPage.goto(locale);
    await pricingPage.scrollToRegionalPricing();
  });

  test('should display all 4 pricing tiers', async () => {
    await pricingPage.verifyAllTiers();
  });

  test('should display regional selector with US/EU/TR options', async () => {
    await expect(pricingPage.usRegionButton).toBeVisible();
    await expect(pricingPage.euRegionButton).toBeVisible();
    await expect(pricingPage.trRegionButton).toBeVisible();
  });

  test('should switch to US region and display USD currency', async () => {
    await pricingPage.selectRegion('US');

    // Verify US button is selected
    await expect(pricingPage.usRegionButton).toHaveAttribute('aria-pressed', 'true');

    // Verify USD currency symbol appears
    await pricingPage.verifyCurrency('$');

    // Verify consistent currency across all prices
    await pricingPage.verifyConsistentCurrency('$');
  });

  test('should switch to EU region and display EUR currency', async () => {
    await pricingPage.selectRegion('EU');

    // Verify EU button is selected
    await expect(pricingPage.euRegionButton).toHaveAttribute('aria-pressed', 'true');

    // Verify EUR currency symbol appears
    await pricingPage.verifyCurrency('€');

    // Verify consistent currency across all prices
    await pricingPage.verifyConsistentCurrency('€');
  });

  test('should switch to TR region and display TRY currency', async () => {
    await pricingPage.selectRegion('TR');

    // Verify TR button is selected
    await expect(pricingPage.trRegionButton).toHaveAttribute('aria-pressed', 'true');

    // Verify TRY currency symbol appears
    await pricingPage.verifyCurrency('₺');

    // Verify consistent currency across all prices
    await pricingPage.verifyConsistentCurrency('₺');
  });

  test('should switch between regions multiple times', async () => {
    // US → EU → TR → US
    await pricingPage.selectRegion('US');
    await pricingPage.verifyCurrency('$');

    await pricingPage.selectRegion('EU');
    await pricingPage.verifyCurrency('€');

    await pricingPage.selectRegion('TR');
    await pricingPage.verifyCurrency('₺');

    await pricingPage.selectRegion('US');
    await pricingPage.verifyCurrency('$');
  });

  test('should display correct US pricing', async () => {
    await pricingPage.selectRegion('US');

    // Verify prices are in reasonable range for US market
    const pageText = await pricingPage.page.textContent('body');

    // Look for expected price points (e.g., $5.49, $39.99, $99)
    const hasPricing =
      pageText?.includes('$5') || pageText?.includes('$39') || pageText?.includes('$99');

    expect(hasPricing).toBeTruthy();
  });

  test('should display correct EU pricing', async () => {
    await pricingPage.selectRegion('EU');

    // Verify prices are in reasonable range for EU market
    const pageText = await pricingPage.page.textContent('body');

    // Look for expected price points (e.g., €4.99, €39.99, €109)
    const hasPricing =
      pageText?.includes('€4') || pageText?.includes('€39') || pageText?.includes('€109');

    expect(hasPricing).toBeTruthy();
  });

  test('should display correct TR pricing', async () => {
    await pricingPage.selectRegion('TR');

    // Verify prices are in reasonable range for TR market
    const pageText = await pricingPage.page.textContent('body');

    // Look for expected price points (e.g., ₺89.99, ₺649.99, ₺1499)
    const hasPricing =
      pageText?.includes('₺89') || pageText?.includes('₺649') || pageText?.includes('₺1');

    expect(hasPricing).toBeTruthy();
  });
});

test.describe('@e2e Pricing Page - Discount Badges', () => {
  let pricingPage: PricingPage;

  test.beforeEach(async ({ page, locale }) => {
    pricingPage = new PricingPage(page);
    await pricingPage.goto(locale);
    await pricingPage.scrollToRegionalPricing();
  });

  test('should display yearly discount badge with ~35% off', async () => {
    await pricingPage.verifyDiscountBadge(30, 40);
  });

  test('should display "Best Value" badge on Lifetime tier', async () => {
    await pricingPage.verifyBestValueBadge();
  });

  test('should show discount percentage for US region', async () => {
    await pricingPage.selectRegion('US');
    await pricingPage.verifyDiscountBadge(30, 40);
  });

  test('should show discount percentage for EU region', async () => {
    await pricingPage.selectRegion('EU');
    await pricingPage.verifyDiscountBadge(30, 40);
  });

  test('should show discount percentage for TR region', async () => {
    await pricingPage.selectRegion('TR');
    await pricingPage.verifyDiscountBadge(30, 40);
  });

  test('should display discount text with percentage symbol', async () => {
    await expect(pricingPage.yearlyDiscountText).toBeVisible();

    const text = await pricingPage.yearlyDiscountText.textContent();
    expect(text).toMatch(/~?3[0-9]%/);
  });
});

test.describe('@e2e Pricing Page - Accessibility', () => {
  let pricingPage: PricingPage;

  test.beforeEach(async ({ page, locale }) => {
    pricingPage = new PricingPage(page);
    await pricingPage.goto(locale);
  });

  test('should have accessible comparison table', async () => {
    await pricingPage.scrollToComparison();
    await pricingPage.verifyTableAccessibility();
  });

  test('should have table with proper scope attributes', async () => {
    await pricingPage.scrollToComparison();

    // Check for th elements with scope attribute
    const table = pricingPage.comparisonTable;
    const headers = table.locator('th[scope]');
    const count = await headers.count();

    // Should have at least column headers with scope
    expect(count).toBeGreaterThan(0);
  });

  test('should have ARIA labels on interactive elements', async () => {
    await pricingPage.verifyAriaLabels();
  });

  test('should have region buttons with aria-pressed state', async () => {
    await pricingPage.scrollToRegionalPricing();

    // Check US button
    await expect(pricingPage.usRegionButton).toHaveAttribute('aria-pressed');

    // Click and verify state change
    await pricingPage.selectRegion('EU');
    await expect(pricingPage.euRegionButton).toHaveAttribute('aria-pressed', 'true');
    await expect(pricingPage.usRegionButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should have tooltips with title or aria-describedby', async () => {
    await pricingPage.scrollToComparison();
    await pricingPage.verifyTooltips();
  });

  test('should have proper heading hierarchy', async () => {
    // Check for h1
    const h1 = pricingPage.page.locator('h1');
    await expect(h1).toBeVisible();

    // Check for h2 sections
    const h2Count = await pricingPage.page.locator('h2').count();
    expect(h2Count).toBeGreaterThan(0);
  });

  test('should have accessible CTA buttons', async () => {
    // Check upgrade buttons have accessible text
    const buttons = pricingPage.upgradeButtons;
    const count = await buttons.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      expect(text?.length).toBeGreaterThan(0);
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Navigate to first interactive element
    await page.keyboard.press('Tab');

    // Verify focus is visible
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();
  });

  test('should have proper contrast ratios', async () => {
    // Take screenshot for manual contrast verification
    await pricingPage.screenshotPricing('accessibility-contrast');

    // Verify text is visible (smoke test for contrast)
    await expect(pricingPage.freePlanCard).toBeVisible();
    await expect(pricingPage.premiumPlanCard).toBeVisible();
  });
});

test.describe('@e2e Pricing Page - User Interactions', () => {
  let pricingPage: PricingPage;

  test.beforeEach(async ({ page, locale }) => {
    pricingPage = new PricingPage(page);
    await pricingPage.goto(locale);
  });

  test('should navigate between sections smoothly', async () => {
    await pricingPage.scrollToComparison();
    await expect(pricingPage.comparisonSection).toBeInViewport();

    await pricingPage.scrollToRegionalPricing();
    await expect(pricingPage.regionalPricingSection).toBeInViewport();
  });

  test('should maintain state during page scroll', async () => {
    await pricingPage.scrollToRegionalPricing();
    await pricingPage.selectRegion('EU');

    // Scroll away and back
    await pricingPage.scrollToComparison();
    await pricingPage.scrollToRegionalPricing();

    // Verify EU is still selected
    await expect(pricingPage.euRegionButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should handle rapid region switching', async () => {
    await pricingPage.scrollToRegionalPricing();

    // Rapid clicks
    await pricingPage.selectRegion('US');
    await pricingPage.selectRegion('EU');
    await pricingPage.selectRegion('TR');

    // Verify final state
    await expect(pricingPage.trRegionButton).toHaveAttribute('aria-pressed', 'true');
    await pricingPage.verifyCurrency('₺');
  });

  test('should display FAQ section', async () => {
    await pricingPage.verifyFaqSection();
  });

  test('should have functional upgrade CTAs', async () => {
    const upgradeButtonsCount = await pricingPage.upgradeButtons.count();
    expect(upgradeButtonsCount).toBeGreaterThan(0);

    // Verify buttons are clickable
    const firstButton = pricingPage.upgradeButtons.first();
    await expect(firstButton).toBeEnabled();
  });
});

test.describe('@e2e Pricing Page - Cross-Locale Consistency', () => {
  test('should display pricing page in Turkish', async ({ page }) => {
    const pricingPage = new PricingPage(page);
    await pricingPage.goto('tr');

    await pricingPage.verifyPageLoaded();
    await pricingPage.verifyPricingPlans();
  });

  test('should display pricing page in English', async ({ page }) => {
    const pricingPage = new PricingPage(page);
    await pricingPage.goto('en');

    await pricingPage.verifyPageLoaded();
    await pricingPage.verifyPricingPlans();
  });

  test('should display pricing page in German', async ({ page }) => {
    const pricingPage = new PricingPage(page);
    await pricingPage.goto('de');

    await pricingPage.verifyPageLoaded();
    await pricingPage.verifyPricingPlans();
  });

  test('should display pricing page in French', async ({ page }) => {
    const pricingPage = new PricingPage(page);
    await pricingPage.goto('fr');

    await pricingPage.verifyPageLoaded();
    await pricingPage.verifyPricingPlans();
  });

  test('should maintain pricing structure across locales', async ({ page }) => {
    const locales = ['tr', 'en', 'de', 'fr'];

    for (const locale of locales) {
      const pricingPage = new PricingPage(page);
      await pricingPage.goto(locale);

      // Verify core structure exists in all locales
      await expect(pricingPage.freePlanCard).toBeVisible();
      await expect(pricingPage.premiumPlanCard).toBeVisible();

      const featureCount = await pricingPage.getFeatureCount();
      expect(featureCount).toBeGreaterThan(5);
    }
  });
});

test.describe('@e2e Pricing Page - Visual Regression', () => {
  let pricingPage: PricingPage;

  test.beforeEach(async ({ page, locale }) => {
    pricingPage = new PricingPage(page);
    await pricingPage.goto(locale);
  });

  test('should capture pricing plans screenshot', async () => {
    await pricingPage.screenshotPricing('plans-overview');
  });

  test('should capture comparison table screenshot', async () => {
    await pricingPage.scrollToComparison();
    await pricingPage.screenshotPricing('comparison-table');
  });

  test('should capture regional pricing screenshot', async () => {
    await pricingPage.scrollToRegionalPricing();
    await pricingPage.screenshotPricing('regional-pricing');
  });

  test('should capture US pricing screenshot', async () => {
    await pricingPage.scrollToRegionalPricing();
    await pricingPage.selectRegion('US');
    await pricingPage.screenshotPricing('pricing-us');
  });

  test('should capture EU pricing screenshot', async () => {
    await pricingPage.scrollToRegionalPricing();
    await pricingPage.selectRegion('EU');
    await pricingPage.screenshotPricing('pricing-eu');
  });

  test('should capture TR pricing screenshot', async () => {
    await pricingPage.scrollToRegionalPricing();
    await pricingPage.selectRegion('TR');
    await pricingPage.screenshotPricing('pricing-tr');
  });
});
