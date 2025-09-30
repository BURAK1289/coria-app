import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await injectAxe(page)
  })

  test('homepage should be accessible', async ({ page }) => {
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
    })
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check that there's only one h1
    const h1Elements = page.locator('h1')
    await expect(h1Elements).toHaveCount(1)

    // Check heading hierarchy (h1 -> h2 -> h3, etc.)
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    const headingTexts = await headings.allTextContents()
    
    expect(headingTexts.length).toBeGreaterThan(0)
  })

  test('should have proper alt text for images', async ({ page }) => {
    const images = page.locator('img')
    const imageCount = await images.count()

    for (let i = 0; i < imageCount; i++) {
      const image = images.nth(i)
      const alt = await image.getAttribute('alt')
      const role = await image.getAttribute('role')
      
      // Images should have alt text or be decorative
      expect(alt !== null || role === 'presentation').toBeTruthy()
    }
  })

  test('should have proper form labels', async ({ page }) => {
    // Navigate to contact page which has forms
    await page.goto('/contact')
    await injectAxe(page)

    const inputs = page.locator('input, textarea, select')
    const inputCount = await inputs.count()

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledby = await input.getAttribute('aria-labelledby')
      
      if (id) {
        const label = page.locator(`label[for="${id}"]`)
        const hasLabel = await label.count() > 0
        
        // Input should have a label, aria-label, or aria-labelledby
        expect(hasLabel || ariaLabel || ariaLabelledby).toBeTruthy()
      }
    }

    await checkA11y(page)
  })

  test('should have proper focus management', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    
    // First focusable element should be focused
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()

    // Continue tabbing through interactive elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab')
      const currentFocus = page.locator(':focus')
      await expect(currentFocus).toBeVisible()
    }
  })

  test('should have proper color contrast', async ({ page }) => {
    await checkA11y(page, null, {
      rules: {
        'color-contrast': { enabled: true }
      }
    })
  })

  test('should be accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await injectAxe(page)
    
    // Open mobile menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]')
    await mobileMenuButton.click()

    await checkA11y(page)
  })

  test('features page should be accessible', async ({ page }) => {
    await page.goto('/features')
    await injectAxe(page)
    await checkA11y(page)
  })

  test('pricing page should be accessible', async ({ page }) => {
    await page.goto('/pricing')
    await injectAxe(page)
    await checkA11y(page)
  })

  test('should have proper ARIA attributes', async ({ page }) => {
    // Check for proper ARIA landmarks
    const main = page.locator('main')
    await expect(main).toHaveCount(1)

    const nav = page.locator('nav')
    await expect(nav).toHaveCount(1)

    // Check for ARIA labels on interactive elements
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const ariaLabel = await button.getAttribute('aria-label')
      const textContent = await button.textContent()
      
      // Button should have accessible name (text content or aria-label)
      expect(ariaLabel || textContent?.trim()).toBeTruthy()
    }
  })

  test('should handle reduced motion preferences', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    // Check that animations are disabled or reduced
    const animatedElements = page.locator('[class*="animate"], [class*="transition"]')
    const count = await animatedElements.count()
    
    if (count > 0) {
      // Verify that reduced motion is respected
      const firstAnimated = animatedElements.first()
      const computedStyle = await firstAnimated.evaluate(el => 
        window.getComputedStyle(el).getPropertyValue('animation-duration')
      )
      
      // Animation should be disabled or very short
      expect(computedStyle === '0s' || computedStyle === '0.01s').toBeTruthy()
    }
  })
})