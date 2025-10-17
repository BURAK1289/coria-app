/**
 * A/B Testing infrastructure for conversion optimization
 * Simple client-side testing with analytics integration
 */

import { trackEvent } from './gtag';
import { isNonEmptyString, isValidObject } from '../type-guards';
import { logger } from '@/lib/logger';

type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonPrimitive[] | { [key: string]: JsonValue };

export interface ABTest {
  id: string;
  name: string;
  variants: ABVariant[];
  traffic: number; // Percentage of users to include (0-100)
  active: boolean;
  startDate: Date;
  endDate?: Date;
}

export interface ABVariant {
  id: string;
  name: string;
  weight: number; // Percentage of test traffic (0-100)
  config: Record<string, JsonValue>;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  config: Record<string, JsonValue>;
}

// Storage key for user's test assignments
const AB_STORAGE_KEY = 'coria_ab_tests';

// Active A/B tests configuration
const ACTIVE_TESTS: ABTest[] = [
  {
    id: 'hero_cta_text',
    name: 'Hero CTA Button Text',
    traffic: 50, // 50% of users
    active: true,
    startDate: new Date('2024-01-01'),
    variants: [
      {
        id: 'control',
        name: 'Download Now',
        weight: 50,
        config: { ctaText: 'Download Now' }
      },
      {
        id: 'variant_a',
        name: 'Get Started Free',
        weight: 50,
        config: { ctaText: 'Get Started Free' }
      }
    ]
  },
  {
    id: 'pricing_display',
    name: 'Pricing Display Format',
    traffic: 30, // 30% of users
    active: true,
    startDate: new Date('2024-01-01'),
    variants: [
      {
        id: 'control',
        name: 'Monthly Price',
        weight: 50,
        config: { showAnnual: false, emphasizeDiscount: false }
      },
      {
        id: 'variant_a',
        name: 'Annual Discount',
        weight: 50,
        config: { showAnnual: true, emphasizeDiscount: true }
      }
    ]
  },
  {
    id: 'feature_order',
    name: 'Feature Section Order',
    traffic: 25, // 25% of users
    active: true,
    startDate: new Date('2024-01-01'),
    variants: [
      {
        id: 'control',
        name: 'Scanning First',
        weight: 50,
        config: { featureOrder: ['scanning', 'sustainability', 'recommendations', 'tracking'] }
      },
      {
        id: 'variant_a',
        name: 'Sustainability First',
        weight: 50,
        config: { featureOrder: ['sustainability', 'scanning', 'tracking', 'recommendations'] }
      }
    ]
  }
];

// Validate persisted assignment map
const parseAssignments = (value: unknown): Record<string, string> => {
  if (!isValidObject(value)) {
    return {};
  }

  const assignments: Record<string, string> = {};

  for (const [key, rawValue] of Object.entries(value)) {
    if (isNonEmptyString(key) && isNonEmptyString(rawValue)) {
      assignments[key] = rawValue;
    }
  }

  return assignments;
};

// Get user's test assignments
const getUserTestAssignments = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const stored = localStorage.getItem(AB_STORAGE_KEY);
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored) as unknown;
    return parseAssignments(parsed);
  } catch {
    return {};
  }
};

// Save user's test assignments
const saveUserTestAssignments = (assignments: Record<string, string>) => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(AB_STORAGE_KEY, JSON.stringify(assignments));
  } catch (error) {
    logger.warn('Failed to save A/B test assignments:', error);
  }
};

