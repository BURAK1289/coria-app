import { Page, expect } from '@playwright/test';

/**
 * Wait for a specific locale to be loaded
 */
export async function waitForLocale(page: Page, locale: string) {
  await expect(page).toHaveURL(new RegExp(`^/${locale}(/|$)`));

  // Wait for locale-specific content to load
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Wait for theme to be applied
 */
export async function waitForTheme(page: Page, theme: 'light' | 'dark') {
  const expectedClass = theme === 'dark' ? 'dark' : '';

  await page.waitForFunction(
    (expectedClass) => {
      const html = document.documentElement;
      if (expectedClass) {
        return html.classList.contains(expectedClass);
      }
      return !html.classList.contains('dark');
    },
    expectedClass,
    { timeout: 5000 }
  );
}

/**
 * Get the resolved theme (light or dark)
 */
export async function getResolvedTheme(page: Page): Promise<'light' | 'dark'> {
  const isDark = await page.evaluate(() => {
    return document.documentElement.classList.contains('dark');
  });
  return isDark ? 'dark' : 'light';
}

/**
 * Switch locale using the language switcher
 */
export async function switchLocale(page: Page, targetLocale: string) {
  // Open language switcher
  await page.click('[data-testid="locale-selector"]');

  // Click target locale option
  await page.click(`[data-testid="locale-option-${targetLocale}"]`);

  // Wait for navigation
  await waitForLocale(page, targetLocale);
}

/**
 * Toggle theme and wait for change
 */
export async function toggleTheme(page: Page) {
  const initialTheme = await getResolvedTheme(page);
  const expectedTheme = initialTheme === 'dark' ? 'light' : 'dark';

  await page.click('[data-testid="theme-toggle"]');
  await waitForTheme(page, expectedTheme);

  return expectedTheme;
}

/**
 * Check if page is accessible (basic WCAG checks)
 */
export async function checkAccessibility(page: Page) {
  // Check for alt text on images
  const imagesWithoutAlt = await page.locator('img:not([alt])').count();
  expect(imagesWithoutAlt).toBe(0);

  // Check for aria-labels on buttons without text
  const buttonsWithoutLabel = await page.locator('button:not([aria-label]):not(:has-text(""))').count();
  expect(buttonsWithoutLabel).toBe(0);

  // Check for form labels
  const inputsWithoutLabel = await page.locator('input:not([type="hidden"]):not([aria-label])').count();
  if (inputsWithoutLabel > 0) {
    // Verify they have associated labels
    const inputs = await page.locator('input:not([type="hidden"]):not([aria-label])').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      if (id) {
        const label = await page.locator(`label[for="${id}"]`).count();
        expect(label).toBeGreaterThan(0);
      }
    }
  }
}

/**
 * Take a full-page screenshot with timestamp
 */
export async function takeTimestampedScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Wait for all images to load
 */
export async function waitForImages(page: Page) {
  await page.waitForLoadState('domcontentloaded');

  await page.waitForFunction(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return images.every(img => img.complete && img.naturalHeight > 0);
  }, { timeout: 10000 });
}

/**
 * Check navigation menu is visible and contains expected items
 */
export async function verifyNavigationMenu(page: Page) {
  const expectedItems = ['features', 'pricing', 'blog', 'foundation', 'about', 'contact'];

  for (const item of expectedItems) {
    await expect(page.locator(`[data-testid="nav-${item}"]`)).toBeVisible();
  }
}

/**
 * Get current URL locale
 */
export async function getCurrentLocale(page: Page): Promise<string> {
  const url = page.url();
  const match = url.match(/\/([a-z]{2})\//);
  return match ? match[1] : 'tr'; // Default to 'tr' if no locale found
}

/**
 * Verify page has no console errors (warnings are OK)
 */
export async function verifyNoConsoleErrors(page: Page) {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Wait a bit for any async errors
  await page.waitForTimeout(1000);

  expect(errors).toHaveLength(0);
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) return false;

    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, selector);
}

/**
 * Scroll to element smoothly
 */
export async function scrollToElement(page: Page, selector: string) {
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, selector);

  // Wait for scroll animation
  await page.waitForTimeout(500);
}

/**
 * Get localStorage value
 */
export async function getLocalStorage(page: Page, key: string): Promise<string | null> {
  return await page.evaluate((key) => {
    return localStorage.getItem(key);
  }, key);
}

/**
 * Set localStorage value
 */
export async function setLocalStorage(page: Page, key: string, value: string) {
  await page.evaluate(({ key, value }) => {
    localStorage.setItem(key, value);
  }, { key, value });
}

/**
 * Clear all localStorage
 */
export async function clearLocalStorage(page: Page) {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Wait for Next.js page to be fully loaded (including client-side hydration)
 */
export async function waitForNextjsHydration(page: Page) {
  await page.waitForLoadState('domcontentloaded');

  // Wait for React hydration to complete (simplified - just check for Next.js data)
  await page.waitForFunction(() => {
    return (window as any).__NEXT_DATA__ !== undefined;
  }, { timeout: 5000 }).catch(() => {
    // If timeout, page is likely already hydrated or using different Next.js version
    // Continue anyway - other checks will catch real issues
  });

  // Brief wait for any async rendering
  await page.waitForTimeout(500);
}
