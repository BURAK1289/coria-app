import { test, expect } from '../../fixtures';
import { ThemePage } from '../../page-objects/theme.page';

test.describe('@smoke Theme Tests', () => {
  let themePage: ThemePage;

  test.beforeEach(async ({ page, locale }) => {
    themePage = new ThemePage(page);
    await themePage.goto('/', locale);
  });

  test('should display theme toggle button', async () => {
    await themePage.verifyThemeToggleVisible();
  });

  test('should toggle between light and dark themes', async () => {
    // Get initial theme
    const initialTheme = await themePage.getCurrentTheme();

    // Toggle theme
    const newTheme = await themePage.toggleAndVerify();

    // Verify theme changed
    expect(newTheme).not.toBe(initialTheme);

    // Toggle back
    await themePage.toggleAndVerify();

    // Verify we're back at initial theme
    const finalTheme = await themePage.getCurrentTheme();
    expect(finalTheme).toBe(initialTheme);
  });

  test('should persist theme preference after reload', async () => {
    // Set to dark theme
    const currentTheme = await themePage.getCurrentTheme();
    if (currentTheme !== 'dark') {
      await themePage.toggleTheme();
      await themePage.waitForTheme('dark');
    }

    // Reload page
    await themePage.reload();

    // Verify theme is still dark
    const themeAfterReload = await themePage.getCurrentTheme();
    expect(themeAfterReload).toBe('dark');
  });

  test('should persist theme across page navigation', async () => {
    // Set to dark theme
    const currentTheme = await themePage.getCurrentTheme();
    if (currentTheme !== 'dark') {
      await themePage.toggleTheme();
      await themePage.waitForTheme('dark');
    }

    // Navigate to features
    await themePage.clickNav('features');
    await themePage.waitForPageLoad();
    expect(await themePage.getCurrentTheme()).toBe('dark');

    // Navigate to pricing
    await themePage.clickNav('pricing');
    await themePage.waitForPageLoad();
    expect(await themePage.getCurrentTheme()).toBe('dark');

    // Go back
    await themePage.goBack();
    await themePage.waitForPageLoad();
    expect(await themePage.getCurrentTheme()).toBe('dark');
  });

  test('should update theme icon when toggling', async () => {
    // Verify icon reflects current theme
    await themePage.verifyThemeIcon();

    // Toggle theme
    await themePage.toggleTheme();

    // Verify icon changed
    await themePage.verifyThemeIcon();
  });

  test('should apply correct CSS classes for dark theme', async () => {
    // Switch to dark theme
    const currentTheme = await themePage.getCurrentTheme();
    if (currentTheme !== 'dark') {
      await themePage.toggleTheme();
      await themePage.waitForTheme('dark');
    }

    // Verify dark class is applied
    const htmlElement = themePage.page.locator('html');
    await expect(htmlElement).toHaveClass(/dark/);
  });

  test('should not have dark class for light theme', async () => {
    // Switch to light theme
    const currentTheme = await themePage.getCurrentTheme();
    if (currentTheme !== 'light') {
      await themePage.toggleTheme();
      await themePage.waitForTheme('light');
    }

    // Verify dark class is NOT applied
    const htmlElement = themePage.page.locator('html');
    const classAttribute = await htmlElement.getAttribute('class');
    expect(classAttribute).not.toContain('dark');
  });
});
