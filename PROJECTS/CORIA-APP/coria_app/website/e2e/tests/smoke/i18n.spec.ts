import { test, expect } from '../../fixtures';
import { I18nPage } from '../../page-objects/i18n.page';

test.describe('@smoke Internationalization Tests', () => {
  let i18nPage: I18nPage;

  test.beforeEach(async ({ page }) => {
    i18nPage = new I18nPage(page);
    await i18nPage.goto('/', 'tr');
  });

  test('should display locale selector', async () => {
    await i18nPage.verifyLocaleSelectorVisible();
  });

  test('should switch between all locales', async () => {
    // Switch to English
    await i18nPage.switchToEnglish();
    await i18nPage.verifyCurrentLocaleIndicator('en');
    await i18nPage.verifyTranslationsLoaded('en');

    // Switch to German
    await i18nPage.switchToGerman();
    await i18nPage.verifyCurrentLocaleIndicator('de');
    await i18nPage.verifyTranslationsLoaded('de');

    // Switch to French
    await i18nPage.switchToFrench();
    await i18nPage.verifyCurrentLocaleIndicator('fr');
    await i18nPage.verifyTranslationsLoaded('fr');

    // Back to Turkish
    await i18nPage.switchToTurkish();
    await i18nPage.verifyCurrentLocaleIndicator('tr');
    await i18nPage.verifyTranslationsLoaded('tr');
  });

  test('should persist locale across page navigation', async () => {
    // Switch to English
    await i18nPage.switchToEnglish();

    // Navigate to features
    await i18nPage.clickNav('features');
    await i18nPage.waitForPageLoad();
    await i18nPage.verifyLocaleInUrl('en');

    // Navigate to pricing
    await i18nPage.clickNav('pricing');
    await i18nPage.waitForPageLoad();
    await i18nPage.verifyLocaleInUrl('en');

    // Go back
    await i18nPage.goBack();
    await i18nPage.waitForPageLoad();
    await i18nPage.verifyLocaleInUrl('en');
  });

  test('should persist locale after page reload', async () => {
    // Switch to German
    await i18nPage.switchToGerman();
    await i18nPage.verifyLocaleInUrl('de');

    // Reload page
    await i18nPage.reload();

    // Verify locale is still German
    await i18nPage.verifyLocaleInUrl('de');
    await i18nPage.verifyCurrentLocaleIndicator('de');
  });

  test('should have correct HTML lang attribute for each locale', async () => {
    const locales = ['tr', 'en', 'de', 'fr'] as const;

    for (const locale of locales) {
      await i18nPage.switchLocale(locale);
      await i18nPage.verifyLocaleMetadata(locale);
    }
  });

  test('should not display translation keys', async () => {
    // Check Turkish (default)
    await i18nPage.verifyTranslationCompleteness();

    // Check English
    await i18nPage.switchToEnglish();
    await i18nPage.verifyTranslationCompleteness();

    // Check German
    await i18nPage.switchToGerman();
    await i18nPage.verifyTranslationCompleteness();

    // Check French
    await i18nPage.switchToFrench();
    await i18nPage.verifyTranslationCompleteness();
  });

  test('should show all locale options in dropdown', async () => {
    await i18nPage.verifyAllLocaleOptions();
  });

  test('should set NEXT_LOCALE cookie when switching language', async ({ page }) => {
    // Switch to English
    await i18nPage.switchToEnglish();

    // Get cookies
    const cookies = await page.context().cookies();
    const localeCookie = cookies.find(cookie => cookie.name === 'NEXT_LOCALE');

    // Verify cookie exists and has correct value
    expect(localeCookie).toBeDefined();
    expect(localeCookie?.value).toBe('en');
    expect(localeCookie?.path).toBe('/');

    // Switch to German and verify cookie updates
    await i18nPage.switchToGerman();
    const updatedCookies = await page.context().cookies();
    const updatedLocaleCookie = updatedCookies.find(cookie => cookie.name === 'NEXT_LOCALE');

    expect(updatedLocaleCookie?.value).toBe('de');
  });

  test('should respect NEXT_LOCALE cookie on initial load', async ({ page }) => {
    // Set cookie before navigation
    await page.context().addCookies([{
      name: 'NEXT_LOCALE',
      value: 'fr',
      domain: 'localhost',
      path: '/'
    }]);

    // Navigate to root
    await i18nPage.goto('/', 'tr'); // Request TR but cookie should override
    await i18nPage.waitForPageLoad();

    // Verify French locale is loaded (cookie takes precedence)
    await i18nPage.verifyLocaleInUrl('fr');
    await i18nPage.verifyCurrentLocaleIndicator('fr');
  });
});