// Generate deterministic hash from user identifier
const hashUserId = (userId: string): number => {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Get or generate user identifier for consistent test assignment
const getUserId = (): string => {
  if (typeof window === 'undefined') return 'server';

  let userId = localStorage.getItem('coria_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('coria_user_id', userId);
  }
  return userId;
};

// Assign user to test variant
const assignUserToVariant = (test: ABTest): string | null => {
  const userId = getUserId();
  const hash = hashUserId(userId + test.id);
  
  // Check if user should be included in test
  const trafficThreshold = (test.traffic / 100) * 100;
  if (hash % 100 >= trafficThreshold) {
    return null; // User not in test
  }

  // Assign to variant based on weights
  const random = hash % 100;
  let cumulativeWeight = 0;

  for (const variant of test.variants) {
    cumulativeWeight += variant.weight;
    if (random < cumulativeWeight) {
      return variant.id;
    }
  }

  // Fallback to first variant
  return test.variants[0]?.id || null;
};

// Get test result for a specific test
export const getABTestResult = (testId: string): ABTestResult | null => {
  const test = ACTIVE_TESTS.find(t => t.id === testId && t.active);
  if (!test) return null;

  // Check if test has ended
  if (test.endDate && new Date() > test.endDate) {
    return null;
  }

  const assignments = getUserTestAssignments();
  let variantId: string | null = assignments[testId] || null;

  // Assign user to variant if not already assigned
  if (!variantId) {
    variantId = assignUserToVariant(test);
    if (!variantId) return null; // User not in test

    // Save assignment
    const newAssignments = { ...assignments, [testId]: variantId };
    saveUserTestAssignments(newAssignments);

    // Track test participation
    trackEvent('ab_test_assigned', 'experiment', `${testId}_${variantId}`);
  }

  const variant = test.variants.find(v => v.id === variantId);
  if (!variant) return null;

  return {
    testId,
    variantId,
    config: variant.config,
  };
};

// Get all active test results for current user
export const getAllABTestResults = (): Record<string, ABTestResult> => {
  const results: Record<string, ABTestResult> = {};

  ACTIVE_TESTS.forEach(test => {
    const result = getABTestResult(test.id);
    if (result) {
      results[test.id] = result;
    }
  });

  return results;
};

// Track A/B test conversion event
export const trackABTestConversion = (
  testId: string,
  conversionType: string,
  value?: number,
  additionalData?: Record<string, unknown>
) => {
  const result = getABTestResult(testId);
  if (!result) return;

  trackEvent('ab_test_conversion', 'experiment', `${testId}_${result.variantId}_${conversionType}`, value, {
    test_id: testId,
    variant_id: result.variantId,
    conversion_type: conversionType,
    ...additionalData,
  });
};

interface UseABTestReturn {
  variant: string | null;
  config: Record<string, unknown>;
  isInTest: boolean;
  trackConversion: (conversionType: string, value?: number, additionalData?: Record<string, unknown>) => void;
}

// Type guard for test ID validation
function isValidTestId(testId: unknown): testId is string {
  return typeof testId === 'string' && testId.trim().length > 0;
}

// Hook for React components to use A/B tests
export const useABTest = (testId: string): UseABTestReturn => {
  // Validate test ID parameter
  if (!isValidTestId(testId)) {
    logger.warn(`Invalid test ID provided to useABTest: ${testId}`);
    return { 
      variant: null, 
      config: {}, 
      isInTest: false,
      trackConversion: () => {} 
    };
  }

  if (typeof window === 'undefined') {
    return { 
      variant: null, 
      config: {}, 
      isInTest: false,
      trackConversion: () => {} 
    };
  }

  const result = getABTestResult(testId);
  
  return {
    variant: result?.variantId || null,
    config: result?.config || {},
    isInTest: !!result,
    trackConversion: (conversionType: string, value?: number, additionalData?: Record<string, unknown>): void => {
      // Validate conversion parameters
      if (!isValidTestId(conversionType)) {
        logger.warn(`Invalid conversion type provided: ${conversionType}`);
        return;
      }
      
      if (value !== undefined && (typeof value !== 'number' || isNaN(value))) {
        logger.warn(`Invalid conversion value provided: ${value}`);
        return;
      }
      
      trackABTestConversion(testId, conversionType, value, additionalData);
    },
  };
};

// Initialize A/B testing (call on app start)
export const initABTesting = () => {
  if (typeof window === 'undefined') return;

  // Pre-assign user to all active tests to avoid layout shifts
  ACTIVE_TESTS.forEach(test => {
    if (test.active) {
      getABTestResult(test.id);
    }
  });

  // Track that A/B testing is initialized
  trackEvent('ab_testing_initialized', 'system', 'user_assigned');
};

// Admin function to get test statistics (for dashboard)
export const getABTestStats = () => {
  return ACTIVE_TESTS.map(test => ({
    id: test.id,
    name: test.name,
    active: test.active,
    traffic: test.traffic,
    variants: test.variants.map(v => ({
      id: v.id,
      name: v.name,
      weight: v.weight,
    })),
    startDate: test.startDate,
    endDate: test.endDate,
  }));
};