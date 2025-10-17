/**
 * CORIA Paywall Utilities
 *
 * Central module for paywall trigger management, routing, and analytics.
 * Provides consistent upgrade flow handling across the application.
 *
 * @module paywall
 */

import { PAYWALL_TRIGGERS } from '@/data/pricing';

/**
 * Paywall trigger types matching pricing model
 */
export type PaywallTrigger = keyof typeof PAYWALL_TRIGGERS;

/**
 * Paywall trigger event data for analytics
 */
export interface PaywallEvent {
  trigger: PaywallTrigger;
  source: string; // component/screen name
  timestamp: number;
  userAction?: 'click' | 'dismiss' | 'view';
  metadata?: Record<string, any>;
}

/**
 * Upgrade routing configuration
 */
export interface UpgradeRoute {
  path: string;
  utm: {
    source: string;
    medium: string;
    campaign: string;
    content?: string;
  };
}

/**
 * Feature gating check result
 */
export interface GatingResult {
  allowed: boolean;
  trigger?: PaywallTrigger;
  reason?: string;
}

/**
 * User plan status (would be fetched from auth/subscription service)
 */
export interface UserPlan {
  type: 'free' | 'premium' | 'trial';
  isActive: boolean;
  trialEndsAt?: Date;
}

/**
 * Feature usage limits for free plan
 */
const FEATURE_LIMITS = {
  aiMessages: {
    dailyLimit: 10,
    trigger: 'aiLimit' as PaywallTrigger,
  },
  pantryItems: {
    maxItems: 20,
    trigger: 'pantryLimit' as PaywallTrigger,
  },
  scanHistory: {
    retentionDays: 30,
    trigger: null,
  },
} as const;

/**
 * Premium-only features
 */
const PREMIUM_FEATURES: Record<string, PaywallTrigger> = {
  alternatives: 'alternatives',
  recipes: 'recipes',
  mealPlanner: 'mealPlanner',
} as const;

/**
 * Generate upgrade URL with UTM parameters
 *
 * @param trigger - Paywall trigger type
 * @param locale - User locale (e.g., 'en', 'tr', 'de', 'fr')
 * @param additionalParams - Optional additional query parameters
 * @returns Full URL to pricing page with tracking parameters
 *
 * @example
 * ```ts
 * const url = getUpgradeUrl('aiLimit', 'en');
 * // Returns: /en/pricing?utm_source=paywall&utm_medium=upgrade&utm_campaign=ai-limit&src=aiLimit
 * ```
 */
export function getUpgradeUrl(
  trigger: PaywallTrigger,
  locale: string = 'tr',
  additionalParams?: Record<string, string>
): string {
  const baseUrl = `/${locale}/pricing`;

  const params = new URLSearchParams({
    utm_source: 'paywall',
    utm_medium: 'upgrade',
    utm_campaign: trigger,
    src: trigger,
    ...additionalParams,
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Navigate to upgrade page with proper tracking
 *
 * @param trigger - Paywall trigger type
 * @param locale - User locale
 * @param router - Next.js router instance (optional, uses window.location if not provided)
 *
 * @example
 * ```ts
 * // With Next.js router
 * const router = useRouter();
 * navigateToUpgrade('alternatives', 'en', router);
 *
 * // Without router (fallback to window.location)
 * navigateToUpgrade('alternatives', 'en');
 * ```
 */
export function navigateToUpgrade(
  trigger: PaywallTrigger,
  locale: string = 'tr',
  router?: { push: (url: string) => void }
): void {
  const url = getUpgradeUrl(trigger, locale);

  // Track navigation event
  trackPaywallEvent({
    trigger,
    source: 'upgrade-navigation',
    timestamp: Date.now(),
    userAction: 'click',
    metadata: { url, locale },
  });

  // Navigate using router or fallback to window.location
  if (router) {
    router.push(url);
  } else if (typeof window !== 'undefined') {
    window.location.href = url;
  }
}

/**
 * Check if feature is gated behind paywall
 *
 * @param feature - Feature identifier
 * @param userPlan - Current user plan status
 * @param usageData - Optional usage data for limit checks
 * @returns Gating result with allowed status and trigger info
 *
 * @example
 * ```ts
 * const user = { type: 'free', isActive: true };
 * const result = checkFeatureGate('alternatives', user);
 *
 * if (!result.allowed) {
 *   showPaywallModal(result.trigger);
 * }
 * ```
 */
export function checkFeatureGate(
  feature: string,
  userPlan: UserPlan,
  usageData?: {
    aiMessagesToday?: number;
    pantryItemCount?: number;
  }
): GatingResult {
  // Premium and trial users have full access
  if (userPlan.type === 'premium' || (userPlan.type === 'trial' && userPlan.isActive)) {
    return { allowed: true };
  }

  // Check premium-only features
  if (feature in PREMIUM_FEATURES) {
    return {
      allowed: false,
      trigger: PREMIUM_FEATURES[feature],
      reason: `Feature '${feature}' requires Premium subscription`,
    };
  }

  // Check usage limits
  if (feature === 'aiChat' && usageData?.aiMessagesToday !== undefined) {
    const limit = FEATURE_LIMITS.aiMessages.dailyLimit;
    if (usageData.aiMessagesToday >= limit) {
      return {
        allowed: false,
        trigger: FEATURE_LIMITS.aiMessages.trigger,
        reason: `Daily AI message limit (${limit}) reached`,
      };
    }
  }

  if (feature === 'pantry' && usageData?.pantryItemCount !== undefined) {
    const limit = FEATURE_LIMITS.pantryItems.maxItems;
    if (usageData.pantryItemCount >= limit) {
      return {
        allowed: false,
        trigger: FEATURE_LIMITS.pantryItems.trigger,
        reason: `Pantry item limit (${limit}) reached`,
      };
    }
  }

  return { allowed: true };
}

/**
 * Track paywall analytics event
 *
 * Sends event to analytics service (e.g., Google Analytics, Mixpanel)
 * and internal monitoring system.
 *
 * @param event - Paywall event data
 *
 * @example
 * ```ts
 * trackPaywallEvent({
 *   trigger: 'aiLimit',
 *   source: 'chat-screen',
 *   timestamp: Date.now(),
 *   userAction: 'view',
 *   metadata: { messagesUsed: 10 }
 * });
 * ```
 */
export function trackPaywallEvent(event: PaywallEvent): void {
  // Send to analytics service
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', 'paywall_trigger', {
        trigger_type: event.trigger,
        source_component: event.source,
        user_action: event.userAction || 'view',
        timestamp: event.timestamp,
        ...event.metadata,
      });
    }

    // Custom analytics endpoint (optional)
    try {
      fetch('/api/analytics/paywall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      }).catch((error) => {
        console.warn('Failed to send paywall analytics:', error);
      });
    } catch (error) {
      console.warn('Analytics endpoint not available:', error);
    }
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Paywall Event]', event);
  }
}

