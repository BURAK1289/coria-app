import { Page } from '@playwright/test';

/**
 * Network Mocking Utilities
 * Blocks analytics, tracking, and external dependencies for stable E2E tests
 */

/**
 * Block Google Analytics and tracking scripts
 */
export async function blockAnalytics(page: Page) {
  await page.route('**/*gtag/js*', route => route.abort());
  await page.route('**/*analytics.js*', route => route.abort());
  await page.route('**/*ga.js*', route => route.abort());
  await page.route('**/googletagmanager.com/**', route => route.abort());
  await page.route('**/google-analytics.com/**', route => route.abort());
  await page.route('**/doubleclick.net/**', route => route.abort());
}

/**
 * Block social media tracking pixels
 */
export async function blockSocialTracking(page: Page) {
  await page.route('**/facebook.com/tr*', route => route.abort());
  await page.route('**/facebook.net/**', route => route.abort());
  await page.route('**/twitter.com/i/adsct*', route => route.abort());
  await page.route('**/linkedin.com/px/**', route => route.abort());
}

/**
 * Mock external font loading for speed
 */
export async function mockFonts(page: Page) {
  // Block Google Fonts if causing delays
  await page.route('**/fonts.googleapis.com/**', route => 
    route.fulfill({ status: 200, body: '' })
  );
  await page.route('**/fonts.gstatic.com/**', route => 
    route.fulfill({ status: 200, body: '' })
  );
}

/**
 * Mock image CDN responses for instant loading
 */
export async function mockImageCDN(page: Page) {
  // Return 1x1 transparent PNG for any image requests to external CDNs
  const transparentPNG = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );

  await page.route('**/unsplash.com/**', route =>
    route.fulfill({ status: 200, contentType: 'image/png', body: transparentPNG })
  );
  await page.route('**/cloudinary.com/**', route =>
    route.fulfill({ status: 200, contentType: 'image/png', body: transparentPNG })
  );
}

/**
 * Apply all standard mocks for stable testing
 */
export async function applyStandardMocks(page: Page) {
  await blockAnalytics(page);
  await blockSocialTracking(page);
  // Uncomment if fonts or images cause issues:
  // await mockFonts(page);
  // await mockImageCDN(page);
}

/**
 * Mock specific API endpoint with custom response
 */
export async function mockApiEndpoint(
  page: Page,
  pattern: string | RegExp,
  response: any,
  options?: { status?: number; delay?: number }
) {
  await page.route(pattern, async route => {
    if (options?.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
    await route.fulfill({
      status: options?.status || 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Log all network requests (for debugging)
 */
export function logNetworkRequests(page: Page) {
  page.on('request', request => {
    console.log('→', request.method(), request.url());
  });

  page.on('response', response => {
    console.log('←', response.status(), response.url());
  });
}

/**
 * Wait for specific network request to complete
 */
export async function waitForRequest(page: Page, urlPattern: string | RegExp) {
  return page.waitForRequest(urlPattern, { timeout: 10000 });
}

/**
 * Wait for specific network response
 */
export async function waitForResponse(page: Page, urlPattern: string | RegExp) {
  return page.waitForResponse(urlPattern, { timeout: 10000 });
}
