import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('📍 Navigating to Foundation page...');
  await page.goto('http://localhost:3001/tr/foundation');
  await page.waitForLoadState('networkidle');
  
  console.log('🔍 Checking page content...');
  const pageTitle = await page.title();
  console.log('Page title:', pageTitle);
  
  console.log('🔍 Looking for Link elements...');
  const links = await page.locator('a[href="/tr/foundation/apply"]').count();
  console.log('Found', links, 'links with href="/tr/foundation/apply"');
  
  if (links > 0) {
    console.log('🖱️  Clicking first link...');
    await page.locator('a[href="/tr/foundation/apply"]').first().click();
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('📍 Current URL:', currentUrl);
    
    if (currentUrl.includes('/foundation/apply')) {
      console.log('✅ SUCCESS! Navigated to apply page');
    } else {
      console.log('❌ FAILED! URL:', currentUrl);
    }
  } else {
    console.log('❌ No links found!');
  }
  
  await page.waitForTimeout(5000);
  await browser.close();
})();
