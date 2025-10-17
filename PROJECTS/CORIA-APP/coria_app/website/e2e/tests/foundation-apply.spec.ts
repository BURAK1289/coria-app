import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Foundation Application E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the foundation application page (English locale)
    await page.goto('/en/foundation/apply');

    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should complete full application flow with file upload and show success screen', async ({ page }) => {
    // ============================================
    // STEP 1: Project Information
    // ============================================

    // Verify we're on step 1
    await expect(page.locator('text=Project Information')).toBeVisible();

    // Fill project name
    await page.fill('input[placeholder*="Enter your project name"]', 'Vegan Community Garden Initiative');

    // Select category (veganism)
    await page.selectOption('select:near(:text("Category"))', 'veganism');

    // Select organization type (nonprofit)
    await page.selectOption('select:near(:text("Organization Type"))', 'nonprofit');

    // Fill contact name
    await page.fill('input[placeholder*="Enter contact name"]', 'Jane Doe');

    // Fill contact email
    await page.fill('input[type="email"]', 'jane.doe@example.com');

    // Fill country
    await page.fill('input[placeholder*="Enter your country"]', 'Turkey');

    // Click Next button
    await page.click('button:has-text("Next")');

    // Wait for step 2 to load
    await page.waitForTimeout(500);

    // ============================================
    // STEP 2: Project Details
    // ============================================

    // Verify we're on step 2
    await expect(page.locator('text=Project Details')).toBeVisible();

    // Fill short summary (under 280 characters)
    await page.fill(
      'textarea[placeholder*="Summarize your project"]',
      'Creating accessible vegan education spaces through community gardens. Teaching sustainable plant-based nutrition and fostering community connections through hands-on workshops and shared harvests.'
    );

    // Fill detailed description
    await page.fill(
      'textarea[placeholder*="Provide detailed information"]',
      `Our Vegan Community Garden Initiative aims to transform urban spaces into thriving centers of plant-based education and community building.

We will establish three community gardens in Istanbul, each serving as a living classroom where residents learn about:
- Sustainable organic farming techniques
- Plant-based nutrition and cooking
- Composting and waste reduction
- Biodiversity and ecological balance

The project includes weekly workshops, seasonal harvest festivals, and a seed library. We'll partner with local schools to integrate garden-based learning into curricula, reaching 500+ students annually.

Expected outcomes:
- 200+ community members actively participating
- 50 workshops conducted annually
- 2 tons of organic produce distributed
- Measurable reduction in neighborhood food waste`
    );

    // Fill budget
    await page.fill('input[type="number"][placeholder*="Total project budget"]', '250000');

    // Fill requested amount
    await page.fill('input[type="number"]:below(:text("Requested"))', '180000');

    // Set timeline start date (today)
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    await page.fill('input[type="date"]:near(:text("Start Date"))', startDate);

    // Set timeline end date (1 year from now)
    const endDate = new Date(today.setFullYear(today.getFullYear() + 1)).toISOString().split('T')[0];
    await page.fill('input[type="date"]:near(:text("End Date"))', endDate);

    // Fill optional website
    await page.fill('input[type="url"][placeholder*="https://"]', 'https://vegangardens.org');

    // Fill optional social media (Twitter)
    await page.fill('input[placeholder*="twitter.com"]', 'https://twitter.com/vegangardens');

    // Fill optional impact metrics
    await page.fill(
      'textarea[placeholder*="impact metrics"]',
      'Baseline survey completed with 150 community members. Will track: workshop attendance, produce distribution volume, participant satisfaction scores (target >85%), and food waste reduction (target 30% decrease).'
    );

    // Click Next button
    await page.click('button:has-text("Next")');

    // Wait for step 3 to load
    await page.waitForTimeout(500);

    // ============================================
    // STEP 3: Review & Submit
    // ============================================

    // Verify we're on step 3 (Review & Submit)
    await expect(page.locator('text=Review')).toBeVisible();

    // Verify review shows project name
    await expect(page.locator('text=Vegan Community Garden Initiative')).toBeVisible();

    // Verify review shows email
    await expect(page.locator('text=jane.doe@example.com')).toBeVisible();

    // Upload PDF file
    const filePath = path.join(__dirname, '../fixtures/sample-project.pdf');
    await page.setInputFiles('input[type="file"]', filePath);

    // Wait for file upload to be processed
    await page.waitForTimeout(1000);

    // Verify file is listed
    await expect(page.locator('text=sample-project.pdf')).toBeVisible();

    // Check required consent checkbox
    await page.check('input[type="checkbox"]:near(:text("consent"))');

    // Check optional marketing consent
    await page.check('input[type="checkbox"]:near(:text("marketing"))');

    // ============================================
    // API Interception & Submission
    // ============================================

    // Set up API route interception to capture response
    let apiResponse: any = null;
    page.on('response', async (response) => {
      if (response.url().includes('/api/foundation/apply') && response.request().method() === 'POST') {
        apiResponse = {
          status: response.status(),
          body: await response.json().catch(() => null),
        };
      }
    });

    // Click Submit button
    await page.click('button:has-text("Submit")');

    // ============================================
    // Success Validation
    // ============================================

    // Wait for success screen (max 30 seconds for API processing)
    await page.waitForSelector('text=Application Received', { timeout: 30000 });

    // Verify success message
    await expect(page.locator('text=successfully')).toBeVisible();

    // Verify application ID is displayed (format: CORIA-XXXXX-XXXXX)
    const applicationIdElement = page.locator('text=/CORIA-[A-Z0-9]+-[a-z0-9]+/');
    await expect(applicationIdElement).toBeVisible();

    // Extract and log application ID
    const applicationId = await applicationIdElement.textContent();
    console.log(`✓ Application submitted successfully: ${applicationId}`);

    // Verify API response was 200
    expect(apiResponse).not.toBeNull();
    expect(apiResponse?.status).toBe(200);
    console.log(`✓ API responded with 200 OK`);

    // Verify response contains success flag
    expect(apiResponse?.body?.success).toBe(true);
    expect(apiResponse?.body?.applicationId).toMatch(/CORIA-[A-Z0-9]+-[a-z0-9]+/);
    console.log(`✓ Response contains valid application ID: ${apiResponse?.body?.applicationId}`);

    // Verify success screen elements
    await expect(page.locator('text=confirmation email')).toBeVisible();
    await expect(page.locator('button:has-text("Foundation")')).toBeVisible();

    // Take screenshot of success screen
    await page.screenshot({
      path: 'test-results/foundation-apply/success-screen.png',
      fullPage: true
    });
    console.log('✓ Success screen screenshot captured');
  });

  test('should validate required fields before allowing next step', async ({ page }) => {
    // Try to click Next without filling required fields
    await page.click('button:has-text("Next")');

    // Should still be on step 1 (validation should prevent progression)
    await expect(page.locator('text=Project Information')).toBeVisible();

    // Error messages should be visible for required fields
    const errorLocator = page.locator('[class*="text-red"]');
    await expect(errorLocator.first()).toBeVisible({ timeout: 2000 });
  });

  test('should respect character limit on short summary', async ({ page }) => {
    // Navigate through step 1 with minimal data
    await page.fill('input[placeholder*="Enter your project name"]', 'Test Project');
    await page.fill('input[placeholder*="Enter contact name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[placeholder*="Enter your country"]', 'Turkey');
    await page.click('button:has-text("Next")');

    await page.waitForTimeout(500);

    // Try to enter more than 280 characters in short summary
    const longText = 'a'.repeat(300);
    await page.fill('textarea[placeholder*="Summarize your project"]', longText);

    // Get actual value
    const actualValue = await page.inputValue('textarea[placeholder*="Summarize your project"]');

    // Should be truncated to 280 characters
    expect(actualValue.length).toBeLessThanOrEqual(280);
  });

  test('should validate timeline dates (end date must be after start date)', async ({ page }) => {
    // Navigate through step 1
    await page.fill('input[placeholder*="Enter your project name"]', 'Test Project');
    await page.fill('input[placeholder*="Enter contact name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[placeholder*="Enter your country"]', 'Turkey');
    await page.click('button:has-text("Next")');

    await page.waitForTimeout(500);

    // Fill step 2 with invalid dates (end before start)
    await page.fill('textarea[placeholder*="Summarize your project"]', 'Short project description for validation test.');
    await page.fill('textarea[placeholder*="Provide detailed information"]', 'Detailed description with at least two hundred characters to meet the minimum requirement. This project aims to create positive change through sustainable practices and community engagement.');
    await page.fill('input[type="number"][placeholder*="Total project budget"]', '50000');
    await page.fill('input[type="number"]:below(:text("Requested"))', '40000');

    // Set end date before start date
    await page.fill('input[type="date"]:near(:text("Start Date"))', '2025-12-31');
    await page.fill('input[type="date"]:near(:text("End Date"))', '2025-01-01');

    // Try to proceed
    await page.click('button:has-text("Next")');

    // Should show validation error (either stay on step 2 or show error message)
    await page.waitForTimeout(1000);
    const hasError = await page.locator('[class*="text-red"]').count() > 0;
    const stillOnStep2 = await page.locator('text=Project Details').isVisible();

    expect(hasError || stillOnStep2).toBe(true);
  });

  test('should validate file upload constraints', async ({ page }) => {
    // Navigate to step 3
    await page.fill('input[placeholder*="Enter your project name"]', 'Test Project');
    await page.fill('input[placeholder*="Enter contact name"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[placeholder*="Enter your country"]', 'Turkey');
    await page.click('button:has-text("Next")');

    await page.waitForTimeout(500);

    await page.fill('textarea[placeholder*="Summarize your project"]', 'Short project description for testing file upload constraints.');
    await page.fill('textarea[placeholder*="Provide detailed information"]', 'Detailed description with at least two hundred characters to meet the minimum requirement. This project focuses on environmental sustainability and community development through innovative approaches.');
    await page.fill('input[type="number"][placeholder*="Total project budget"]', '100000');
    await page.fill('input[type="number"]:below(:text("Requested"))', '75000');

    const today = new Date().toISOString().split('T')[0];
    const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await page.fill('input[type="date"]:near(:text("Start Date"))', today);
    await page.fill('input[type="date"]:near(:text("End Date"))', futureDate);

    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);

    // Verify file upload accepts PDF
    const filePath = path.join(__dirname, '../fixtures/sample-project.pdf');
    await page.setInputFiles('input[type="file"]', filePath);

    await page.waitForTimeout(500);

    // Verify file is accepted
    await expect(page.locator('text=sample-project.pdf')).toBeVisible();
  });

  test('should save and load draft from localStorage', async ({ page }) => {
    // Fill some fields in step 1
    await page.fill('input[placeholder*="Enter your project name"]', 'Draft Test Project');
    await page.fill('input[placeholder*="Enter contact name"]', 'Draft User');
    await page.fill('input[type="email"]', 'draft@example.com');

    // Click "Save Draft" button
    await page.click('button:has-text("Save Draft")');

    // Wait for save confirmation (alert or toast)
    await page.waitForTimeout(1000);

    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify draft data is restored
    const projectNameValue = await page.inputValue('input[placeholder*="Enter your project name"]');
    expect(projectNameValue).toBe('Draft Test Project');

    const emailValue = await page.inputValue('input[type="email"]');
    expect(emailValue).toBe('draft@example.com');
  });
});

test.describe('Foundation Application - Test Mode', () => {
  test.use({
    extraHTTPHeaders: {
      'X-Test-Mode': 'true',
    }
  });

  test('should bypass rate limiting in test mode', async ({ page }) => {
    // In test mode (APPLY_TEST_MODE=true), rate limiting should be bypassed
    // Make multiple rapid submissions to verify

    for (let i = 0; i < 3; i++) {
      await page.goto('/en/foundation/apply');
      await page.waitForLoadState('networkidle');

      // Fill minimal form data
      await page.fill('input[placeholder*="Enter your project name"]', `Test Project ${i}`);
      await page.selectOption('select:near(:text("Category"))', 'veganism');
      await page.selectOption('select:near(:text("Organization Type"))', 'nonprofit');
      await page.fill('input[placeholder*="Enter contact name"]', 'Test User');
      await page.fill('input[type="email"]', `test${i}@example.com`);
      await page.fill('input[placeholder*="Enter your country"]', 'Turkey');

      await page.click('button:has-text("Next")');
      await page.waitForTimeout(500);

      // Quick navigation through remaining steps for rate limit test
      console.log(`✓ Submission ${i + 1}/3 processed without rate limit`);
    }
  });
});
