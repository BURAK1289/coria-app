/**
 * Analytics and monitoring type definitions
 */

// Google Analytics types
export interface GtagConfig {
  anonymize_ip?: boolean;
  allow_google_signals?: boolean;
  allow_ad_personalization_signals?: boolean;
  cookie_flags?: string;
  cookie_expires?: number;
  send_page_view?: boolean;
  custom_map?: Record<string, string>;
  [key: string]: unknown;
}

export interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  page_title?: string;
  page_location?: string;
  non_interaction?: boolean;
  custom_parameter_1?: string;
  custom_parameter_2?: string;
  [key: string]: unknown;
}

export interface GtagConsentParams {
  ad_storage?: 'granted' | 'denied';
  analytics_storage?: 'granted' | 'denied';
  ad_user_data?: 'granted' | 'denied';
  ad_personalization?: 'granted' | 'denied';
  functionality_storage?: 'granted' | 'denied';
  personalization_storage?: 'granted' | 'denied';
  security_storage?: 'granted' | 'denied';
  wait_for_update?: number;
}

// Web Vitals and Performance types
export interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  entries: PerformanceEntry[];
}

export interface CustomPerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'score' | 'count' | 'percentage';
  timestamp: number;
  url: string;
  userAgent?: string;
  connectionType?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
}

export interface NavigationTimingMetrics {
  dns_lookup: number;
  tcp_connection: number;
  ssl_handshake: number;
  server_response: number;
  dom_processing: number;
  resource_loading: number;
  total_load_time: number;
}

export interface ResourceTimingMetric {
  name: string;
  type: 'javascript' | 'stylesheet' | 'image' | 'font' | 'api' | 'other';
  duration: number;
  size?: number;
  transferSize?: number;
  encodedBodySize?: number;
  decodedBodySize?: number;
}

// A/B Testing types
export interface ABTestConfig {
  id: string;
  name: string;
  variants: ABTestVariant[];
  traffic: number; // 0-100
  active: boolean;
  startDate: Date;
  endDate?: Date;
  targetAudience?: ABTestAudience;
}

export interface ABTestVariant {
  id: string;
  name: string;
  weight: number; // 0-100
  config: Record<string, unknown>;
}

export interface ABTestAudience {
  locales?: string[];
  deviceTypes?: ('mobile' | 'tablet' | 'desktop')[];
  newUsers?: boolean;
  returningUsers?: boolean;
  customSegments?: string[];
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  config: Record<string, unknown>;
  assignedAt: Date;
}

export interface ABTestConversion {
  testId: string;
  variantId: string;
  conversionType: string;
  value?: number;
  timestamp: Date;
  additionalData?: Record<string, unknown>;
}

// Analytics Events
export interface BaseAnalyticsEvent {
  name: string;
  timestamp: number;
  userId?: string;
  sessionId: string;
  locale: string;
  userAgent: string;
  referrer?: string;
  page: string;
}

export interface ConversionEvent extends BaseAnalyticsEvent {
  conversionType: 'download' | 'signup' | 'contact' | 'subscription' | 'purchase';
  value?: number;
  currency?: string;
  funnel?: string;
  step?: number;
}

export interface EngagementEvent extends BaseAnalyticsEvent {
  engagementType: 'scroll_depth' | 'time_on_page' | 'click_depth' | 'video_play' | 'form_interaction';
  value: number;
  element?: string;
  section?: string;
}

export interface ErrorEvent extends BaseAnalyticsEvent {
  errorType: 'javascript' | 'network' | 'performance' | 'user_action';
  message: string;
  stack?: string;
  lineNumber?: number;
  columnNumber?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Consent Management
export type ConsentStatus = 'granted' | 'denied' | 'pending';

export interface ConsentPreferences {
  analytics: ConsentStatus;
  marketing: ConsentStatus;
  functional: ConsentStatus;
  necessary: ConsentStatus; // Always granted
}

export interface ConsentUpdateEvent {
  preferences: ConsentPreferences;
  timestamp: Date;
  source: 'banner' | 'settings' | 'api' | 'default';
  version: string;
}

// Performance Monitoring
export interface PerformanceThresholds {
  lcp: { good: number; poor: number };
  fid: { good: number; poor: number };
  cls: { good: number; poor: number };
  fcp: { good: number; poor: number };
  ttfb: { good: number; poor: number };
}

export interface PerformanceAlert {
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  timestamp: Date;
  url: string;
  userAgent: string;
}

export interface LongTaskEntry {
  name: string;
  duration: number;
  startTime: number;
  attribution?: {
    name: string;
    entryType: string;
    startTime: number;
    duration: number;
  }[];
}

// Analytics Configuration
export interface AnalyticsConfig {
  gaTrackingId?: string;
  enableWebVitals: boolean;
  enableABTesting: boolean;
  enableErrorTracking: boolean;
  enablePerformanceMonitoring: boolean;
  consentRequired: boolean;
  debugMode: boolean;
  sampleRate: number; // 0-100
}

// Dashboard and Reporting
export interface AnalyticsDashboardData {
  overview: {
    totalUsers: number;
    totalSessions: number;
    bounceRate: number;
    avgSessionDuration: number;
    conversionRate: number;
  };
  webVitals: {
    lcp: { value: number; rating: string };
    fid: { value: number; rating: string };
    cls: { value: number; rating: string };
  };
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
    avgTimeOnPage: number;
  }>;
  conversions: Array<{
    type: string;
    count: number;
    value: number;
    conversionRate: number;
  }>;
  abTests: Array<{
    testId: string;
    name: string;
    status: 'running' | 'completed' | 'paused';
    participants: number;
    conversionRate: number;
    significance: number;
  }>;
}

// Export utility types
export type AnalyticsEventType = 
  | 'page_view'
  | 'conversion'
  | 'engagement'
  | 'error'
  | 'performance'
  | 'ab_test'
  | 'consent';

export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export type ConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

// Type guards
export function isWebVitalsMetric(metric: unknown): metric is WebVitalsMetric {
  return (
    typeof metric === 'object' &&
    metric !== null &&
    'name' in metric &&
    'value' in metric &&
    'rating' in metric &&
    'id' in metric
  );
}

export function isConversionEvent(event: unknown): event is ConversionEvent {
  return (
    typeof event === 'object' &&
    event !== null &&
    'conversionType' in event &&
    'name' in event &&
    'timestamp' in event
  );
}

export function isABTestResult(result: unknown): result is ABTestResult {
  return (
    typeof result === 'object' &&
    result !== null &&
    'testId' in result &&
    'variantId' in result &&
    'config' in result
  );
}