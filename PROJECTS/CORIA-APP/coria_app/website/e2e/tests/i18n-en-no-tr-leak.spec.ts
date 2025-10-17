import { test, expect } from '@playwright/test';

/**
 * I18N EN Locale Validation - Turkish Text Leakage Test
 *
 * Purpose: Verify that no Turkish text appears on English pages after the i18n provider fix
 * Context: Fixed getMessages() to pass locale parameter in layout.tsx
 *
 * Test Coverage:
 * - /en homepage
 * - /en/foundation
 * - /en/features
 * - /en/pricing
 *
 * Validation:
 * - No Turkish keywords appear in DOM
 * - Correct English text is displayed
 * - Language switching preserves locale integrity
 * - No fallback to Turkish (MISSING_MESSAGE check)
 */

// Known Turkish PHRASES that should NOT appear on English pages (visible text only)
// Note: Single words like "Veganlık", "Alerjen", "İndir" can appear in translation key names in HTML
// so we check for full phrases that would only appear if there's actual Turkish text leakage
const TURKISH_KEYWORDS = [
  'Android için İndir',        // "Download for Android" in Turkish
  'iOS için İndir',             // "Download for iOS" in Turkish
  'Tüm Özellikleri Keşfet',    // "Explore All Features" in Turkish
  'Ana içeriğe geç',            // "Skip to main content" - should only appear in TR, not EN
  'Vegan Yaşam Asistanı',      // Full phrase
  'Yol haritamız',
  'Misyonumuz',
  'Vizyon',
  'Değerlerimiz',
  'Konumlandırma',
  'Partnerlikler',
  'En Popüler',                 // "Most Popular" in Turkish
  "Premium'a Neden",
  'Her persona için',
  'Akıllı Kiler',               // "Smart Pantry" in Turkish
  'Sürdürülebilir',
  'Karbon İzleme',
  'Topluluk Önerileri',
  'Deneyiminizi iyileştirmek', // Cookie banner text
  'çerezler kullanıyoruz',     // Cookie banner text
  'Tümünü Kabul Et',           // "Accept All" in Turkish
  'Tümünü Reddet',             // "Reject All" in Turkish
];

// Expected English text for key components
const EXPECTED_EN_TEXT = {
  homepage: {
    title: /360° platform|vegan living/i,
    cta: /explore all features|download/i,
    downloadButton: /download for android/i,
  },
  foundation: {
    title: /foundation|impact/i,
    cta: /apply|submit/i,
  },
  features: {
    title: /features|sustainable living/i,
    items: /vegan.*analysis|ai assistant|smart pantry|esg scores|carbon.*tracking|community/i,
  },
  pricing: {
    title: /pricing|plans/i,
    mostPopular: /most popular/i,
    free: /free/i,
    premiumCta: /why.*premium|upgrade/i,
  },
};

