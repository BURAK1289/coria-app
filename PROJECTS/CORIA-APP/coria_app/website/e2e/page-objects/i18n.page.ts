import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Internationalization Page Object Model
 * Handles locale switching and i18n verifications
 */
export class I18nPage extends BasePage {
  readonly localeOptions = {
    tr: this.page.locator('[data-testid="locale-option-tr"]'),
    en: this.page.locator('[data-testid="locale-option-en"]'),
    de: this.page.locator('[data-testid="locale-option-de"]'),
    fr: this.page.locator('[data-testid="locale-option-fr"]'),
  };

  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify locale selector is visible
   */
  async verifyLocaleSelectorVisible() {
    await expect(this.localeSelector).toBeVisible();
    await expect(this.localeSelector).toBeEnabled();
  }

  /**
   * Open locale dropdown
   */
  async openLocaleDropdown() {
    await this.localeSelector.click();
    await this.page.waitForTimeout(300); // Wait for dropdown animation
  }

  /**
   * Verify all locale options are visible in dropdown
   */
  async verifyAllLocaleOptions() {
    await this.openLocaleDropdown();

    await expect(this.localeOptions.tr).toBeVisible();
    await expect(this.localeOptions.en).toBeVisible();
    await expect(this.localeOptions.de).toBeVisible();
    await expect(this.localeOptions.fr).toBeVisible();
  }

  /**
   * Switch to Turkish
   */
  async switchToTurkish() {
    await this.switchLocale('tr');
    await this.verifyLocaleInUrl('tr');
  }

  /**
   * Switch to English
   */
  async switchToEnglish() {
    await this.switchLocale('en');
    await this.verifyLocaleInUrl('en');
  }

  /**
   * Switch to German
   */
  async switchToGerman() {
    await this.switchLocale('de');
    await this.verifyLocaleInUrl('de');
  }

  /**
   * Switch to French
   */
  async switchToFrench() {
    await this.switchLocale('fr');
    await this.verifyLocaleInUrl('fr');
  }

  /**
   * Verify locale in URL
   */
  async verifyLocaleInUrl(locale: string) {
    if (locale === 'tr') {
      // Turkish is default, might not have /tr prefix
      await expect(this.page).toHaveURL(/^\/(tr\/)?/);
    } else {
      await expect(this.page).toHaveURL(new RegExp(`/${locale}/`));
    }
  }

  /**
   * Verify current locale indicator
   */
  async verifyCurrentLocaleIndicator(expectedLocale: string) {
    const localeLabels = {
      tr: 'TR',
      en: 'EN',
      de: 'DE',
      fr: 'FR',
    };

    const expectedLabel = localeLabels[expectedLocale as keyof typeof localeLabels];
    await expect(this.localeSelector).toContainText(expectedLabel);
  }

  /**
   * Test locale switching between all languages
   */
  async testAllLocaleSwitches() {
    // Start from Turkish
    await this.goto('/', 'tr');

    // Switch to English
    await this.switchToEnglish();
    await this.verifyCurrentLocaleIndicator('en');

    // Switch to German
    await this.switchToGerman();
    await this.verifyCurrentLocaleIndicator('de');

    // Switch to French
    await this.switchToFrench();
    await this.verifyCurrentLocaleIndicator('fr');

    // Back to Turkish
    await this.switchToTurkish();
    await this.verifyCurrentLocaleIndicator('tr');
  }

  /**
   * Verify locale persists across navigation
   */
  async verifyLocalePersistenceAcrossNavigation() {
    // Set to English
    await this.switchToEnglish();

    // Navigate to different pages
    await this.clickNav('features');
    await this.waitForPageLoad();
    await this.verifyLocaleInUrl('en');

    await this.clickNav('pricing');
    await this.waitForPageLoad();
    await this.verifyLocaleInUrl('en');

    // Go back
    await this.goBack();
    await this.waitForPageLoad();
    await this.verifyLocaleInUrl('en');
  }

  /**
   * Verify locale persists after reload
   */
  async verifyLocalePersistenceAfterReload() {
    // Switch to German
    await this.switchToGerman();
    await this.verifyLocaleInUrl('de');

    // Reload page
    await this.reload();

    // Verify still in German
    await this.verifyLocaleInUrl('de');
    await this.verifyCurrentLocaleIndicator('de');
  }

  /**
   * Verify translations are loaded for locale
   */
  async verifyTranslationsLoaded(locale: string) {
    // Check that heading has non-empty text (translated)
    const heading = await this.page.locator('h1').first().textContent();
    expect(heading).toBeTruthy();
    expect(heading?.trim().length).toBeGreaterThan(0);

    // Verify no translation keys are visible (e.g., "nav.features")
    const bodyText = await this.page.locator('body').textContent();
    expect(bodyText).not.toContain('nav.');
    expect(bodyText).not.toContain('hero.');
    expect(bodyText).not.toContain('features.');
  }

  /**
   * Verify RTL support for Arabic (if implemented)
   */
  async verifyRTLSupport() {
    // Check if HTML has dir="rtl" for RTL languages
    const dir = await this.page.locator('html').getAttribute('dir');

    // For now, verify LTR languages don't have RTL
    const currentLocale = this.getCurrentLocale();
    if (['tr', 'en', 'de', 'fr'].includes(currentLocale)) {
      expect(dir).not.toBe('rtl');
    }
  }

  /**
   * Verify hreflang tags for SEO
   */
  async verifyHreflangTags() {
    const hreflangTags = await this.page.locator('link[rel="alternate"]').count();

    // Should have hreflang tags for all locales
    expect(hreflangTags).toBeGreaterThan(0);
  }

  /**
   * Get translation completeness (check for missing keys)
   */
  async verifyTranslationCompleteness() {
    const bodyText = await this.page.textContent('body');

    // Check for common translation key patterns that indicate missing translations
    const missingTranslationPatterns = [
      /\{[a-zA-Z0-9._]+\}/,  // {key.name}
      /\$t\([^)]+\)/,         // $t(key)
      /\[\[.+\]\]/,           // [[key]]
    ];

    for (const pattern of missingTranslationPatterns) {
      expect(bodyText).not.toMatch(pattern);
    }
  }

  /**
   * Test complete i18n flow
   */
  async testCompleteI18nFlow() {
    // Verify selector is visible
    await this.verifyLocaleSelectorVisible();

    // Test switching between all locales
    await this.testAllLocaleSwitches();

    // Verify persistence across navigation
    await this.switchToEnglish();
    await this.verifyLocalePersistenceAcrossNavigation();

    // Verify persistence after reload
    await this.switchToGerman();
    await this.verifyLocalePersistenceAfterReload();

    // Verify translations are complete
    await this.verifyTranslationCompleteness();
  }

  /**
   * Verify locale metadata (lang attribute, etc.)
   */
  async verifyLocaleMetadata(locale: string) {
    // Check HTML lang attribute
    const htmlLang = await this.page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe(locale);
  }
}
