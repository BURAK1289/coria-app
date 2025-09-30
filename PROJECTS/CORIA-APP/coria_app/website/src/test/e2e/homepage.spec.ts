import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load homepage successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/CORIA/)
    await expect(page.locator('h1')).toBeVisible()
  })

  test('should display hero section with CTA buttons', async ({ page }) => {
    // Check hero section is visible
    const heroSection = page.locator('[data-testid="hero-section"]')
    await expect(heroSection).toBeVisible()

    // Check CTA buttons are present and clickable
    const downloadButtons = page.locator('a[href*="apps.apple.com"], a[href*="play.google.com"]')
    await expect(downloadButtons).toHaveCount(2)
    
    // Verify buttons are clickable (but don't actually click to avoid navigation)
    for (const button of await downloadButtons.all()) {
      await expect(button).toBeVisible()
      await expect(button).toBeEnabled()
    }
  })

  test('should display features showcase section', async ({ page }) => {
    const featuresSection = page.locator('[data-testid="features-showcase"]')
    await expect(featuresSection).toBeVisible()

    // Check that feature cards are displayed
    const featureCards = page.locator('[data-testid="feature-card"]')
    await expect(featureCards).toHaveCount(4) // Scanning, AI, Pantry, ESG
  })

  test('should have working navigation', async ({ page }) => {
    // Test navigation menu
    const navigation = page.locator('nav')
    await expect(navigation).toBeVisible()

    // Test navigation links
    const navLinks = navigation.locator('a')
    await expect(navLinks).toHaveCount(5) // Home, Features, Pricing, About, Contact

    // Test clicking on Features link
    await page.click('text=Features')
    await expect(page).toHaveURL(/.*\/features/)
  })

  test('should display social proof section', async ({ page }) => {
    const socialProofSection = page.locator('[data-testid="social-proof"]')
    await expect(socialProofSection).toBeVisible()

    // Check for statistics counters
    const statsCounters = page.locator('[data-testid="stat-counter"]')
    await expect(statsCounters.first()).toBeVisible()
  })

  test('should have responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size

    // Check mobile navigation
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]')
    await expect(mobileMenuButton).toBeVisible()

    // Open mobile menu
    await mobileMenuButton.click()
    const mobileMenu = page.locator('[data-testid="mobile-menu"]')
    await expect(mobileMenu).toBeVisible()

    // Check hero section is still visible and properly sized
    const heroSection = page.locator('[data-testid="hero-section"]')
    await expect(heroSection).toBeVisible()
  })

  test('should load images properly', async ({ page }) => {
    // Wait for images to load
    await page.waitForLoadState('networkidle')

    // Check that hero image is loaded
    const heroImage = page.locator('img[alt*="CORIA app"]')
    await expect(heroImage).toBeVisible()

    // Verify image has loaded (not broken)
    const imageSrc = await heroImage.getAttribute('src')
    expect(imageSrc).toBeTruthy()
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/CORIA/)

    // Check meta description
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toHaveAttribute('content', /.+/)

    // Check Open Graph tags
    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toHaveAttribute('content', /.+/)

    const ogDescription = page.locator('meta[property="og:description"]')
    await expect(ogDescription).toHaveAttribute('content', /.+/)
  })
})