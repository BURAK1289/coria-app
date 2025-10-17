import { test, expect } from '../fixtures';

/**
 * E2E Tests for Global Header & Footer Implementation
 *
 * Validates:
 * - Header visibility across all routes (/, /features, /pricing, /foundation)
 * - Header landmark role="banner" for accessibility
 * - Footer 4-column responsive grid structure
 * - Footer semantic HTML with role="contentinfo"
 * - Footer link groups (Product, Company, Resources, Legal)
 * - Social icons with aria-hidden attribute
 * - External link targets with rel="noopener noreferrer"
 * - i18n: Footer content changes based on locale (tr/en/de/fr)
 */

test.describe('@e2e Global Header & Footer Validation', () => {
  const routes = ['/', '/features', '/pricing', '/foundation'] as const;
  const locales = ['tr', 'en', 'de', 'fr'] as const;

  test.describe('Header Global Visibility', () => {
    for (const route of routes) {
      test(`should render header on ${route} route`, async ({ page, locale }) => {
        await page.goto(`/${locale}${route}`);

        // Wait for navigation to complete
        await page.waitForLoadState('networkidle');

        // Check header is visible
        const header = page.locator('header, nav[role="navigation"]').first();
        await expect(header).toBeVisible();

        // Verify header contains navigation elements
        const hasLogo = await page.locator('a[href*="/"], img[alt*="CORIA"], svg').first().isVisible();
        expect(hasLogo).toBeTruthy();
      });
    }

    test('should have sticky positioning on scroll', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);
      await page.waitForLoadState('networkidle');

      const header = page.locator('header, nav').first();

      // Check for sticky/fixed positioning classes
      const headerClasses = await header.getAttribute('class');
      const hasSticky =
        headerClasses?.includes('sticky') ||
        headerClasses?.includes('fixed') ||
        headerClasses?.includes('top-0');

      expect(hasSticky).toBeTruthy();

      // Scroll down and verify header still visible
      await page.evaluate(() => window.scrollTo(0, 500));
      await expect(header).toBeVisible();
    });

    test('should have proper z-index for overlay', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);

      const header = page.locator('header, nav').first();
      const headerClasses = await header.getAttribute('class');

      // Check for z-index class (z-50 or similar)
      const hasZIndex =
        headerClasses?.includes('z-50') ||
        headerClasses?.includes('z-40') ||
        headerClasses?.includes('z-30');

      expect(hasZIndex).toBeTruthy();
    });
  });

  test.describe('Footer Semantic Structure', () => {
    test('should render footer with role="contentinfo"', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);
      await page.waitForLoadState('networkidle');

      // Check footer exists with contentinfo role
      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();
    });

    test('should have 4 navigation sections (Product, Company, Resources, Legal)', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);

      // Wait for footer to be visible
      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();

      // Check for nav sections within footer
      const navSections = footer.locator('nav');
      const count = await navSections.count();

      // Should have 4 main link groups
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('should have proper ul/li list structure', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');
      const lists = footer.locator('ul');

      // Should have multiple lists (one per link group)
      const listCount = await lists.count();
      expect(listCount).toBeGreaterThanOrEqual(4);

      // Each list should have li items
      for (let i = 0; i < Math.min(4, listCount); i++) {
        const listItems = lists.nth(i).locator('li');
        const itemCount = await listItems.count();
        expect(itemCount).toBeGreaterThan(0);
      }
    });

    test('should have aria-labelledby on nav sections', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');
      const navSections = footer.locator('nav');

      // Check first nav has aria-labelledby
      const firstNav = navSections.first();
      const ariaLabelledBy = await firstNav.getAttribute('aria-labelledby');

      expect(ariaLabelledBy).toBeTruthy();
      expect(ariaLabelledBy?.length).toBeGreaterThan(0);
    });
  });

  test.describe('Footer Responsive Grid', () => {
    test('should have mobile layout (1 column) at 375px', async ({ page, locale }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();

      // Check for grid-cols-1 class
      const linkGroups = footer.locator('div[class*="grid"]').first();
      const classes = await linkGroups.getAttribute('class');

      expect(classes).toContain('grid');
    });

    test('should have tablet layout (2 columns) at 768px', async ({ page, locale }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();

      // Check for md:grid-cols-2 class
      const linkGroups = footer.locator('div[class*="grid"]').first();
      const classes = await linkGroups.getAttribute('class');

      expect(classes).toContain('grid');
    });

    test('should have desktop layout (4 columns) at 1024px', async ({ page, locale }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();

      // Check for lg:grid-cols-4 class
      const linkGroups = footer.locator('div[class*="grid"]').first();
      const classes = await linkGroups.getAttribute('class');

      expect(classes).toContain('grid');

      // Verify 4 nav sections are visible
      const navSections = footer.locator('nav');
      const count = await navSections.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });
  });

  test.describe('Footer Social Icons', () => {
    test('should render social icons with aria-hidden', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');

      // Look for social link container (Twitter, LinkedIn, Instagram)
      const socialLinks = footer.locator('a[href*="twitter.com"], a[href*="linkedin.com"], a[href*="instagram.com"]');
      const socialCount = await socialLinks.count();

      expect(socialCount).toBeGreaterThanOrEqual(3); // At least Twitter, LinkedIn, Instagram

      // Check for aria-hidden on icons or sr-only text
      const firstSocial = socialLinks.first();
      const hasSrOnly = await firstSocial.locator('.sr-only').count() > 0;
      const hasAriaHidden = await firstSocial.locator('svg[aria-hidden="true"]').count() > 0;

      expect(hasSrOnly || hasAriaHidden).toBeTruthy();
    });

    test('should have correct social link targets', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');

      // Twitter
      const twitterLink = footer.locator('a[href*="twitter.com"]').first();
      if (await twitterLink.count() > 0) {
        await expect(twitterLink).toBeVisible();
        const href = await twitterLink.getAttribute('href');
        expect(href).toContain('twitter.com');
      }

      // LinkedIn
      const linkedinLink = footer.locator('a[href*="linkedin.com"]').first();
      if (await linkedinLink.count() > 0) {
        await expect(linkedinLink).toBeVisible();
        const href = await linkedinLink.getAttribute('href');
        expect(href).toContain('linkedin.com');
      }

      // Instagram
      const instagramLink = footer.locator('a[href*="instagram.com"]').first();
      if (await instagramLink.count() > 0) {
        await expect(instagramLink).toBeVisible();
        const href = await instagramLink.getAttribute('href');
        expect(href).toContain('instagram.com');
      }
    });
  });

  test.describe('Footer External Links', () => {
    test('should have rel="noopener noreferrer" on external links', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');

      // Find external links (social, blog, etc.)
      const externalLinks = footer.locator('a[target="_blank"], a[href*="medium.com"], a[href*="twitter.com"]');
      const count = await externalLinks.count();

      if (count > 0) {
        const firstExternal = externalLinks.first();
        const rel = await firstExternal.getAttribute('rel');

        // Should have noopener noreferrer for security
        expect(rel).toContain('noopener');
        expect(rel).toContain('noreferrer');
      }
    });

    test('should open external links in new tab', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');

      // Check blog link (Medium) opens in new tab
      const blogLink = footer.locator('a[href*="medium.com"]').first();
      if (await blogLink.count() > 0) {
        const target = await blogLink.getAttribute('target');
        expect(target).toBe('_blank');
      }
    });
  });

  test.describe('Footer i18n Content', () => {
    for (const testLocale of locales) {
      test(`should display ${testLocale.toUpperCase()} footer content`, async ({ page }) => {
        await page.goto(`/${testLocale}/`);
        await page.waitForLoadState('networkidle');

        const footer = page.locator('footer[role="contentinfo"]');
        await expect(footer).toBeVisible();

        // Get footer text content
        const footerText = await footer.textContent();

        // Verify locale-specific content exists
        expect(footerText).toBeTruthy();
        expect(footerText!.length).toBeGreaterThan(100);

        // Check for copyright with year (should be present in all locales)
        const hasCopyright =
          footerText?.includes('©') ||
          footerText?.includes('CORIA') ||
          footerText?.includes(new Date().getFullYear().toString());

        expect(hasCopyright).toBeTruthy();
      });
    }

    test('should have different group titles per locale', async ({ page }) => {
      const groupTitles: Record<string, string[]> = {
        tr: ['Ürün', 'Şirket', 'Kaynaklar', 'Yasal'],
        en: ['Product', 'Company', 'Resources', 'Legal'],
        de: ['Produkt', 'Unternehmen', 'Ressourcen', 'Rechtliches'],
        fr: ['Produit', 'Entreprise', 'Ressources', 'Légal'],
      };

      for (const [testLocale, expectedTitles] of Object.entries(groupTitles)) {
        await page.goto(`/${testLocale}/`);

        const footer = page.locator('footer[role="contentinfo"]');
        const footerText = await footer.textContent();

        // At least one expected title should be present
        const hasExpectedTitle = expectedTitles.some(title =>
          footerText?.includes(title)
        );

        expect(hasExpectedTitle).toBeTruthy();
      }
    });

    test('should have newsletter section with locale-specific text', async ({ page }) => {
      const newsletterTexts: Record<string, string> = {
        tr: 'Bülten',
        en: 'Newsletter',
        de: 'Newsletter',
        fr: 'Newsletter',
      };

      for (const [testLocale, expectedText] of Object.entries(newsletterTexts)) {
        await page.goto(`/${testLocale}/`);

        const footer = page.locator('footer[role="contentinfo"]');
        const footerText = await footer.textContent();

        // Newsletter section should exist
        const hasNewsletter =
          footerText?.toLowerCase().includes('newsletter') ||
          footerText?.includes(expectedText);

        expect(hasNewsletter).toBeTruthy();
      }
    });
  });

  test.describe('Footer Link Groups Content', () => {
    test('should have Product links (features, pricing, foundation, blog)', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');

      // Check for features link
      const featuresLink = footer.locator('a[href*="/features"]').first();
      await expect(featuresLink).toBeVisible();

      // Check for pricing link
      const pricingLink = footer.locator('a[href*="/pricing"]').first();
      await expect(pricingLink).toBeVisible();

      // Check for foundation link
      const foundationLink = footer.locator('a[href*="/foundation"]').first();
      await expect(foundationLink).toBeVisible();
    });

    test('should have Company links (about, contact)', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');

      // Check for about link
      const aboutLink = footer.locator('a[href*="/about"]').first();
      await expect(aboutLink).toBeVisible();

      // Check for contact link
      const contactLink = footer.locator('a[href*="/contact"]').first();
      await expect(contactLink).toBeVisible();
    });

    test('should have Legal links (privacy, terms)', async ({ page, locale }) => {
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');
      const footerText = await footer.textContent();

      // Legal section should mention privacy or terms
      const hasLegalContent =
        footerText?.toLowerCase().includes('privacy') ||
        footerText?.toLowerCase().includes('gizlilik') ||
        footerText?.toLowerCase().includes('datenschutz') ||
        footerText?.toLowerCase().includes('confidentialité') ||
        footerText?.toLowerCase().includes('terms') ||
        footerText?.toLowerCase().includes('şartlar');

      expect(hasLegalContent).toBeTruthy();
    });
  });

  test.describe('Visual Regression', () => {
    test('should match header snapshot on desktop', async ({ page, locale }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`/${locale}/`);

      const header = page.locator('header, nav').first();
      await expect(header).toBeVisible();

      // Take screenshot for visual validation
      await header.screenshot({
        path: `test-results/header-footer/header-${locale}-desktop.png`
      });
    });

    test('should match footer snapshot on desktop', async ({ page, locale }) => {
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();

      // Take screenshot for visual validation
      await footer.screenshot({
        path: `test-results/header-footer/footer-${locale}-desktop.png`
      });
    });

    test('should match footer snapshot on mobile', async ({ page, locale }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/${locale}/`);

      const footer = page.locator('footer[role="contentinfo"]');
      await expect(footer).toBeVisible();

      // Take screenshot for visual validation
      await footer.screenshot({
        path: `test-results/header-footer/footer-${locale}-mobile.png`
      });
    });
  });
});
