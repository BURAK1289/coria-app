import { test, expect } from '../../fixtures';
import { NavigationPage } from '../../page-objects/navigation.page';

test.describe('@smoke Navigation Tests', () => {
  let navPage: NavigationPage;

  test.beforeEach(async ({ page, locale }) => {
    navPage = new NavigationPage(page);
    await navPage.goto('/', locale);
  });

  test('should display all navigation items', async () => {
    await navPage.verifyAllNavItems();
  });

  test('should navigate to all pages successfully', async ({ locale }) => {
    // Features
    await navPage.gotoFeatures(locale);
    await expect(navPage.page).toHaveURL(new RegExp('/features'));

    // Pricing
    await navPage.gotoPricing(locale);
    await expect(navPage.page).toHaveURL(new RegExp('/pricing'));

    // Blog
    await navPage.gotoBlog(locale);
    await expect(navPage.page).toHaveURL(new RegExp('/blog'));

    // Foundation
    await navPage.gotoFoundation(locale);
    await expect(navPage.page).toHaveURL(new RegExp('/foundation'));

    // About (if exists)
    // await navPage.gotoAbout(locale);

    // Contact (if exists)
    // await navPage.gotoContact(locale);
  });

  test('should support browser back/forward navigation', async () => {
    // Navigate to features
    await navPage.clickNav('features');
    await navPage.waitForPageLoad();
    const featuresUrl = navPage.getCurrentUrl();

    // Navigate to pricing
    await navPage.clickNav('pricing');
    await navPage.waitForPageLoad();

    // Go back to features
    await navPage.goBack();
    expect(navPage.getCurrentUrl()).toContain('features');

    // Go forward to pricing
    await navPage.goForward();
    expect(navPage.getCurrentUrl()).toContain('pricing');
  });

  test('should handle deep links correctly', async ({ locale }) => {
    // Direct navigation to deep link
    await navPage.verifyDeepLink('/features', locale);
    await expect(navPage.page).toHaveURL(new RegExp('/features'));

    await navPage.verifyDeepLink('/pricing', locale);
    await expect(navPage.page).toHaveURL(new RegExp('/pricing'));
  });

  test('should display 404 page for invalid routes', async () => {
    await navPage.page.goto('/this-page-does-not-exist-123456');
    await navPage.waitForPageLoad();

    // Verify 404 page elements
    const response = navPage.page.url();
    expect(response).toContain('404');

    // Or check for 404 content
    const heading = await navPage.page.locator('h1').textContent();
    expect(heading?.toLowerCase()).toMatch(/404|not found|bulunamad/i);
  });

  test('should maintain active state for current page', async ({ locale }) => {
    // Navigate to features
    await navPage.gotoFeatures(locale);

    // Verify features nav item has active styling
    const featuresNav = navPage.navFeatures;
    const classList = await featuresNav.getAttribute('class');
    expect(classList).toContain('bg-coria-primary');
  });

  test('should return to homepage when clicking logo', async ({ locale }) => {
    // Navigate away from home
    await navPage.clickNav('features');
    await navPage.waitForPageLoad();

    // Click logo
    await navPage.clickLogo();
    await navPage.waitForPageLoad();

    // Verify we're back at homepage
    const currentUrl = navPage.getCurrentUrl();
    if (locale === 'tr') {
      expect(currentUrl).toMatch(/\/(tr\/)?(#.*)?$/); // Allow hash fragments
    } else {
      expect(currentUrl).toMatch(new RegExp(`/${locale}(/|#|$)`));
    }
  });
});
