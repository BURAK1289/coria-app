/**
 * Google Analytics 4 configuration and utilities
 * Implements privacy-compliant tracking with consent management
 */

import type { GtagConfig, GtagEventParams } from '@/types/analytics';

// GA4 Measurement ID - should be set via environment variable
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

// Check if GA is enabled (only in production with valid measurement ID)
export const isGAEnabled = () => {
  return process.env.NODE_ENV === 'production' && GA_MEASUREMENT_ID;
};

// Initialize Google Analytics
export const initGA = () => {
  if (!isGAEnabled() || typeof window === 'undefined' || !window.gtag) return;

  // Configure GA with privacy settings
  const config: GtagConfig = {
    // Privacy-compliant settings
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_flags: 'SameSite=Strict;Secure',
    cookie_expires: 60 * 60 * 24 * 30, // 30 days
    // Performance settings
    send_page_view: false, // We'll send manually
  };

  window.gtag('config', GA_MEASUREMENT_ID, config);
};

// Page view tracking
export const trackPageView = (url: string, title?: string) => {
  if (!isGAEnabled() || typeof window === 'undefined' || !window.gtag) return;

  const params: GtagEventParams = {
    page_title: title,
    page_location: url,
  };

  window.gtag('event', 'page_view', params);
};

// Custom event tracking for conversion funnel
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number,
  customParameters?: Record<string, unknown>
) => {
  if (!isGAEnabled() || typeof window === 'undefined' || !window.gtag) return;

  const params: GtagEventParams = {
    event_category: category,
    event_label: label,
    value: value,
    ...customParameters,
  };

  window.gtag('event', action, params);
};

// Conversion funnel events
export const ConversionEvents = {
  // Homepage interactions
  HERO_CTA_CLICK: 'hero_cta_click',
  DOWNLOAD_BUTTON_CLICK: 'download_button_click',
  DEMO_VIDEO_PLAY: 'demo_video_play',
  
  // Feature exploration
  FEATURE_CARD_CLICK: 'feature_card_click',
  FEATURE_DETAIL_VIEW: 'feature_detail_view',
  METHODOLOGY_VIEW: 'methodology_view',
  
  // Pricing and conversion
  PRICING_PAGE_VIEW: 'pricing_page_view',
  PRICING_PLAN_COMPARE: 'pricing_plan_compare',
  PREMIUM_INTEREST: 'premium_interest',
  
  // Content engagement
  BLOG_POST_READ: 'blog_post_read',
  FAQ_EXPAND: 'faq_expand',
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  
  // Language and localization
  LANGUAGE_SWITCH: 'language_switch',
  
  // App store redirects
  IOS_STORE_REDIRECT: 'ios_store_redirect',
  ANDROID_STORE_REDIRECT: 'android_store_redirect',
} as const;

// Track conversion funnel steps
export const trackConversionStep = (
  step: string,
  additionalData?: Record<string, unknown>
) => {
  trackEvent('conversion_step', 'funnel', step, undefined, additionalData);
};

// Track user engagement
export const trackEngagement = (
  type: 'scroll_depth' | 'time_on_page' | 'click_depth',
  value: number,
  additionalData?: Record<string, unknown>
) => {
  trackEvent('engagement', type, undefined, value, additionalData);
};

// Track performance metrics
export const trackPerformance = (
  metric: string,
  value: number,
  additionalData?: Record<string, unknown>
) => {
  trackEvent('performance', 'web_vitals', metric, value, additionalData);
};

// Enhanced ecommerce tracking for subscription interest
export const trackSubscriptionInterest = (
  plan: 'free' | 'premium',
  action: 'view' | 'compare' | 'interest',
  additionalData?: Record<string, unknown>
) => {
  trackEvent('subscription_interest', 'pricing', `${plan}_${action}`, undefined, {
    currency: 'TRY',
    value: plan === 'premium' ? 29.99 : 0,
    ...additionalData,
  });
};

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'consent' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}