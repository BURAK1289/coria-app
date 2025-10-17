import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Navigation Page Object Model
 * Handles all navigation-related interactions
 */
export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify all navigation items are present and clickable
   */
  async verifyAllNavItems() {
    const navItems = [
      this.navFeatures,
      this.navPricing,
      this.navBlog,
      this.navFoundation,
      this.navAbout,
      this.navContact,
    ];

    for (const item of navItems) {
      await expect(item).toBeVisible();
      await expect(item).toBeEnabled();
    }
  }

  /**
   * Navigate to Features page
   */
  async gotoFeatures(locale: string = 'tr') {
    await this.clickNav('features');
    const expectedPath = locale === 'tr' ? '/features' : `/${locale}/features`;
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  /**
   * Navigate to Pricing page
   */
  async gotoPricing(locale: string = 'tr') {
    await this.clickNav('pricing');
    const expectedPath = locale === 'tr' ? '/pricing' : `/${locale}/pricing`;
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  /**
   * Navigate to Blog page
   */
  async gotoBlog(locale: string = 'tr') {
    await this.clickNav('blog');
    const expectedPath = locale === 'tr' ? '/blog' : `/${locale}/blog`;
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  /**
   * Navigate to Foundation page
   */
  async gotoFoundation(locale: string = 'tr') {
    await this.clickNav('foundation');
    const expectedPath = locale === 'tr' ? '/foundation' : `/${locale}/foundation`;
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  /**
   * Navigate to About page
   */
  async gotoAbout(locale: string = 'tr') {
    await this.clickNav('about');
    const expectedPath = locale === 'tr' ? '/about' : `/${locale}/about`;
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  /**
   * Navigate to Contact page
   */
  async gotoContact(locale: string = 'tr') {
    await this.clickNav('contact');
    const expectedPath = locale === 'tr' ? '/contact' : `/${locale}/contact`;
    await expect(this.page).toHaveURL(new RegExp(expectedPath));
  }

  /**
   * Test full navigation flow (visit all pages)
   */
  async testFullNavigationFlow(locale: string = 'tr') {
    // Start from home
    await this.goto('/', locale);

    // Navigate through all pages
    await this.gotoFeatures(locale);
    await this.gotoPricing(locale);
    await this.gotoBlog(locale);
    await this.gotoFoundation(locale);
    await this.gotoAbout(locale);
    await this.gotoContact(locale);

    // Return home
    await this.clickLogo();
    await this.verifyUrl('/', locale);
  }

  /**
   * Verify deep link navigation
   */
  async verifyDeepLink(path: string, locale: string = 'tr') {
    const fullPath = locale === 'tr' ? path : `/${locale}${path}`;
    await this.page.goto(fullPath);
    await this.waitForPageLoad();
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  /**
   * Test browser back navigation
   */
  async testBackNavigation() {
    const initialUrl = this.getCurrentUrl();

    // Navigate to another page
    await this.clickNav('features');
    await this.waitForPageLoad();

    // Go back
    await this.goBack();
    await this.waitForPageLoad();

    // Verify we're back at initial URL
    expect(this.getCurrentUrl()).toContain(initialUrl);
  }

  /**
   * Test browser forward navigation
   */
  async testForwardNavigation() {
    // Navigate to features
    await this.clickNav('features');
    await this.waitForPageLoad();
    const featuresUrl = this.getCurrentUrl();

    // Go back
    await this.goBack();
    await this.waitForPageLoad();

    // Go forward
    await this.goForward();
    await this.waitForPageLoad();

    // Verify we're back at features
    expect(this.getCurrentUrl()).toBe(featuresUrl);
  }

  /**
   * Verify 404 page for invalid routes
   */
  async verify404Page() {
    await this.page.goto('/invalid-page-that-does-not-exist');
    await this.waitForPageLoad();

    // Check for 404 indicators
    const heading = await this.page.locator('h1').textContent();
    expect(heading?.toLowerCase()).toContain('404');
  }

  /**
   * Verify active navigation state
   */
  async verifyActiveNavItem(expectedItem: 'features' | 'pricing' | 'blog' | 'foundation' | 'about' | 'contact') {
    const navMap = {
      features: this.navFeatures,
      pricing: this.navPricing,
      blog: this.navBlog,
      foundation: this.navFoundation,
      about: this.navAbout,
      contact: this.navContact,
    };

    const activeNav = navMap[expectedItem];

    // Check if the active nav has the active class or style
    const classList = await activeNav.getAttribute('class');
    expect(classList).toContain('bg-coria-primary'); // Active state styling
  }
}
