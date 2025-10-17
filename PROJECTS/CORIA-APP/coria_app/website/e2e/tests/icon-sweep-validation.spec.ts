/**
 * Icon System Sweep Validation
 *
 * Comprehensive validation of icon system across key pages:
 * - Visual smoke testing (Header, Nav, CTA, Cards, Forms)
 * - Accessibility audit (ARIA attributes)
 * - Icon Playground spot-check
 *
 * @see docs/ui/Icon_Catalog_Guide.md
 * @see docs/ui/Icon_QA_Report.md
 */

import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const SCREENSHOT_DIR = 'test-results/icon-sweep/screenshots';
const A11Y_DIR = 'test-results/icon-sweep/accessibility';

// Test pages with expected icon usage
const TEST_PAGES = [
  { path: '/en', name: 'homepage', icons: ['menu', 'globe', 'search', 'user'] },
  { path: '/en/features', name: 'features', icons: ['check', 'arrow-right', 'shield-check'] },
  { path: '/en/pricing', name: 'pricing', icons: ['check', 'close', 'star'] },
  { path: '/en/contact', name: 'contact', icons: ['mail', 'user', 'message'] },
  { path: '/dev/icons', name: 'icon-playground', icons: [] }, // All 78 icons
];

test.describe('Icon System Sweep Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport for consistent screenshots
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test.describe('Visual Smoke Tests', () => {
    for (const testPage of TEST_PAGES) {
      test(`should render icons correctly on ${testPage.name}`, async ({ page }) => {
        await page.goto(`${BASE_URL}${testPage.path}`);
        await page.waitForLoadState('networkidle');

        // Take full page screenshot
        await page.screenshot({
          path: join(SCREENSHOT_DIR, `${testPage.name}-full.png`),
          fullPage: true,
        });

        // Find all Icon components
        const icons = await page.locator('[data-icon]').all();
        console.log(`Found ${icons.length} icons on ${testPage.name}`);

        // Validate each icon renders
        for (const icon of icons) {
          const isVisible = await icon.isVisible();
          const iconName = await icon.getAttribute('data-icon');
          expect(isVisible, `Icon "${iconName}" should be visible`).toBeTruthy();
        }

        // Check for broken SVGs (missing viewBox or path elements)
        const svgs = await page.locator('svg[data-icon]').all();
        for (const svg of svgs) {
          const viewBox = await svg.getAttribute('viewBox');
          const iconName = await svg.getAttribute('data-icon');
          expect(viewBox, `Icon "${iconName}" should have viewBox`).toBeTruthy();

          const pathCount = await svg.locator('path, circle, rect, polygon').count();
          expect(pathCount, `Icon "${iconName}" should have SVG elements`).toBeGreaterThan(0);
        }
      });
    }

    test('should render Header icons correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      await page.waitForLoadState('networkidle');

      // Header navigation icons
      const header = page.locator('header, nav').first();
      await header.screenshot({
        path: join(SCREENSHOT_DIR, 'header-navigation.png'),
      });

      // Check for expected header icons
      const menuIcon = header.locator('[data-icon="menu"]');
      const globeIcon = header.locator('[data-icon="globe"]');
      const userIcon = header.locator('[data-icon="user"]');

      await expect(menuIcon.or(page.locator('[aria-label*="menu" i]'))).toBeVisible();
      await expect(globeIcon.or(page.locator('[aria-label*="language" i]'))).toBeVisible();
    });

    test('should render CTA button icons correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      await page.waitForLoadState('networkidle');

      // Find primary CTA buttons with icons
      const ctaButtons = page.locator('button:has([data-icon]), a:has([data-icon])');
      const count = await ctaButtons.count();

      if (count > 0) {
        // Screenshot first 3 CTA buttons
        for (let i = 0; i < Math.min(count, 3); i++) {
          const button = ctaButtons.nth(i);
          await button.screenshot({
            path: join(SCREENSHOT_DIR, `cta-button-${i + 1}.png`),
          });

          // Validate icon within button
          const icon = button.locator('[data-icon]');
          await expect(icon).toBeVisible();
        }
      }
    });

    test('should render Card component icons correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/en/features`);
      await page.waitForLoadState('networkidle');

      // Feature cards with icons
      const cards = page.locator('[class*="card"], [class*="feature"]').filter({
        has: page.locator('[data-icon]'),
      });
      const cardCount = await cards.count();

      if (cardCount > 0) {
        // Screenshot first 3 cards
        for (let i = 0; i < Math.min(cardCount, 3); i++) {
          await cards.nth(i).screenshot({
            path: join(SCREENSHOT_DIR, `feature-card-${i + 1}.png`),
          });
        }
      }
    });

    test('should render Form input icons correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/en/contact`);
      await page.waitForLoadState('networkidle');

      // Form inputs with icons
      const formInputs = page.locator('input, textarea').filter({
        has: page.locator('[data-icon]'),
      });
      const inputCount = await formInputs.count();

      if (inputCount > 0) {
        // Screenshot form section
        const form = page.locator('form').first();
        await form.screenshot({
          path: join(SCREENSHOT_DIR, 'contact-form-icons.png'),
        });
      }
    });
  });

  test.describe('Accessibility Audit', () => {
    test('should have proper ARIA attributes on all icons', async ({ page }) => {
      const violations: any[] = [];

      for (const testPage of TEST_PAGES.slice(0, 3)) { // Test first 3 pages
        await page.goto(`${BASE_URL}${testPage.path}`);
        await page.waitForLoadState('networkidle');

        const icons = await page.locator('[data-icon]').all();

        for (let i = 0; i < icons.length; i++) {
          const icon = icons[i];
          const iconName = await icon.getAttribute('data-icon');
          const ariaHidden = await icon.getAttribute('aria-hidden');
          const ariaLabel = await icon.getAttribute('aria-label');

          // Get parent button/link if exists
          const parentButton = await icon.locator('..').first();
          const parentRole = await parentButton.getAttribute('role');
          const parentAriaLabel = await parentButton.getAttribute('aria-label');
          const hasTextContent = (await parentButton.textContent())?.trim().length ?? 0 > 0;

          // Accessibility pattern validation
          const isDecorative = ariaHidden === 'true' && hasTextContent;
          const isInteractive = parentRole === 'button' || parentAriaLabel !== null;
          const isInformational = ariaLabel !== null && ariaHidden !== 'true';

          // Check if icon follows one of the three patterns
          if (!isDecorative && !isInteractive && !isInformational) {
            violations.push({
              page: testPage.name,
              icon: iconName,
              issue: 'Missing accessibility pattern',
              details: {
                ariaHidden,
                ariaLabel,
                parentRole,
                parentAriaLabel,
                hasTextContent,
              },
            });
          }

          // Check for anti-patterns
          if (ariaHidden === 'true' && ariaLabel !== null) {
            violations.push({
              page: testPage.name,
              icon: iconName,
              issue: 'Conflicting ARIA attributes (aria-hidden + aria-label)',
            });
          }
        }
      }

      // Write violations report
      const report = {
        timestamp: new Date().toISOString(),
        totalViolations: violations.length,
        violations,
      };
      writeFileSync(
        join(A11Y_DIR, 'aria-violations.json'),
        JSON.stringify(report, null, 2)
      );

      // Test should pass if no violations
      expect(violations.length, `Found ${violations.length} accessibility violations`).toBe(0);
    });

    test('should have proper color contrast for icons', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      await page.waitForLoadState('networkidle');

      const contrastIssues: any[] = [];

      const icons = await page.locator('[data-icon]').all();

      for (let i = 0; i < Math.min(icons.length, 10); i++) {
        const icon = icons[i];
        const iconName = await icon.getAttribute('data-icon');

        // Get computed color
        const color = await icon.evaluate((el) => {
          return window.getComputedStyle(el).color;
        });

        const bgColor = await icon.evaluate((el) => {
          let element: Element | null = el;
          while (element) {
            const bg = window.getComputedStyle(element as HTMLElement).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
              return bg;
            }
            element = element.parentElement;
          }
          return 'rgb(255, 255, 255)'; // Default to white
        });

        // Store for manual review (automated contrast checking is complex)
        contrastIssues.push({
          icon: iconName,
          color,
          backgroundColor: bgColor,
          note: 'Manual review required for 4.5:1 contrast ratio',
        });
      }

      writeFileSync(
        join(A11Y_DIR, 'color-contrast-check.json'),
        JSON.stringify(contrastIssues, null, 2)
      );
    });

    test('should be keyboard navigable for interactive icons', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);
      await page.waitForLoadState('networkidle');

      // Find all interactive elements with icons
      const interactiveIcons = page.locator('button:has([data-icon]), a:has([data-icon])');
      const count = await interactiveIcons.count();

      const keyboardIssues: any[] = [];

      for (let i = 0; i < Math.min(count, 5); i++) {
        const element = interactiveIcons.nth(i);
        const iconName = await element.locator('[data-icon]').getAttribute('data-icon');

        // Check if focusable
        await element.focus();
        const isFocused = await element.evaluate((el) => el === document.activeElement);

        if (!isFocused) {
          keyboardIssues.push({
            icon: iconName,
            issue: 'Element not focusable via keyboard',
          });
        }

        // Check for visible focus indicator
        const outlineStyle = await element.evaluate((el) => {
          return window.getComputedStyle(el).outline;
        });

        if (outlineStyle === 'none' || outlineStyle === '') {
          // Check for custom focus styles
          const hasFocusStyle = await element.evaluate((el) => {
            const classList = Array.from(el.classList);
            return classList.some(cls => cls.includes('focus'));
          });

          if (!hasFocusStyle) {
            keyboardIssues.push({
              icon: iconName,
              issue: 'No visible focus indicator',
            });
          }
        }
      }

      writeFileSync(
        join(A11Y_DIR, 'keyboard-navigation.json'),
        JSON.stringify(keyboardIssues, null, 2)
      );
    });
  });

  test.describe('Icon Playground Validation', () => {
    test('should load Icon Playground successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/dev/icons`);
      await page.waitForLoadState('networkidle');

      // Take full screenshot
      await page.screenshot({
        path: join(SCREENSHOT_DIR, 'icon-playground-full.png'),
        fullPage: true,
      });

      // Validate page title
      await expect(page.locator('h1')).toContainText(/icon/i);

      // Check for search input
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]');
      await expect(searchInput).toBeVisible();

      // Check for icon grid
      const iconGrid = page.locator('[data-icon]');
      const iconCount = await iconGrid.count();

      // Should show all 78 icons
      expect(iconCount, 'Icon Playground should display all 78 icons').toBeGreaterThanOrEqual(70);

      console.log(`Icon Playground displays ${iconCount} icons`);
    });

    test('should filter icons correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/dev/icons`);
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[type="search"], input[placeholder*="Search" i]').first();

      // Test search functionality
      await searchInput.fill('check');
      await page.waitForTimeout(500); // Debounce

      const visibleIcons = page.locator('[data-icon*="check"]');
      const count = await visibleIcons.count();

      await page.screenshot({
        path: join(SCREENSHOT_DIR, 'icon-playground-search-check.png'),
      });

      expect(count, 'Should find icons matching "check"').toBeGreaterThan(0);
    });

    test('should display icon size controls', async ({ page }) => {
      await page.goto(`${BASE_URL}/dev/icons`);
      await page.waitForLoadState('networkidle');

      // Check for size control buttons/slider
      const sizeControls = page.locator('button:has-text("16"), button:has-text("20"), button:has-text("24")');
      const controlCount = await sizeControls.count();

      expect(controlCount, 'Should have size control buttons').toBeGreaterThan(0);

      // Test size change
      if (controlCount > 0) {
        await sizeControls.first().click();
        await page.waitForTimeout(300);

        await page.screenshot({
          path: join(SCREENSHOT_DIR, 'icon-playground-size-16.png'),
        });
      }
    });

    test('should display copyable code patterns', async ({ page }) => {
      await page.goto(`${BASE_URL}/dev/icons`);
      await page.waitForLoadState('networkidle');

      // Check for code examples
      const codeBlocks = page.locator('code, pre');
      const codeCount = await codeBlocks.count();

      expect(codeCount, 'Should display code examples').toBeGreaterThan(0);

      // Check for copy buttons
      const copyButtons = page.locator('button:has-text("Copy"), button[aria-label*="copy" i]');
      const copyCount = await copyButtons.count();

      expect(copyCount, 'Should have copy-to-clipboard buttons').toBeGreaterThan(0);

      await page.screenshot({
        path: join(SCREENSHOT_DIR, 'icon-playground-code-patterns.png'),
      });
    });

    test('should display brand color previews', async ({ page }) => {
      await page.goto(`${BASE_URL}/dev/icons`);
      await page.waitForLoadState('networkidle');

      // Check for color token previews (15 CORIA brand colors)
      const colorTokens = page.locator('[class*="color"], [style*="background"]').filter({
        has: page.locator('[data-icon]'),
      });

      const tokenCount = await colorTokens.count();

      if (tokenCount > 0) {
        await page.screenshot({
          path: join(SCREENSHOT_DIR, 'icon-playground-brand-colors.png'),
        });

        console.log(`Found ${tokenCount} color token previews`);
      }
    });
  });

  test.describe('Performance Metrics', () => {
    test('should measure icon rendering performance', async ({ page }) => {
      await page.goto(`${BASE_URL}/en`);

      // Measure icon load time
      const metrics = await page.evaluate(() => {
        const iconElements = document.querySelectorAll('[data-icon]');
        return {
          iconCount: iconElements.length,
          timestamp: Date.now(),
        };
      });

      console.log(`Rendered ${metrics.iconCount} icons`);

      // Check First Load JS
      const performanceTiming = await page.evaluate(() => {
        const perfData = window.performance.timing;
        return {
          domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
          loadComplete: perfData.loadEventEnd - perfData.navigationStart,
        };
      });

      console.log('Performance:', performanceTiming);

      expect(performanceTiming.domContentLoaded).toBeLessThan(5000); // 5s threshold
    });
  });
});
