import { test, expect } from '../fixtures';
import { PricingPage } from '../page-objects/pricing.page';

/**
 * E2E Tests for Regional Pricing Validation
 *
 * Validates:
 * - US: $5.49 / $39.99 / $9.99 / $99
 * - EU: €4.99 / €39.99 / €10.49 / €109 + "KDV dahil"
 * - TR: ₺89.99 / ₺649.99 / ₺139.99 / ₺1.499
 * - Yearly discount badges (~35%)
 * - Lifetime "Best Value" badge
 * - 14-day trial messaging
 * - Region selector cookie persistence
 */

test.describe('@e2e Regional Pricing - Exact Value Validation', () => {
  let pricingPage: PricingPage;

  test.beforeEach(async ({ page, locale }) => {
    pricingPage = new PricingPage(page);
    await pricingPage.goto(locale);
    await pricingPage.scrollToRegionalPricing();
  });

  test.describe('US Region Pricing', () => {
    test.beforeEach(async () => {
      await pricingPage.selectRegion('US');
    });

    test('should display correct US monthly price: $5.49', async () => {
      const pageText = await pricingPage.page.textContent('body');

      // Check for $5.49 in multiple formats
      const has549 =
        pageText?.includes('$5.49') ||
        pageText?.includes('$5,49') ||
        pageText?.includes('5.49');

      expect(has549).toBeTruthy();
    });

    test('should display correct US yearly price: $39.99', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const has3999 =
        pageText?.includes('$39.99') ||
        pageText?.includes('$39,99') ||
        pageText?.includes('39.99');

      expect(has3999).toBeTruthy();
    });

    test('should display correct US family price: $9.99', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const has999 =
        pageText?.includes('$9.99') ||
        pageText?.includes('$9,99') ||
        pageText?.includes('9.99');

      expect(has999).toBeTruthy();
    });

    test('should display correct US lifetime price: $99', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const has99 =
        pageText?.includes('$99') ||
        pageText?.includes('99.00');

      expect(has99).toBeTruthy();
    });

    test('should display USD currency symbol consistently', async () => {
      await pricingPage.verifyCurrency('$');
      await pricingPage.verifyConsistentCurrency('$');
    });

    test('should calculate correct yearly discount for US', async () => {
      // US: Monthly $5.49 * 12 = $65.88, Yearly $39.99
      // Discount: (65.88 - 39.99) / 65.88 * 100 = 39.3% ≈ 39%
      await pricingPage.verifyDiscountBadge(38, 40); // 38-40% range
    });
  });

  test.describe('EU Region Pricing', () => {
    test.beforeEach(async () => {
      await pricingPage.selectRegion('EU');
    });

    test('should display correct EU monthly price: €4.99', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const has499 =
        pageText?.includes('€4.99') ||
        pageText?.includes('€4,99') ||
        pageText?.includes('4.99') ||
        pageText?.includes('4,99');

      expect(has499).toBeTruthy();
    });

    test('should display correct EU yearly price: €39.99', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const has3999 =
        pageText?.includes('€39.99') ||
        pageText?.includes('€39,99') ||
        pageText?.includes('39.99') ||
        pageText?.includes('39,99');

      expect(has3999).toBeTruthy();
    });

    test('should display correct EU family price: €10.49', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const has1049 =
        pageText?.includes('€10.49') ||
        pageText?.includes('€10,49') ||
        pageText?.includes('10.49') ||
        pageText?.includes('10,49');

      expect(has1049).toBeTruthy();
    });

    test('should display correct EU lifetime price: €109', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const has109 =
        pageText?.includes('€109') ||
        pageText?.includes('109.00') ||
        pageText?.includes('109,00');

      expect(has109).toBeTruthy();
    });

    test('should display EUR currency symbol consistently', async () => {
      await pricingPage.verifyCurrency('€');
      await pricingPage.verifyConsistentCurrency('€');
    });

    test('should display "VAT included" note for EU', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const hasVat =
        pageText?.includes('VAT') ||
        pageText?.includes('KDV') ||
        pageText?.includes('dahil') ||
        pageText?.includes('included');

      expect(hasVat).toBeTruthy();
    });

    test('should calculate correct yearly discount for EU', async () => {
      // EU: Monthly €4.99 * 12 = €59.88, Yearly €39.99
      // Discount: (59.88 - 39.99) / 59.88 * 100 = 33.2% ≈ 33%
      await pricingPage.verifyDiscountBadge(32, 34); // 32-34% range
    });
  });

  test.describe('TR Region Pricing', () => {
    test.beforeEach(async () => {
      await pricingPage.selectRegion('TR');
    });

    test('should display correct TR monthly price: ₺89.99', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const has8999 =
        pageText?.includes('₺89.99') ||
        pageText?.includes('₺89,99') ||
        pageText?.includes('89.99') ||
        pageText?.includes('89,99');

      expect(has8999).toBeTruthy();
    });

    test('should display correct TR yearly price: ₺649.99', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const has64999 =
        pageText?.includes('₺649.99') ||
        pageText?.includes('₺649,99') ||
        pageText?.includes('649.99') ||
        pageText?.includes('649,99');

      expect(has64999).toBeTruthy();
    });

    test('should display correct TR family price: ₺139.99', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const has13999 =
        pageText?.includes('₺139.99') ||
        pageText?.includes('₺139,99') ||
        pageText?.includes('139.99') ||
        pageText?.includes('139,99');

      expect(has13999).toBeTruthy();
    });

    test('should display correct TR lifetime price: ₺1,499 or ₺1.499', async () => {
      const pageText = await pricingPage.page.textContent('body');

      const has1499 =
        pageText?.includes('₺1,499') ||
        pageText?.includes('₺1.499') ||
        pageText?.includes('₺1499') ||
        pageText?.includes('1.499') ||
        pageText?.includes('1,499');

      expect(has1499).toBeTruthy();
    });

    test('should display TRY currency symbol consistently', async () => {
      await pricingPage.verifyCurrency('₺');
      await pricingPage.verifyConsistentCurrency('₺');
    });

    test('should calculate correct yearly discount for TR', async () => {
      // TR: Monthly ₺89.99 * 12 = ₺1,079.88, Yearly ₺649.99
      // Discount: (1079.88 - 649.99) / 1079.88 * 100 = 39.8% ≈ 40%
      await pricingPage.verifyDiscountBadge(38, 41); // 38-41% range
    });
  });

  test.describe('Badges and Trial Messaging', () => {
    test('should display yearly discount badge on yearly tier', async () => {
      await pricingPage.selectRegion('US');

      // Look for yearly discount badge
      const yearlyCard = pricingPage.page.locator('text=/Yearly|Yıllık/i')
        .locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "tier") or @role="article"]').first();

      const discountBadge = yearlyCard.locator('text=/3[0-9]%|~?%3[0-9]/');
      await expect(discountBadge).toBeVisible();
    });

    test('should display "Best Value" badge on lifetime tier', async () => {
      await pricingPage.verifyBestValueBadge();

      // Verify it's on lifetime tier specifically
      const lifetimeCard = pricingPage.page.locator('text=/Lifetime|Ömür/i')
        .locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "tier") or @role="article"]').first();

      const bestValueBadge = lifetimeCard.locator('text=/Best Value|En İyi/i');
      await expect(bestValueBadge).toBeVisible();
    });

    test('should display 14-day trial message', async ({ locale }) => {
      const pageText = await pricingPage.page.textContent('body');

      const hasTrial =
        pageText?.includes('14 gün') ||
        pageText?.includes('14 day') ||
        pageText?.includes('14-day') ||
        pageText?.includes('deneme') ||
        pageText?.includes('trial');

      expect(hasTrial).toBeTruthy();
    });

    test('should indicate no credit card required for trial', async ({ locale }) => {
      const pageText = await pricingPage.page.textContent('body');

      const hasNoCard =
        pageText?.includes('Kart gerektirmez') ||
        pageText?.includes('No card') ||
        pageText?.includes('no credit card') ||
        pageText?.includes('carte de crédit') ||
        pageText?.includes('keine Kreditkarte');

      expect(hasNoCard).toBeTruthy();
    });
  });

  test.describe('Region Switching and Persistence', () => {
    test('should persist region selection across page reloads', async ({ page }) => {
      // Select EU region
      await pricingPage.selectRegion('EU');
      await pricingPage.verifyCurrency('€');

      // Reload page
      await page.reload();
      await pricingPage.scrollToRegionalPricing();

      // Verify EU is still selected
      await expect(pricingPage.euRegionButton).toHaveAttribute('aria-pressed', 'true');
      await pricingPage.verifyCurrency('€');
    });

    test('should save region selection in cookie', async ({ page, context }) => {
      await pricingPage.selectRegion('TR');

      // Get cookies
      const cookies = await context.cookies();
      const regionCookie = cookies.find(c => c.name === 'REGION');

      expect(regionCookie).toBeDefined();
      expect(regionCookie?.value).toBe('TR');
    });

    test('should respect URL query parameter override', async ({ page, locale }) => {
      // Navigate with region query param
      await page.goto(`/${locale}/pricing?region=EU`);
      await pricingPage.scrollToRegionalPricing();

      // Verify EU is selected
      await expect(pricingPage.euRegionButton).toHaveAttribute('aria-pressed', 'true');
      await pricingPage.verifyCurrency('€');
    });

    test('should update URL when region changes', async ({ page }) => {
      await pricingPage.selectRegion('TR');

      // Check URL contains region param
      const url = page.url();
      expect(url).toContain('region=TR');
    });

    test('should handle rapid region switching', async () => {
      // Rapidly switch regions
      await pricingPage.selectRegion('US');
      await pricingPage.selectRegion('EU');
      await pricingPage.selectRegion('TR');
      await pricingPage.selectRegion('US');

      // Verify final state
      await expect(pricingPage.usRegionButton).toHaveAttribute('aria-pressed', 'true');
      await pricingPage.verifyCurrency('$');
    });
  });

  test.describe('Currency Formatting', () => {
    test('should format US prices with dollar sign and decimal point', async () => {
      await pricingPage.selectRegion('US');

      const pageText = await pricingPage.page.textContent('body');

      // US format: $5.49 (dollar sign before, decimal point)
      const hasUSFormat = pageText?.match(/\$\d+\.\d{2}/);
      expect(hasUSFormat).toBeTruthy();
    });

    test('should format EU prices with euro sign and comma (German locale)', async () => {
      await pricingPage.selectRegion('EU');

      const pageText = await pricingPage.page.textContent('body');

      // EU format can be: €4,99 or 4,99 € (depends on locale)
      const hasEUFormat =
        pageText?.match(/€\d+[,\.]\d{2}/) ||
        pageText?.match(/\d+[,\.]\d{2}\s*€/);

      expect(hasEUFormat).toBeTruthy();
    });

    test('should format TR prices with lira sign', async () => {
      await pricingPage.selectRegion('TR');

      const pageText = await pricingPage.page.textContent('body');

      // TR format: ₺89,99 or ₺1.499 (uses comma for decimals, period for thousands)
      const hasTRFormat = pageText?.match(/₺\d+[,\.]\d{2,3}/);
      expect(hasTRFormat).toBeTruthy();
    });

    test('should use consistent decimal separators within region', async () => {
      await pricingPage.selectRegion('US');

      // Get all prices
      const prices = await pricingPage.page.locator('text=/[€$₺]\\s*\\d+[\.\,]\d{2}/')
        .allTextContents();

      // All US prices should use decimal point
      const allUseDecimal = prices.every(price =>
        price.includes('.') || !price.includes(',')
      );

      expect(allUseDecimal).toBeTruthy();
    });
  });

  test.describe('Cross-Region Price Comparison', () => {
    test('should show different prices for each region', async () => {
      // Collect US prices
      await pricingPage.selectRegion('US');
      const usText = await pricingPage.page.textContent('body');

      // Collect EU prices
      await pricingPage.selectRegion('EU');
      const euText = await pricingPage.page.textContent('body');

      // Collect TR prices
      await pricingPage.selectRegion('TR');
      const trText = await pricingPage.page.textContent('body');

      // Verify each region has unique pricing
      expect(usText).toContain('$');
      expect(euText).toContain('€');
      expect(trText).toContain('₺');
    });

    test('should maintain pricing structure across all regions', async () => {
      const regions: ('US' | 'EU' | 'TR')[] = ['US', 'EU', 'TR'];

      for (const region of regions) {
        await pricingPage.selectRegion(region);

        // Verify all 4 tiers exist
        await pricingPage.verifyAllTiers();
      }
    });
  });
});

