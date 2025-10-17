import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class PricingPage extends BasePage {
  readonly regionalPricingSection: Locator;
  readonly usRegionButton: Locator;
  readonly euRegionButton: Locator;
  readonly trRegionButton: Locator;
  readonly comparisonSection: Locator;
  readonly bestValueBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.regionalPricingSection = page.locator('section').filter({ hasText: /Regional|Bölgesel/i });
    this.usRegionButton = page.locator('button').filter({ hasText: /^US$|United States/i });
    this.euRegionButton = page.locator('button').filter({ hasText: /^EU$|European Union/i });
    this.trRegionButton = page.locator('button').filter({ hasText: /^TR$|Turkey|Türkiye/i });
    this.comparisonSection = page.locator('section').filter({ has: page.locator('table') });
    this.bestValueBadge = page.locator('text=/Best Value|En İyi/i');
  }

  async goto(locale: string = 'tr') {
    await super.goto('/pricing', locale);
    await this.waitForPageLoad();
  }

  async scrollToRegionalPricing() {
    await this.regionalPricingSection.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
  }

  async scrollToComparison() {
    await this.comparisonSection.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
  }

  async selectRegion(region: 'US' | 'EU' | 'TR') {
    const buttonMap = {
      US: this.usRegionButton,
      EU: this.euRegionButton,
      TR: this.trRegionButton,
    };

    const button = buttonMap[region];
    await button.waitFor({ state: 'visible' });
    await button.click();
    await this.page.waitForTimeout(500);
  }

  async verifyCurrency(symbol: '$' | '€' | '₺') {
    const priceWithSymbol = this.page.locator(`text=/${symbol}/`);
    await expect(priceWithSymbol.first()).toBeVisible();
  }

  async verifyConsistentCurrency(expectedSymbol: '$' | '€' | '₺') {
    const symbols = await this.getCurrencySymbols();
    symbols.forEach(symbol => {
      expect(symbol).toBe(expectedSymbol);
    });
  }

  async getCurrencySymbols(): Promise<string[]> {
    const symbols: string[] = [];
    const priceElements = await this.page.locator('text=/[€$₺]/').all();

    for (const element of priceElements) {
      const text = await element.textContent();
      const match = text?.match(/[€$₺]/);
      if (match && !symbols.includes(match[0])) {
        symbols.push(match[0]);
      }
    }

    return symbols;
  }

  async verifyDiscountBadge(minPercent: number, maxPercent: number) {
    const discountText = this.page.locator('text=/\\d+%/');
    await expect(discountText.first()).toBeVisible();

    const text = await discountText.first().textContent();
    const match = text?.match(/(\d+)%/);

    expect(match).toBeTruthy();
    const percent = parseInt(match![1]);
    expect(percent).toBeGreaterThanOrEqual(minPercent);
    expect(percent).toBeLessThanOrEqual(maxPercent);
  }

  async verifyBestValueBadge() {
    await expect(this.bestValueBadge).toBeVisible();
  }

  async verifyAllTiers() {
    const monthlyTier = this.page.locator('text=/Monthly|Aylık/i');
    const yearlyTier = this.page.locator('text=/Yearly|Yıllık/i');
    const familyTier = this.page.locator('text=/Family|Aile/i');
    const lifetimeTier = this.page.locator('text=/Lifetime|Ömür/i');

    await expect(monthlyTier.first()).toBeVisible();
    await expect(yearlyTier.first()).toBeVisible();
    await expect(familyTier.first()).toBeVisible();
    await expect(lifetimeTier.first()).toBeVisible();
  }
}
