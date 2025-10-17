import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Home Page Object Model
 * Represents the main landing page
 */
export class HomePage extends BasePage {
  // Hero section
  readonly heroHeading: Locator;
  readonly heroDescription: Locator;
  readonly iosCtaButton: Locator;
  readonly androidCtaButton: Locator;
  readonly heroImage: Locator;

  // Features section
  readonly featuresSection: Locator;

  // Social proof
  readonly socialProofSection: Locator;

  // CTA sections
  readonly downloadSection: Locator;

  constructor(page: Page) {
    super(page);

    // Hero section locators
    this.heroHeading = page.locator('h1').first();
    this.heroDescription = page.locator('p').first();
    this.iosCtaButton = page.locator('a[href*="apps.apple.com"]').first();
    this.androidCtaButton = page.locator('a[href*="play.google.com"]').first();
    this.heroImage = page.locator('img[alt*="CORIA"]').first();

    // Section locators
    this.featuresSection = page.locator('section').nth(1);
    this.socialProofSection = page.locator('section').nth(2);
    this.downloadSection = page.locator('section').last();
  }

  /**
   * Navigate to home page
   */
  async goto(locale: string = 'tr') {
    await super.goto('/', locale);
  }

  /**
   * Verify hero section is visible
   */
  async verifyHeroVisible() {
    await expect(this.heroHeading).toBeVisible();
    await expect(this.heroDescription).toBeVisible();
    await expect(this.iosCtaButton).toBeVisible();
  }

  /**
   * Verify hero content matches locale
   */
  async verifyHeroContent(expectedHeadingText: string) {
    await expect(this.heroHeading).toContainText(expectedHeadingText);
  }

  /**
   * Click iOS download button
   */
  async clickIosDownload() {
    await this.iosCtaButton.click();
  }

  /**
   * Click Android download button (if visible)
   */
  async clickAndroidDownload() {
    const isVisible = await this.androidCtaButton.isVisible();
    if (isVisible) {
      await this.androidCtaButton.click();
    }
  }

  /**
   * Verify CTA buttons are functional
   */
  async verifyCtaButtons() {
    // iOS button should be visible and enabled
    await expect(this.iosCtaButton).toBeVisible();
    await expect(this.iosCtaButton).toBeEnabled();

    // Verify href attributes
    const iosHref = await this.iosCtaButton.getAttribute('href');
    expect(iosHref).toContain('apps.apple.com');

    // Verify target="_blank" for external links
    const iosTarget = await this.iosCtaButton.getAttribute('target');
    expect(iosTarget).toBe('_blank');
  }

  /**
   * Scroll to features section
   */
  async scrollToFeatures() {
    await this.featuresSection.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // Wait for scroll animation
  }

  /**
   * Scroll to download section
   */
  async scrollToDownload() {
    await this.downloadSection.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify all key sections are present
   */
  async verifyAllSections() {
    // Hero section
    await this.verifyHeroVisible();

    // Features section
    await expect(this.featuresSection).toBeVisible();

    // Social proof section
    await expect(this.socialProofSection).toBeVisible();

    // Download CTA section
    await expect(this.downloadSection).toBeVisible();
  }

  /**
   * Verify images are loaded
   */
  async verifyImagesLoaded() {
    await this.page.waitForFunction(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.every(img => img.complete && img.naturalHeight > 0);
    }, { timeout: 10000 });
  }

  /**
   * Get hero heading text
   */
  async getHeroHeading(): Promise<string> {
    return await this.heroHeading.textContent() || '';
  }

  /**
   * Get hero description text
   */
  async getHeroDescription(): Promise<string> {
    return await this.heroDescription.textContent() || '';
  }

  /**
   * Verify page is fully rendered
   */
  async verifyPageRendered() {
    await this.verifyHeroVisible();
    await this.verifyNavigationVisible();
    await this.verifyLogoVisible();
    await this.verifyCtaButtons();
  }
}
