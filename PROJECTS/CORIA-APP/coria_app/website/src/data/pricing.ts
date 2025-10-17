/**
 * CORIA Pricing Data Model
 *
 * Comprehensive pricing structure with:
 * - Feature matrix (Free vs Premium)
 * - Regional pricing (US, EU, TR)
 * - Paywall triggers
 * - Trial information
 */

export type PlanType = 'free' | 'premium';
export type BillingPeriod = 'monthly' | 'yearly' | 'family' | 'lifetime';
export type Region = 'US' | 'EU' | 'TR';

export interface FeatureAccess {
  free: string | boolean;
  premium: string | boolean;
  note?: string;
  paywallTrigger?: string;
}

export interface PricingTier {
  monthly: number;
  yearly: number;
  family: number;
  lifetime: number;
}

export interface RegionalPricing {
  region: Region;
  currency: string;
  currencySymbol: string;
  pricing: PricingTier;
  vatIncluded?: boolean;
  discount?: {
    yearly: number; // percentage
  };
}

/**
 * Feature Matrix
 *
 * Defines access levels for Free vs Premium plans
 */
export const FEATURES: Record<string, FeatureAccess> = {
  // Core Scanning
  scanningAndNutrition: {
    free: 'unlimited',
    premium: 'unlimited',
    note: 'Sınırsız tarama herkese açık',
  },

  // Sustainability Metrics
  sustainabilityMetrics: {
    free: 'view',
    premium: 'detailed-reports',
    note: 'Free: görüntüleme; Premium: derin analiz ve raporlar',
  },

  // Alternatives & Recipes
  alternativesAndRecipes: {
    free: false,
    premium: true,
    paywallTrigger: 'alternatives',
    note: 'Premium özelliği',
  },

  // Smart Pantry
  smartPantry: {
    free: '20-products',
    premium: 'unlimited-automation',
    paywallTrigger: 'pantry-limit',
    note: 'Free: 20 ürün; Premium: sınırsız + otomasyon',
  },

  // Shopping List
  shoppingList: {
    free: 'unlimited',
    premium: 'unlimited-sharing-smart-sort',
    note: 'Herkese sınırsız; Premium: paylaşım + akıllı sıralama',
  },

  // AI Chat
  aiChat: {
    free: '10-messages-allergen-only',
    premium: 'unlimited-personalized-history',
    paywallTrigger: 'ai-limit',
    note: 'Free: 10 mesaj/gün, sadece alerjen; Premium: sınırsız + kişisel',
  },

  // Meal Planner
  mealPlanner: {
    free: false,
    premium: true,
    paywallTrigger: 'meal-planner',
    note: 'Premium özelliği',
  },

  // Scan History
  scanHistory: {
    free: '1-month',
    premium: 'unlimited',
    note: 'Free: 1 ay; Premium: sınırsız',
  },

  // Weekly Summary
  weeklySummary: {
    free: 'basic',
    premium: 'detailed-trends',
    note: 'Free: temel; Premium: detaylı + trend analizi',
  },

  // Notifications
  notifications: {
    free: 'basic',
    premium: 'smart',
    note: 'Free: temel; Premium: akıllı bildirimler',
  },

  // Ads
  ads: {
    free: false,
    premium: false,
    note: 'Her iki planda da reklam yok',
  },
};

/**
 * Paywall Triggers
 *
 * Messages shown when users hit feature limits
 */
export const PAYWALL_TRIGGERS: Record<string, string> = {
  alternatives: 'alternatives-paywall',
  recipes: 'recipes-paywall',
  aiLimit: 'ai-limit-paywall',
  pantryLimit: 'pantry-limit-paywall',
  mealPlanner: 'meal-planner-paywall',
};

/**
 * Regional Pricing
 *
 * Pricing tiers for different regions with local currencies
 */
export const REGIONAL_PRICING: RegionalPricing[] = [
  {
    region: 'US',
    currency: 'USD',
    currencySymbol: '$',
    pricing: {
      monthly: 5.49,
      yearly: 39.99,
      family: 9.99,
      lifetime: 99.0,
    },
    discount: {
      yearly: 35, // ~35% discount on yearly
    },
  },
  {
    region: 'EU',
    currency: 'EUR',
    currencySymbol: '€',
    pricing: {
      monthly: 4.99,
      yearly: 39.99,
      family: 10.49,
      lifetime: 109.0,
    },
    vatIncluded: true,
    discount: {
      yearly: 35,
    },
  },
  {
    region: 'TR',
    currency: 'TRY',
    currencySymbol: '₺',
    pricing: {
      monthly: 89.99,
      yearly: 649.99,
      family: 139.99,
      lifetime: 1499.0,
    },
    discount: {
      yearly: 35,
    },
  },
];

/**
 * Trial Information
 */
export const TRIAL_INFO = {
  duration: 14, // days
  requiresCard: false,
  afterTrial: 'free', // reverts to free plan
};

/**
 * Plan Summary
 *
 * Marketing copy for plan overview
 */
export const PLAN_SUMMARY = {
  tagline:
    'Sınırsız tarama herkese. Kişisel uyarılar, tarif & alternatifler, akıllı kiler otomasyonları ve ileri raporlar → Premium.',
  free: {
    title: 'Free',
    description: 'Temel özelliklerle başla',
    highlights: [
      'Sınırsız tarama',
      'Temel besin özeti',
      '20 ürünlük kiler',
      '10 AI mesaj/gün',
    ],
  },
  premium: {
    title: 'Premium',
    description: 'Tüm özelliklerle tam deneyim',
    highlights: [
      'Kişiselleştirilmiş öneriler',
      'Sınırsız AI chat',
      'Tarif ve alternatifler',
      'Akıllı kiler otomasyonu',
      'Yemek planlayıcı',
      'Detaylı raporlar',
    ],
  },
};

/**
 * Format price with regional currency
 */
export function formatRegionalPrice(
  amount: number,
  region: Region,
  locale: string = 'en-US'
): string {
  const regional = REGIONAL_PRICING.find((r) => r.region === region);
  if (!regional) return `${amount}`;

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: regional.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Get pricing for specific region and period
 */
export function getPricing(region: Region, period: BillingPeriod): number {
  const regional = REGIONAL_PRICING.find((r) => r.region === region);
  return regional?.pricing[period] ?? 0;
}

/**
 * Calculate yearly savings percentage
 */
export function calculateYearlySavings(region: Region): number {
  const regional = REGIONAL_PRICING.find((r) => r.region === region);
  if (!regional) return 0;

  const monthlyTotal = regional.pricing.monthly * 12;
  const yearlyPrice = regional.pricing.yearly;
  const savings = ((monthlyTotal - yearlyPrice) / monthlyTotal) * 100;

  return Math.round(savings);
}

/**
 * Get feature access level
 */
export function getFeatureAccess(
  feature: keyof typeof FEATURES,
  plan: PlanType
): string | boolean {
  return FEATURES[feature][plan];
}

/**
 * Check if feature has paywall trigger
 */
export function hasPaywallTrigger(feature: keyof typeof FEATURES): boolean {
  return !!FEATURES[feature].paywallTrigger;
}

/**
 * Get paywall trigger key for i18n
 */
export function getPaywallTriggerKey(
  feature: keyof typeof FEATURES
): string | undefined {
  return FEATURES[feature].paywallTrigger;
}
