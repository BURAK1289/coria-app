import { test, expect } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to all main pages', async ({ page }) => {
    // Test Features page
    await page.click('text=Features')
    await expect(page).toHaveURL(/.*\/features/)
    await expect(page.locator('h1')).toContainText(/features/i)

    // Test Pricing page
    await page.click('text=Pricing')
    await expect(page).toHaveURL(/.*\/pricing/)
    await expect(page.locator('h1')).toContainText(/pricing/i)

    // Test About page
    await page.click('text=About')
    await expect(page).toHaveURL(/.*\/about/)
    await expect(page.locator('h1')).toContainText(/about/i)

    // Test Contact page
    await page.click('text=Contact')
    await expect(page).toHaveURL(/.*\/contact/)
    await expect(page.locator('h1')).toContainText(/contact/i)

    // Return to home
    await page.click('text=Home')
    await expect(page).toHaveURL(/.*\/$/)
  })

  test('should work with language switcher', async ({ page }) => {
    // Find language switcher
    const languageSwitcher = page.locator('[data-testid="language-switcher"]')
    await expect(languageSwitcher).toBeVisible()

    // Switch to Turkish
    await languageSwitcher.click()
    await page.click('text=Türkçe')
    await expect(page).toHaveURL(/.*\/tr/)

    // Switch to German
    await languageSwitcher.click()
    await page.click('text=Deutsch')
    await expect(page).toHaveURL(/.*\/de/)

    // Switch back to English
    await languageSwitcher.click()
    await page.click('text=English')
    await expect(page).toHaveURL(/.*\/en/)
  })

  test('should handle mobile navigation', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Open mobile menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]')
    await mobileMenuButton.click()

    const mobileMenu = page.locator('[data-testid="mobile-menu"]')
    await expect(mobileMenu).toBeVisible()

    // Test mobile navigation links
    await page.click('[data-testid="mobile-menu"] text=Features')
    await expect(page).toHaveURL(/.*\/features/)

    // Menu should close after navigation
    await expect(mobileMenu).not.toBeVisible()
  })

  test('should have working footer links', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded()

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // Test footer navigation links
    const footerLinks = footer.locator('a[href^="/"]')
    const linkCount = await footerLinks.count()
    expect(linkCount).toBeGreaterThan(0)

    // Test a few footer links
    const featuresLink = footer.locator('text=Features')
    if (await featuresLink.count() > 0) {
      await featuresLink.click()
      await expect(page).toHaveURL(/.*\/features/)
    }
  })

  test('should handle breadcrumb navigation', async ({ page }) => {
    // Navigate to a deep page
    await page.goto('/features/sustainability-scoring')

    // Check breadcrumbs exist
    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]')
    if (await breadcrumbs.count() > 0) {
      await expect(breadcrumbs).toBeVisible()

      // Test breadcrumb navigation
      await breadcrumbs.locator('text=Features').click()
      await expect(page).toHaveURL(/.*\/features$/)
    }
  })

  test('should maintain navigation state during page transitions', async ({ page }) => {
    // Start on homepage
    await expect(page.locator('nav a[href="/"]')).toHaveClass(/active|current/)

    // Navigate to features
    await page.click('text=Features')
    await expect(page.locator('nav a[href*="features"]')).toHaveClass(/active|current/)

    // Navigate to pricing
    await page.click('text=Pricing')
    await expect(page.locator('nav a[href*="pricing"]')).toHaveClass(/active|current/)
  })
})