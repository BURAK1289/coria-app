import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test('homepage should match visual snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Wait for animations to complete
    await page.waitForTimeout(1000)
    
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('hero section should match snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const heroSection = page.locator('[data-testid="hero-section"]')
    await expect(heroSection).toHaveScreenshot('hero-section.png', {
      animations: 'disabled'
    })
  })

  test('features showcase should match snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const featuresSection = page.locator('[data-testid="features-showcase"]')
    await expect(featuresSection).toHaveScreenshot('features-showcase.png', {
      animations: 'disabled'
    })
  })

  test('navigation should match snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const navigation = page.locator('nav')
    await expect(navigation).toHaveScreenshot('navigation.png', {
      animations: 'disabled'
    })
  })

  test('mobile homepage should match snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('mobile navigation menu should match snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Open mobile menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]')
    await mobileMenuButton.click()
    
    const mobileMenu = page.locator('[data-testid="mobile-menu"]')
    await expect(mobileMenu).toHaveScreenshot('mobile-menu.png', {
      animations: 'disabled'
    })
  })

  test('features page should match snapshot', async ({ page }) => {
    await page.goto('/features')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('features-page.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('pricing page should match snapshot', async ({ page }) => {
    await page.goto('/pricing')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('pricing-page.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('footer should match snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const footer = page.locator('footer')
    await footer.scrollIntoViewIfNeeded()
    
    await expect(footer).toHaveScreenshot('footer.png', {
      animations: 'disabled'
    })
  })

  test('dark theme should match snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Switch to dark theme if available
    const themeToggle = page.locator('[data-testid="theme-toggle"]')
    if (await themeToggle.count() > 0) {
      await themeToggle.click()
      await page.waitForTimeout(500) // Wait for theme transition
      
      await expect(page).toHaveScreenshot('homepage-dark.png', {
        fullPage: true,
        animations: 'disabled'
      })
    }
  })

  test('tablet view should match snapshot', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled'
    })
  })

  test('language switcher should match snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const languageSwitcher = page.locator('[data-testid="language-switcher"]')
    await languageSwitcher.click()
    
    const dropdown = page.locator('[data-testid="language-dropdown"]')
    await expect(dropdown).toHaveScreenshot('language-dropdown.png', {
      animations: 'disabled'
    })
  })
})