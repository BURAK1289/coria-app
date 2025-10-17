import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { getLocalStorage, setLocalStorage } from '../utils/helpers';

/**
 * Theme Page Object Model
 * Handles theme-related interactions and verifications
 */
export class ThemePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Verify theme toggle button is visible
   */
  async verifyThemeToggleVisible() {
    await expect(this.themeToggle).toBeVisible();
    await expect(this.themeToggle).toBeEnabled();
  }

  /**
   * Toggle theme and verify change
   */
  async toggleAndVerify() {
    const initialTheme = await this.getCurrentTheme();
    const expectedTheme = initialTheme === 'dark' ? 'light' : 'dark';

    await this.toggleTheme();
    await this.waitForTheme(expectedTheme);

    const newTheme = await this.getCurrentTheme();
    expect(newTheme).toBe(expectedTheme);

    return newTheme;
  }

  /**
   * Verify theme persists after reload
   */
  async verifyThemePersistence() {
    // Toggle theme
    const themeAfterToggle = await this.toggleAndVerify();

    // Reload page
    await this.reload();

    // Verify theme is still the same
    const themeAfterReload = await this.getCurrentTheme();
    expect(themeAfterReload).toBe(themeAfterToggle);
  }

  /**
   * Verify theme persists across navigation
   */
  async verifyThemePersistenceAcrossNavigation() {
    // Set to dark theme
    const currentTheme = await this.getCurrentTheme();
    if (currentTheme !== 'dark') {
      await this.toggleTheme();
      await this.waitForTheme('dark');
    }

    // Navigate to another page
    await this.clickNav('features');
    await this.waitForPageLoad();

    // Verify theme is still dark
    const themeOnNewPage = await this.getCurrentTheme();
    expect(themeOnNewPage).toBe('dark');

    // Navigate back
    await this.goBack();
    await this.waitForPageLoad();

    // Verify theme is still dark
    const themeAfterBack = await this.getCurrentTheme();
    expect(themeAfterBack).toBe('dark');
  }

  /**
   * Verify light theme CSS variables
   */
  async verifyLightThemeStyles() {
    const currentTheme = await this.getCurrentTheme();
    if (currentTheme !== 'light') {
      await this.toggleTheme();
      await this.waitForTheme('light');
    }

    const backgroundColor = await this.page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    // Light theme should have light background
    expect(backgroundColor).not.toBe('rgb(0, 0, 0)');
  }

  /**
   * Verify dark theme CSS variables
   */
  async verifyDarkThemeStyles() {
    const currentTheme = await this.getCurrentTheme();
    if (currentTheme !== 'dark') {
      await this.toggleTheme();
      await this.waitForTheme('dark');
    }

    const isDarkClass = await this.page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });

    expect(isDarkClass).toBe(true);
  }

  /**
   * Get theme from localStorage
   */
  async getStoredTheme(): Promise<string | null> {
    return await getLocalStorage(this.page, 'coria-theme');
  }

  /**
   * Set theme in localStorage
   */
  async setStoredTheme(theme: 'light' | 'dark' | 'system') {
    await setLocalStorage(this.page, 'coria-theme', theme);
  }

  /**
   * Verify theme icon changes based on theme
   */
  async verifyThemeIcon() {
    const currentTheme = await this.getCurrentTheme();

    // Get SVG path data to identify icon type
    const svgPath = await this.themeToggle.locator('svg path').first().getAttribute('d');

    if (currentTheme === 'dark') {
      // Dark theme shows sun icon
      expect(svgPath).toContain('M12 3v1m0 16v1m9-9h-1M4 12H3');
    } else {
      // Light theme shows moon icon
      expect(svgPath).toContain('M20.354 15.354A9 9 0 018.646 3.646');
    }
  }

  /**
   * Test complete theme switching flow
   */
  async testCompleteThemeFlow() {
    // Verify toggle is visible
    await this.verifyThemeToggleVisible();

    // Toggle from current theme
    const initialTheme = await this.getCurrentTheme();
    await this.toggleAndVerify();

    // Toggle back to original
    await this.toggleAndVerify();

    // Verify we're back at initial theme
    const finalTheme = await this.getCurrentTheme();
    expect(finalTheme).toBe(initialTheme);
  }

  /**
   * Verify system theme preference is respected
   */
  async verifySystemThemePreference() {
    // Clear any stored theme preference
    await this.page.evaluate(() => localStorage.removeItem('coria-theme'));

    // Reload to apply system preference
    await this.reload();

    // Check if system preference is dark
    const prefersDark = await this.page.evaluate(() => {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    const currentTheme = await this.getCurrentTheme();

    // Theme should match system preference
    expect(currentTheme).toBe(prefersDark ? 'dark' : 'light');
  }
}
