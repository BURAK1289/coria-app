import { test, expect } from '@playwright/test'

test.describe('Security Tests', () => {
  test('should have proper security headers', async ({ page }) => {
    const response = await page.goto('/')
    
    // Check security headers
    const headers = response?.headers() || {}
    
    expect(headers['x-frame-options']).toBe('DENY')
    expect(headers['x-content-type-options']).toBe('nosniff')
    expect(headers['x-xss-protection']).toBe('1; mode=block')
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(headers['strict-transport-security']).toContain('max-age=31536000')
    expect(headers['content-security-policy']).toBeTruthy()
    expect(headers['permissions-policy']).toBeTruthy()
  })

  test('should prevent XSS in form inputs', async ({ page }) => {
    await page.goto('/contact')
    
    // Try to inject XSS in form fields
    const xssPayload = '<script>alert("XSS")</script>'
    
    await page.fill('input[name="name"]', xssPayload)
    await page.fill('textarea[name="message"]', xssPayload)
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Check that script didn't execute
    const alerts = []
    page.on('dialog', dialog => {
      alerts.push(dialog.message())
      dialog.dismiss()
    })
    
    // Wait a bit to see if any alerts fire
    await page.waitForTimeout(1000)
    
    expect(alerts).toHaveLength(0)
    
    // Check that the content is sanitized in the DOM
    const nameValue = await page.inputValue('input[name="name"]')
    const messageValue = await page.inputValue('textarea[name="message"]')
    
    expect(nameValue).not.toContain('<script>')
    expect(messageValue).not.toContain('<script>')
  })

  test('should prevent SQL injection in form inputs', async ({ page }) => {
    await page.goto('/contact')
    
    // Try SQL injection payloads
    const sqlPayloads = [
      "'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin'/*",
      "' UNION SELECT * FROM users --"
    ]
    
    for (const payload of sqlPayloads) {
      await page.fill('input[name="email"]', `test${payload}@example.com`)
      await page.fill('textarea[name="message"]', `Message with ${payload}`)
      
      // Submit form
      await page.click('button[type="submit"]')
      
      // Check for error messages or successful sanitization
      const errorMessage = page.locator('[data-testid="error-message"]')
      const successMessage = page.locator('[data-testid="success-message"]')
      
      // Either should show error (blocked) or success (sanitized)
      await expect(errorMessage.or(successMessage)).toBeVisible({ timeout: 5000 })
      
      // Clear form for next test
      await page.fill('input[name="email"]', '')
      await page.fill('textarea[name="message"]', '')
    }
  })

  test('should enforce HTTPS redirect', async ({ page, context }) => {
    // This test assumes the site enforces HTTPS in production
    // Skip if running on localhost
    const baseURL = page.url()
    if (baseURL.includes('localhost')) {
      test.skip('HTTPS redirect test skipped for localhost')
    }
    
    // Try to access HTTP version
    const httpUrl = baseURL.replace('https://', 'http://')
    const response = await page.goto(httpUrl)
    
    // Should redirect to HTTPS
    expect(page.url()).toMatch(/^https:/)
    expect(response?.status()).toBe(301) // Permanent redirect
  })

  test('should prevent clickjacking', async ({ page }) => {
    // Check X-Frame-Options header
    const response = await page.goto('/')
    const headers = response?.headers() || {}
    
    expect(headers['x-frame-options']).toBe('DENY')
    
    // Try to embed in iframe (should be blocked by CSP)
    const iframeTest = await page.evaluate(() => {
      const iframe = document.createElement('iframe')
      iframe.src = window.location.href
      document.body.appendChild(iframe)
      
      return new Promise((resolve) => {
        iframe.onload = () => resolve('loaded')
        iframe.onerror = () => resolve('blocked')
        setTimeout(() => resolve('timeout'), 3000)
      })
    })
    
    expect(iframeTest).not.toBe('loaded')
  })

  test('should have secure cookie settings', async ({ page, context }) => {
    await page.goto('/')
    
    // Check cookies have secure attributes
    const cookies = await context.cookies()
    
    cookies.forEach(cookie => {
      if (cookie.name.includes('session') || cookie.name.includes('auth')) {
        expect(cookie.secure).toBe(true)
        expect(cookie.httpOnly).toBe(true)
        expect(cookie.sameSite).toBe('Strict')
      }
    })
  })

  test('should validate file upload security', async ({ page }) => {
    // Navigate to a page with file upload (if exists)
    await page.goto('/contact')
    
    const fileInput = page.locator('input[type="file"]')
    
    if (await fileInput.count() > 0) {
      // Try to upload potentially dangerous files
      const dangerousFiles = [
        { name: 'test.exe', content: 'MZ\x90\x00' }, // Executable
        { name: 'test.php', content: '<?php echo "test"; ?>' }, // PHP script
        { name: 'test.html', content: '<script>alert("xss")</script>' }, // HTML with script
      ]
      
      for (const file of dangerousFiles) {
        // Create a temporary file
        const buffer = Buffer.from(file.content)
        
        await fileInput.setInputFiles({
          name: file.name,
          mimeType: 'application/octet-stream',
          buffer: buffer,
        })
        
        // Submit form
        await page.click('button[type="submit"]')
        
        // Should show error for dangerous file types
        const errorMessage = page.locator('[data-testid="file-error"]')
        await expect(errorMessage).toBeVisible({ timeout: 5000 })
        
        // Clear file input
        await fileInput.setInputFiles([])
      }
    }
  })

  test('should prevent directory traversal', async ({ page }) => {
    // Test various path traversal attempts
    const traversalPaths = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\config\\sam',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '....//....//....//etc/passwd'
    ]
    
    for (const path of traversalPaths) {
      // Try accessing with path traversal
      const response = await page.goto(`/api/files/${encodeURIComponent(path)}`, {
        waitUntil: 'networkidle'
      }).catch(() => null)
      
      if (response) {
        // Should return 400, 403, or 404 - not 200
        expect([400, 403, 404]).toContain(response.status())
      }
    }
  })

  test('should rate limit form submissions', async ({ page }) => {
    await page.goto('/contact')
    
    // Fill form with valid data
    await page.fill('input[name="name"]', 'Test User')
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('textarea[name="message"]', 'Test message')
    
    // Submit form multiple times rapidly
    const submissions = []
    for (let i = 0; i < 10; i++) {
      const submitPromise = page.click('button[type="submit"]')
      submissions.push(submitPromise)
      await page.waitForTimeout(100) // Small delay between submissions
    }
    
    await Promise.all(submissions)
    
    // Should eventually show rate limit error
    const rateLimitError = page.locator('[data-testid="rate-limit-error"]')
    await expect(rateLimitError).toBeVisible({ timeout: 10000 })
  })

  test('should sanitize URL parameters', async ({ page }) => {
    // Test XSS in URL parameters
    const xssParams = [
      'search=<script>alert("xss")</script>',
      'category="><script>alert("xss")</script>',
      'id=javascript:alert("xss")'
    ]
    
    for (const param of xssParams) {
      await page.goto(`/?${param}`)
      
      // Check that script doesn't execute
      const alerts = []
      page.on('dialog', dialog => {
        alerts.push(dialog.message())
        dialog.dismiss()
      })
      
      await page.waitForTimeout(1000)
      expect(alerts).toHaveLength(0)
      
      // Check that parameter is sanitized in DOM
      const pageContent = await page.content()
      expect(pageContent).not.toContain('<script>')
      expect(pageContent).not.toContain('javascript:')
    }
  })
})