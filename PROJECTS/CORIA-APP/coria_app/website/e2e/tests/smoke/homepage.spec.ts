import { test, expect } from '../../fixtures';
import { HomePage } from '../../page-objects/home.page';

test.describe('@smoke Homepage Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page, locale }) => {
    homePage = new HomePage(page);
    await homePage.goto(locale);
  });

  test('should load homepage successfully', async () => {
    await homePage.verifyPageRendered();
  });

  test('should display hero section with CTA buttons', async () => {
    await homePage.verifyHeroVisible();
    await homePage.verifyCtaButtons();
  });

  test('should display all key sections', async () => {
    await homePage.verifyAllSections();
  });

  test('should have functional iOS download button', async () => {
    await expect(homePage.iosCtaButton).toBeVisible();
    await expect(homePage.iosCtaButton).toBeEnabled();

    const href = await homePage.iosCtaButton.getAttribute('href');
    expect(href).toContain('apps.apple.com');

    const target = await homePage.iosCtaButton.getAttribute('target');
    expect(target).toBe('_blank');
  });

  test('should load all images successfully', async () => {
    await homePage.verifyImagesLoaded();
  });

  test('should have proper page title', async ({ locale }) => {
    const title = await homePage.getTitle();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should display navigation menu', async () => {
    await homePage.verifyNavigationVisible();
  });

  test('should display logo', async () => {
    await homePage.verifyLogoVisible();
  });

  test('should scroll to features section', async () => {
    await homePage.scrollToFeatures();
    await expect(homePage.featuresSection).toBeInViewport();
  });

  test('should display content in correct locale', async ({ locale }) => {
    const heading = await homePage.getHeroHeading();
    expect(heading).toBeTruthy();

    // Verify heading is not a translation key
    expect(heading).not.toContain('hero.');
    expect(heading).not.toContain('{');
  });
});