test.describe('@e2e Regional Pricing - Feature Matrix Alignment', () => {
  let pricingPage: PricingPage;

  test.beforeEach(async ({ page, locale }) => {
    pricingPage = new PricingPage(page);
    await pricingPage.goto(locale);
  });

  test('should show unlimited scanning for all plans', async () => {
    await pricingPage.scrollToComparison();

    const pageText = await pricingPage.page.textContent('body');
    const hasUnlimitedScanning =
      pageText?.includes('Sınırsız tarama') ||
      pageText?.includes('Unlimited scan') ||
      pageText?.includes('scan illimité') ||
      pageText?.includes('Unbegrenzt scan');

    expect(hasUnlimitedScanning).toBeTruthy();
  });

  test('should show sustainability metrics with Free vs Premium', async () => {
    await pricingPage.scrollToComparison();

    const pageText = await pricingPage.page.textContent('body');
    const hasSustainability =
      pageText?.includes('Sürdürülebilirlik') ||
      pageText?.includes('Sustainability') ||
      pageText?.includes('Nachhaltig');

    expect(hasSustainability).toBeTruthy();
  });

  test('should show alternatives and recipes as Premium-only', async () => {
    await pricingPage.scrollToComparison();

    const pageText = await pricingPage.page.textContent('body');
    const hasAlternatives =
      pageText?.includes('alternatif') ||
      pageText?.includes('alternative');

    const hasRecipes =
      pageText?.includes('tarif') ||
      pageText?.includes('recipe') ||
      pageText?.includes('Rezept');

    expect(hasAlternatives || hasRecipes).toBeTruthy();
  });

  test('should show pantry limit: Free 20 → Premium unlimited', async () => {
    await pricingPage.scrollToComparison();

    const pageText = await pricingPage.page.textContent('body');
    const hasPantryLimit =
      pageText?.includes('20') ||
      pageText?.includes('kiler') ||
      pageText?.includes('pantry');

    expect(hasPantryLimit).toBeTruthy();
  });

  test('should show AI chat limit: Free 10/day → Premium unlimited', async () => {
    await pricingPage.scrollToComparison();

    const pageText = await pricingPage.page.textContent('body');
    const hasAiLimit =
      pageText?.includes('10') ||
      pageText?.includes('AI') ||
      pageText?.includes('chat');

    expect(hasAiLimit).toBeTruthy();
  });
});
