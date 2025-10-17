import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureComparison } from '@/components/pricing/feature-comparison';
import { PricingPlans } from '@/components/pricing/pricing-plans';
import {
  FEATURES,
  PAYWALL_TRIGGERS,
  REGIONAL_PRICING,
  calculateYearlySavings,
  formatRegionalPrice,
  getPricing,
  getFeatureAccess,
  hasPaywallTrigger,
} from '@/data/pricing';

describe('Pricing Page Tests', () => {
  describe('Pricing Data Model', () => {
    describe('Feature Matrix', () => {
      it('should have exactly 11 features defined', () => {
        const featureKeys = Object.keys(FEATURES);
        expect(featureKeys).toHaveLength(11);
      });

      it('should include all expected features', () => {
        const expectedFeatures = [
          'scanningAndNutrition',
          'sustainabilityMetrics',
          'alternativesAndRecipes',
          'smartPantry',
          'shoppingList',
          'aiChat',
          'mealPlanner',
          'scanHistory',
          'weeklySummary',
          'notifications',
          'ads',
        ];

        expectedFeatures.forEach((feature) => {
          expect(FEATURES).toHaveProperty(feature);
        });
      });

      it('should have correct access levels for Free plan', () => {
        expect(FEATURES.scanningAndNutrition.free).toBe('unlimited');
        expect(FEATURES.alternativesAndRecipes.free).toBe(false);
        expect(FEATURES.smartPantry.free).toBe('20-products');
        expect(FEATURES.aiChat.free).toBe('10-messages-allergen-only');
        expect(FEATURES.mealPlanner.free).toBe(false);
      });

      it('should have correct access levels for Premium plan', () => {
        expect(FEATURES.scanningAndNutrition.premium).toBe('unlimited');
        expect(FEATURES.alternativesAndRecipes.premium).toBe(true);
        expect(FEATURES.smartPantry.premium).toBe('unlimited-automation');
        expect(FEATURES.aiChat.premium).toBe('unlimited-personalized-history');
        expect(FEATURES.mealPlanner.premium).toBe(true);
      });

      it('should mark Premium-only features with paywall triggers', () => {
        expect(FEATURES.alternativesAndRecipes.paywallTrigger).toBe(
          'alternatives'
        );
        expect(FEATURES.smartPantry.paywallTrigger).toBe('pantry-limit');
        expect(FEATURES.aiChat.paywallTrigger).toBe('ai-limit');
        expect(FEATURES.mealPlanner.paywallTrigger).toBe('meal-planner');
      });

      it('should have no ads in both Free and Premium', () => {
        expect(FEATURES.ads.free).toBe(false);
        expect(FEATURES.ads.premium).toBe(false);
      });
    });

    describe('Paywall Triggers', () => {
      it('should have exactly 5 paywall triggers defined', () => {
        const triggers = Object.keys(PAYWALL_TRIGGERS);
        expect(triggers).toHaveLength(5);
      });

      it('should include all expected triggers', () => {
        expect(PAYWALL_TRIGGERS).toHaveProperty('alternatives');
        expect(PAYWALL_TRIGGERS).toHaveProperty('recipes');
        expect(PAYWALL_TRIGGERS).toHaveProperty('aiLimit');
        expect(PAYWALL_TRIGGERS).toHaveProperty('pantryLimit');
        expect(PAYWALL_TRIGGERS).toHaveProperty('mealPlanner');
      });

      it('should map triggers to i18n keys', () => {
        expect(PAYWALL_TRIGGERS.alternatives).toBe('alternatives-paywall');
        expect(PAYWALL_TRIGGERS.recipes).toBe('recipes-paywall');
        expect(PAYWALL_TRIGGERS.aiLimit).toBe('ai-limit-paywall');
        expect(PAYWALL_TRIGGERS.pantryLimit).toBe('pantry-limit-paywall');
        expect(PAYWALL_TRIGGERS.mealPlanner).toBe('meal-planner-paywall');
      });
    });

    describe('Regional Pricing', () => {
      it('should have exactly 3 regions defined', () => {
        expect(REGIONAL_PRICING).toHaveLength(3);
      });

      it('should include US, EU, and TR regions', () => {
        const regions = REGIONAL_PRICING.map((r) => r.region);
        expect(regions).toContain('US');
        expect(regions).toContain('EU');
        expect(regions).toContain('TR');
      });

      describe('US Pricing', () => {
        const us = REGIONAL_PRICING.find((r) => r.region === 'US')!;

        it('should have correct currency details', () => {
          expect(us.currency).toBe('USD');
          expect(us.currencySymbol).toBe('$');
        });

        it('should have correct pricing for all tiers', () => {
          expect(us.pricing.monthly).toBe(5.49);
          expect(us.pricing.yearly).toBe(39.99);
          expect(us.pricing.family).toBe(9.99);
          expect(us.pricing.lifetime).toBe(99.0);
        });

        it('should have 35% yearly discount', () => {
          expect(us.discount?.yearly).toBe(35);
        });
      });

      describe('EU Pricing', () => {
        const eu = REGIONAL_PRICING.find((r) => r.region === 'EU')!;

        it('should have correct currency details', () => {
          expect(eu.currency).toBe('EUR');
          expect(eu.currencySymbol).toBe('€');
        });

        it('should have correct pricing for all tiers', () => {
          expect(eu.pricing.monthly).toBe(4.99);
          expect(eu.pricing.yearly).toBe(39.99);
          expect(eu.pricing.family).toBe(10.49);
          expect(eu.pricing.lifetime).toBe(109.0);
        });

        it('should include VAT', () => {
          expect(eu.vatIncluded).toBe(true);
        });
      });

      describe('TR Pricing', () => {
        const tr = REGIONAL_PRICING.find((r) => r.region === 'TR')!;

        it('should have correct currency details', () => {
          expect(tr.currency).toBe('TRY');
          expect(tr.currencySymbol).toBe('₺');
        });

        it('should have correct pricing for all tiers', () => {
          expect(tr.pricing.monthly).toBe(89.99);
          expect(tr.pricing.yearly).toBe(649.99);
          expect(tr.pricing.family).toBe(139.99);
          expect(tr.pricing.lifetime).toBe(1499.0);
        });
      });
    });

    describe('Utility Functions', () => {
      describe('formatRegionalPrice', () => {
        it('should format US prices correctly', () => {
          const formatted = formatRegionalPrice(5.49, 'US', 'en-US');
          expect(formatted).toContain('5.49');
          expect(formatted).toMatch(/\$/);
        });

        it('should format EU prices correctly', () => {
          const formatted = formatRegionalPrice(4.99, 'EU', 'en-US');
          expect(formatted).toContain('4.99');
          expect(formatted).toMatch(/€/);
        });

        it('should format TR prices correctly', () => {
          const formatted = formatRegionalPrice(89.99, 'TR', 'tr-TR');
          expect(formatted).toContain('89');
        });

        it('should return plain number for invalid region', () => {
          const formatted = formatRegionalPrice(100, 'INVALID' as any);
          expect(formatted).toBe('100');
        });
      });

      describe('getPricing', () => {
        it('should return correct pricing for US monthly', () => {
          expect(getPricing('US', 'monthly')).toBe(5.49);
        });

        it('should return correct pricing for EU yearly', () => {
          expect(getPricing('EU', 'yearly')).toBe(39.99);
        });

        it('should return correct pricing for TR lifetime', () => {
          expect(getPricing('TR', 'lifetime')).toBe(1499.0);
        });

        it('should return 0 for invalid region', () => {
          expect(getPricing('INVALID' as any, 'monthly')).toBe(0);
        });
      });

      describe('calculateYearlySavings', () => {
        it('should calculate ~35% savings for US', () => {
          const savings = calculateYearlySavings('US');
          expect(savings).toBeGreaterThanOrEqual(30);
          expect(savings).toBeLessThanOrEqual(40);
        });

        it('should calculate ~35% savings for EU', () => {
          const savings = calculateYearlySavings('EU');
          expect(savings).toBeGreaterThanOrEqual(30);
          expect(savings).toBeLessThanOrEqual(40);
        });

        it('should calculate ~35% savings for TR', () => {
          const savings = calculateYearlySavings('TR');
          expect(savings).toBeGreaterThanOrEqual(30);
          expect(savings).toBeLessThanOrEqual(40);
        });

        it('should return 0 for invalid region', () => {
          expect(calculateYearlySavings('INVALID' as any)).toBe(0);
        });

        it('should calculate correct formula: (monthly*12 - yearly) / (monthly*12)', () => {
          const us = REGIONAL_PRICING.find((r) => r.region === 'US')!;
          const monthlyTotal = us.pricing.monthly * 12;
          const expected = Math.round(
            ((monthlyTotal - us.pricing.yearly) / monthlyTotal) * 100
          );
          expect(calculateYearlySavings('US')).toBe(expected);
        });
      });

      describe('getFeatureAccess', () => {
        it('should return correct access for Free plan', () => {
          expect(getFeatureAccess('scanningAndNutrition', 'free')).toBe(
            'unlimited'
          );
          expect(getFeatureAccess('alternativesAndRecipes', 'free')).toBe(
            false
          );
          expect(getFeatureAccess('smartPantry', 'free')).toBe('20-products');
        });

        it('should return correct access for Premium plan', () => {
          expect(getFeatureAccess('scanningAndNutrition', 'premium')).toBe(
            'unlimited'
          );
          expect(getFeatureAccess('alternativesAndRecipes', 'premium')).toBe(
            true
          );
          expect(getFeatureAccess('smartPantry', 'premium')).toBe(
            'unlimited-automation'
          );
        });
      });

      describe('hasPaywallTrigger', () => {
        it('should return true for features with paywall triggers', () => {
          expect(hasPaywallTrigger('alternativesAndRecipes')).toBe(true);
          expect(hasPaywallTrigger('smartPantry')).toBe(true);
          expect(hasPaywallTrigger('aiChat')).toBe(true);
          expect(hasPaywallTrigger('mealPlanner')).toBe(true);
        });

        it('should return false for features without paywall triggers', () => {
          expect(hasPaywallTrigger('scanningAndNutrition')).toBe(false);
          expect(hasPaywallTrigger('shoppingList')).toBe(false);
          expect(hasPaywallTrigger('ads')).toBe(false);
        });
      });
    });
  });

  describe('FeatureComparison Component', () => {
    it('should render without crashing', () => {
      const { container } = render(<FeatureComparison />);
      expect(container).toBeInTheDocument();
    });

    it('should render comparison section', () => {
      render(<FeatureComparison />);
      expect(screen.getByText('comparison.title')).toBeInTheDocument();
    });

    it('should render feature rows', () => {
      render(<FeatureComparison />);
      // Component uses t() for translations, which returns keys in test
      const features = screen.getAllByText(/comparison.features/);
      expect(features.length).toBeGreaterThan(0);
    });
  });

  describe('PricingPlans Component', () => {
    it('should render without crashing', () => {
      const { container } = render(<PricingPlans />);
      expect(container).toBeInTheDocument();
    });

    it('should render Free and Premium plan cards', () => {
      render(<PricingPlans />);
      // Component uses t() for translations
      expect(screen.getByText('plans.free.name')).toBeInTheDocument();
      expect(screen.getByText('plans.premium.name')).toBeInTheDocument();
    });

    it('should show "En Popüler" badge on Premium', () => {
      render(<PricingPlans />);
      expect(screen.getByText(/en popüler/i)).toBeInTheDocument();
    });

    it('should render CTAs for both plans', () => {
      render(<PricingPlans />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Business Logic Validation', () => {
    it('should ensure yearly plan is cheaper than monthly x 12', () => {
      REGIONAL_PRICING.forEach((regional) => {
        const monthlyTotal = regional.pricing.monthly * 12;
        expect(regional.pricing.yearly).toBeLessThan(monthlyTotal);
      });
    });

    it('should ensure family plan is more expensive than single plan', () => {
      REGIONAL_PRICING.forEach((regional) => {
        expect(regional.pricing.family).toBeGreaterThan(
          regional.pricing.monthly
        );
      });
    });

    it('should ensure lifetime is most expensive one-time payment', () => {
      REGIONAL_PRICING.forEach((regional) => {
        expect(regional.pricing.lifetime).toBeGreaterThan(
          regional.pricing.yearly
        );
        expect(regional.pricing.lifetime).toBeGreaterThan(
          regional.pricing.family
        );
      });
    });

    it('should have consistent feature coverage across plans', () => {
      Object.keys(FEATURES).forEach((key) => {
        const feature = FEATURES[key];
        expect(feature).toHaveProperty('free');
        expect(feature).toHaveProperty('premium');
      });
    });

    it('should have paywall triggers defined', () => {
      // Check that PAYWALL_TRIGGERS constant exists and has expected keys
      expect(PAYWALL_TRIGGERS).toBeDefined();
      expect(Object.keys(PAYWALL_TRIGGERS).length).toBeGreaterThan(0);

      // Verify some features have paywall triggers
      const featureTriggers = Object.values(FEATURES)
        .filter((f) => f.paywallTrigger)
        .map((f) => f.paywallTrigger);

      expect(featureTriggers.length).toBeGreaterThan(0);

      // Check that at least some triggers match
      const hasMatchingTrigger = Object.keys(PAYWALL_TRIGGERS).some(trigger =>
        featureTriggers.includes(trigger)
      );
      expect(hasMatchingTrigger).toBe(true);
    });
  });
});