/**
 * Get paywall trigger label for display
 *
 * @param trigger - Paywall trigger type
 * @param locale - User locale
 * @returns Human-readable label
 */
export function getPaywallTriggerLabel(trigger: PaywallTrigger, locale: string = 'en'): string {
  const labels: Record<PaywallTrigger, Record<string, string>> = {
    alternatives: {
      en: 'Product Alternatives',
      tr: 'Ürün Alternatifleri',
      de: 'Produktalternativen',
      fr: 'Alternatives de produits',
    },
    recipes: {
      en: 'Recipes',
      tr: 'Tarifler',
      de: 'Rezepte',
      fr: 'Recettes',
    },
    aiLimit: {
      en: 'AI Chat Limit',
      tr: 'AI Sohbet Limiti',
      de: 'AI-Chat-Limit',
      fr: 'Limite de chat AI',
    },
    pantryLimit: {
      en: 'Pantry Limit',
      tr: 'Kiler Limiti',
      de: 'Speisekammer-Limit',
      fr: 'Limite du garde-manger',
    },
    mealPlanner: {
      en: 'Meal Planner',
      tr: 'Yemek Planlayıcı',
      de: 'Essensplaner',
      fr: 'Planificateur de repas',
    },
  };

  return labels[trigger][locale] || labels[trigger]['en'];
}

/**
 * Feature usage tracker for free plan limits
 */
export class FeatureUsageTracker {
  private storageKey = 'coria_feature_usage';

  /**
   * Get current AI message count for today
   */
  getAiMessageCount(): number {
    if (typeof window === 'undefined') return 0;

    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return 0;

    try {
      const data = JSON.parse(stored);
      const today = new Date().toISOString().split('T')[0];

      if (data.aiMessages?.date === today) {
        return data.aiMessages.count || 0;
      }
    } catch {
      // Invalid data
    }

    return 0;
  }

  /**
   * Increment AI message count
   */
  incrementAiMessages(): number {
    if (typeof window === 'undefined') return 0;

    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(this.storageKey);
    let data: any = {};

    try {
      data = stored ? JSON.parse(stored) : {};
    } catch {
      data = {};
    }

    if (data.aiMessages?.date !== today) {
      data.aiMessages = { date: today, count: 1 };
    } else {
      data.aiMessages.count = (data.aiMessages.count || 0) + 1;
    }

    localStorage.setItem(this.storageKey, JSON.stringify(data));
    return data.aiMessages.count;
  }

  /**
   * Get current pantry item count
   */
  getPantryCount(): number {
    if (typeof window === 'undefined') return 0;

    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return 0;

    try {
      const data = JSON.parse(stored);
      return data.pantryCount || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Update pantry item count
   */
  updatePantryCount(count: number): void {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(this.storageKey);
    let data: any = {};

    try {
      data = stored ? JSON.parse(stored) : {};
    } catch {
      data = {};
    }

    data.pantryCount = Math.max(0, count);
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Reset all usage data (for testing)
   */
  reset(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * Singleton usage tracker instance
 */
export const usageTracker = new FeatureUsageTracker();

// Type augmentation for window.gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, any>
    ) => void;
  }
}