test.describe('EN Locale i18n Validation - No Turkish Text Leakage', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('EN Homepage - No Turkish text present', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Take screenshot for documentation
    await page.screenshot({
      path: 'test-results/i18n-en/homepage-en.png',
      fullPage: true
    });

    // Get VISIBLE page text only (excludes JSON metadata in HTML)
    const pageContent = await page.locator('body').textContent();

    // Check for Turkish keywords in visible text
    const foundTurkishKeywords: string[] = [];
    for (const keyword of TURKISH_KEYWORDS) {
      if (pageContent && pageContent.includes(keyword)) {
        foundTurkishKeywords.push(keyword);
      }
    }

    // Assert no Turkish keywords found in visible text
    expect(foundTurkishKeywords,
      `Found Turkish text on EN homepage: ${foundTurkishKeywords.join(', ')}`
    ).toHaveLength(0);

    // Verify English text is present
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(EXPECTED_EN_TEXT.homepage.cta);
    expect(bodyText).toMatch(EXPECTED_EN_TEXT.homepage.downloadButton);

    // Verify specific translated components
    const featuresSection = page.locator('section').filter({
      hasText: /360° platform|vegan living/i
    });
    await expect(featuresSection).toBeVisible();

    // Check navigation download button
    const downloadBtn = page.locator('[data-testid="cta-android-nav"]');
    await expect(downloadBtn).toHaveText(/download for android/i);
  });

  test('EN Foundation Page - No Turkish text present', async ({ page }) => {
    await page.goto('/en/foundation');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/i18n-en/foundation-en.png',
      fullPage: true
    });

    const pageContent = await page.locator('body').textContent();
    const foundTurkishKeywords: string[] = [];

    for (const keyword of TURKISH_KEYWORDS) {
      if (pageContent && pageContent.includes(keyword)) {
        foundTurkishKeywords.push(keyword);
      }
    }

    expect(foundTurkishKeywords,
      `Found Turkish text on EN foundation page: ${foundTurkishKeywords.join(', ')}`
    ).toHaveLength(0);

    // Verify English content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(EXPECTED_EN_TEXT.foundation.title);
  });

  test('EN Features Page - No Turkish text present', async ({ page }) => {
    await page.goto('/en/features');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/i18n-en/features-en.png',
      fullPage: true
    });

    const pageContent = await page.locator('body').textContent();
    const foundTurkishKeywords: string[] = [];

    for (const keyword of TURKISH_KEYWORDS) {
      if (pageContent && pageContent.includes(keyword)) {
        foundTurkishKeywords.push(keyword);
      }
    }

    expect(foundTurkishKeywords,
      `Found Turkish text on EN features page: ${foundTurkishKeywords.join(', ')}`
    ).toHaveLength(0);

    // Verify English feature text
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(EXPECTED_EN_TEXT.features.items);
  });

  test('EN Pricing Page - No Turkish text present', async ({ page }) => {
    await page.goto('/en/pricing');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/i18n-en/pricing-en.png',
      fullPage: true
    });

    const pageContent = await page.locator('body').textContent();
    const foundTurkishKeywords: string[] = [];

    for (const keyword of TURKISH_KEYWORDS) {
      if (pageContent && pageContent.includes(keyword)) {
        foundTurkishKeywords.push(keyword);
      }
    }

    expect(foundTurkishKeywords,
      `Found Turkish text on EN pricing page: ${foundTurkishKeywords.join(', ')}`
    ).toHaveLength(0);

    // Verify pricing-specific English text
    const bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(EXPECTED_EN_TEXT.pricing.mostPopular);
    expect(bodyText).toMatch(EXPECTED_EN_TEXT.pricing.free);
  });

  test('Language Switching - EN → TR → EN maintains locale integrity', async ({ page }) => {
    // Start on English homepage
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Verify we're on English
    let bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(/download for android/i);

    // Switch to Turkish
    await page.goto('/tr');
    await page.waitForLoadState('networkidle');

    // Verify we're on Turkish (should have Turkish text)
    bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(/android için indir/i);

    // Switch back to English
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: 'test-results/i18n-en/language-switch-back-to-en.png',
      fullPage: true
    });

    // Verify English is properly restored (no Turkish remnants)
    bodyText = await page.locator('body').textContent();
    expect(bodyText).toMatch(/download for android/i);

    const foundTurkishKeywords: string[] = [];
    for (const keyword of TURKISH_KEYWORDS) {
      if (bodyText?.includes(keyword)) {
        foundTurkishKeywords.push(keyword);
      }
    }

    expect(foundTurkishKeywords,
      `Turkish text persisted after EN→TR→EN switch: ${foundTurkishKeywords.join(', ')}`
    ).toHaveLength(0);
  });

  test('Provider Fallback - No MISSING_MESSAGE or Turkish fallback on EN', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const pageContent = await page.locator('body').textContent();

    // Check for missing message indicators
    expect(pageContent).not.toContain('MISSING_MESSAGE');
    expect(pageContent).not.toContain('missing translation');
    expect(pageContent).not.toContain('translation.missing');

    // Verify no fallback to Turkish
    const foundTurkishKeywords: string[] = [];
    for (const keyword of TURKISH_KEYWORDS) {
      if (pageContent.includes(keyword)) {
        foundTurkishKeywords.push(keyword);
      }
    }

    expect(foundTurkishKeywords,
      `Provider fell back to Turkish: ${foundTurkishKeywords.join(', ')}`
    ).toHaveLength(0);
  });

  test('Components with Previously Hardcoded TR Text - Now Properly Translated', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Test features-showcase component
    const featuresSection = page.locator('section').filter({
      hasText: /360° platform/i
    });
    await expect(featuresSection).toBeVisible();

    const featuresSectionText = await featuresSection.textContent();

    // Previously hardcoded Turkish text that should now be English
    expect(featuresSectionText).not.toContain('Vegan yaşam için 360° platform');
    expect(featuresSectionText).not.toContain('Vegan & Alerjen Analizi');
    expect(featuresSectionText).not.toContain('AI Asistan');
    expect(featuresSectionText).not.toContain('Akıllı Kiler');
    expect(featuresSectionText).not.toContain('Tüm Özellikleri Keşfet');

    // Verify English equivalents are present
    expect(featuresSectionText).toMatch(/vegan.*allergen|allergen.*analysis/i);
    expect(featuresSectionText).toMatch(/ai assistant/i);
    expect(featuresSectionText).toMatch(/smart pantry/i);
    expect(featuresSectionText).toMatch(/explore all features/i);

    await page.screenshot({
      path: 'test-results/i18n-en/features-showcase-component.png'
    });
  });

  test('Pricing Components - mostPopular and free labels in English', async ({ page }) => {
    await page.goto('/en/pricing');
    await page.waitForLoadState('networkidle');

    const pageContent = await page.locator('body').textContent();

    // Previously hardcoded Turkish text
    expect(pageContent).not.toContain('En Popüler');
    expect(pageContent).not.toContain('Ücretsiz');

    // English equivalents
    expect(pageContent).toMatch(/most popular/i);
    expect(pageContent).toMatch(/free/i);

    await page.screenshot({
      path: 'test-results/i18n-en/pricing-labels.png'
    });
  });

  test('Navigation Component - downloadAndroid button in English', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const downloadBtn = page.locator('[data-testid="cta-android-nav"]');

    // Previously hardcoded as "Android için İndir"
    const btnText = await downloadBtn.textContent();
    expect(btnText).not.toContain('Android için İndir');
    expect(btnText).toMatch(/download for android/i);

    await page.screenshot({
      path: 'test-results/i18n-en/navigation-download-button.png'
    });
  });
});

test.describe('Regression Tests - Turkish Pages Still Work', () => {
  test('TR Homepage - Turkish text properly displayed', async ({ page }) => {
    await page.goto('/tr');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent();

    // Turkish text should be present on TR pages
    expect(bodyText).toMatch(/android için indir/i);
    expect(bodyText).toMatch(/vegan/i);

    await page.screenshot({
      path: 'test-results/i18n-en/tr-homepage-regression.png',
      fullPage: true
    });
  });

  test('TR Pricing - Turkish labels properly displayed', async ({ page }) => {
    await page.goto('/tr/pricing');
    await page.waitForLoadState('networkidle');

    const bodyText = await page.locator('body').textContent();

    // Turkish pricing labels should work
    expect(bodyText).toMatch(/en popüler|ücretsiz/i);

    await page.screenshot({
      path: 'test-results/i18n-en/tr-pricing-regression.png',
      fullPage: true
    });
  });
});
