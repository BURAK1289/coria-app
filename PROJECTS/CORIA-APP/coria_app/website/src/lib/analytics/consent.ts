/**
 * Privacy-compliant consent management for analytics
 * Implements GDPR/KVKK compliance for Turkish and EU users
 */

export type ConsentStatus = 'granted' | 'denied' | 'pending';

export interface ConsentPreferences {
  analytics: ConsentStatus;
  marketing: ConsentStatus;
  functional: ConsentStatus;
  timestamp: number;
}

const CONSENT_STORAGE_KEY = 'coria_consent_preferences';
const CONSENT_VERSION = '1.0';

// Default consent state (denied until user grants)
const DEFAULT_CONSENT: ConsentPreferences = {
  analytics: 'denied',
  marketing: 'denied',
  functional: 'granted', // Essential cookies always granted
  timestamp: Date.now(),
};

// Get current consent preferences
export const getConsentPreferences = (): ConsentPreferences => {
  if (typeof window === 'undefined') return DEFAULT_CONSENT;

  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return DEFAULT_CONSENT;

    const parsed = JSON.parse(stored);
    
    // Check if consent is still valid (30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    if (parsed.timestamp < thirtyDaysAgo) {
      return DEFAULT_CONSENT;
    }

    return { ...DEFAULT_CONSENT, ...parsed };
  } catch {
    return DEFAULT_CONSENT;
  }
};

// Save consent preferences
export const saveConsentPreferences = (preferences: Partial<ConsentPreferences>) => {
  if (typeof window === 'undefined') return;

  const current = getConsentPreferences();
  const updated: ConsentPreferences = {
    ...current,
    ...preferences,
    timestamp: Date.now(),
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updated));
    
    // Update Google Analytics consent
    updateGoogleConsent(updated);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new CustomEvent('consentUpdated', { 
      detail: updated 
    }));
  } catch (error) {
    console.warn('Failed to save consent preferences:', error);
  }
};

// Update Google Analytics consent mode
const updateGoogleConsent = (preferences: ConsentPreferences) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('consent', 'update', {
    analytics_storage: preferences.analytics,
    ad_storage: preferences.marketing,
    functionality_storage: preferences.functional,
    personalization_storage: preferences.marketing,
    security_storage: 'granted', // Always granted for security
  });
};

// Initialize consent mode (call before GA loads)
export const initializeConsent = () => {
  if (typeof window === 'undefined') return;

  const preferences = getConsentPreferences();

  // Set initial consent state
  if (window.gtag) {
    window.gtag('consent', 'default', {
      analytics_storage: preferences.analytics,
      ad_storage: preferences.marketing,
      functionality_storage: preferences.functional,
      personalization_storage: preferences.marketing,
      security_storage: 'granted',
      wait_for_update: 500, // Wait 500ms for user interaction
    });
  }
};

// Check if analytics consent is granted
export const hasAnalyticsConsent = (): boolean => {
  const preferences = getConsentPreferences();
  return preferences.analytics === 'granted';
};

// Check if user needs to see consent banner
export const needsConsentBanner = (): boolean => {
  const preferences = getConsentPreferences();
  return preferences.analytics === 'denied' && preferences.timestamp === DEFAULT_CONSENT.timestamp;
};

// Grant all consent (for accept all button)
export const grantAllConsent = () => {
  saveConsentPreferences({
    analytics: 'granted',
    marketing: 'granted',
    functional: 'granted',
  });
};

// Deny optional consent (for reject button)
export const denyOptionalConsent = () => {
  saveConsentPreferences({
    analytics: 'denied',
    marketing: 'denied',
    functional: 'granted',
  });
};

// Withdraw consent (for settings)
export const withdrawConsent = () => {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(CONSENT_STORAGE_KEY);
  
  // Reset to default state
  const defaultState = DEFAULT_CONSENT;
  updateGoogleConsent(defaultState);
  
  window.dispatchEvent(new CustomEvent('consentUpdated', { 
    detail: defaultState 
  }));
};