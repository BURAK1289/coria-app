/**
 * Dashboard data aggregation and analytics utilities
 * Provides data for admin dashboard components
 */

import { trackEvent } from './gtag';

export interface DashboardMetrics {
  overview: OverviewMetrics;
  traffic: TrafficMetrics;
  conversions: ConversionMetrics;
  content: ContentMetrics;
  performance: PerformanceMetrics;
  abTests: ABTestMetrics;
}

export interface OverviewMetrics {
  totalVisitors: number;
  totalPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
  conversionRate: number;
  topPages: PageMetric[];
  topCountries: CountryMetric[];
  deviceBreakdown: DeviceMetric[];
}

export interface TrafficMetrics {
  sources: TrafficSource[];
  channels: TrafficChannel[];
  campaigns: CampaignMetric[];
  referrers: ReferrerMetric[];
  searchTerms: SearchTermMetric[];
}

export interface ConversionMetrics {
  funnelSteps: FunnelStep[];
  downloadClicks: DownloadMetric[];
  formSubmissions: FormMetric[];
  engagementEvents: EngagementMetric[];
  goalCompletions: GoalMetric[];
}

export interface ContentMetrics {
  blogPosts: BlogPostMetric[];
  featurePages: FeaturePageMetric[];
  languagePerformance: LanguageMetric[];
  contentEngagement: ContentEngagementMetric[];
}

export interface PerformanceMetrics {
  coreWebVitals: CoreWebVitalsMetric[];
  pageLoadTimes: PageLoadMetric[];
  errorRates: ErrorMetric[];
  resourcePerformance: ResourceMetric[];
}

export interface ABTestMetrics {
  activeTests: ActiveTestMetric[];
  testResults: TestResultMetric[];
  conversionImpact: ConversionImpactMetric[];
}

// Individual metric interfaces
export interface PageMetric {
  path: string;
  title: string;
  views: number;
  uniqueViews: number;
  averageTime: number;
  bounceRate: number;
}

export interface CountryMetric {
  country: string;
  countryCode: string;
  visitors: number;
  percentage: number;
}

export interface DeviceMetric {
  category: 'desktop' | 'mobile' | 'tablet';
  visitors: number;
  percentage: number;
  averageSessionDuration: number;
}

export interface TrafficSource {
  source: string;
  medium: string;
  visitors: number;
  sessions: number;
  conversionRate: number;
}

export interface TrafficChannel {
  channel: 'organic' | 'direct' | 'social' | 'referral' | 'email' | 'paid';
  visitors: number;
  percentage: number;
  conversionRate: number;
}

export interface CampaignMetric {
  campaign: string;
  source: string;
  medium: string;
  clicks: number;
  conversions: number;
  cost?: number;
  roas?: number;
}

export interface ReferrerMetric {
  domain: string;
  visitors: number;
  conversionRate: number;
}

export interface SearchTermMetric {
  term: string;
  impressions: number;
  clicks: number;
  position: number;
  ctr: number;
}

export interface FunnelStep {
  step: string;
  visitors: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface DownloadMetric {
  platform: 'ios' | 'android';
  clicks: number;
  conversionRate: number;
  source: string;
}

export interface FormMetric {
  formType: string;
  submissions: number;
  completionRate: number;
  averageTime: number;
}

export interface EngagementMetric {
  event: string;
  count: number;
  uniqueUsers: number;
  averageValue?: number;
}

export interface GoalMetric {
  goal: string;
  completions: number;
  conversionRate: number;
  value?: number;
}

export interface BlogPostMetric {
  slug: string;
  title: string;
  views: number;
  readTime: number;
  engagementRate: number;
  socialShares: number;
}

export interface FeaturePageMetric {
  feature: string;
  views: number;
  timeOnPage: number;
  conversionRate: number;
  exitRate: number;
}

export interface LanguageMetric {
  language: string;
  visitors: number;
  conversionRate: number;
  averageSessionDuration: number;
}

export interface ContentEngagementMetric {
  contentType: string;
  interactions: number;
  shareRate: number;
  commentRate: number;
}

export interface CoreWebVitalsMetric {
  metric: 'LCP' | 'FID' | 'CLS' | 'FCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  percentile: number;
}

export interface PageLoadMetric {
  page: string;
  averageLoadTime: number;
  p75LoadTime: number;
  p95LoadTime: number;
}

export interface ErrorMetric {
  errorType: string;
  count: number;
  affectedUsers: number;
  errorRate: number;
}

export interface ResourceMetric {
  resourceType: string;
  averageLoadTime: number;
  totalSize: number;
  compressionRatio: number;
}

export interface ActiveTestMetric {
  testId: string;
  testName: string;
  status: 'running' | 'paused' | 'completed';
  participants: number;
  conversionRate: number;
  confidence: number;
}

export interface TestResultMetric {
  testId: string;
  variantId: string;
  variantName: string;
  participants: number;
  conversions: number;
  conversionRate: number;
  improvement: number;
  significance: number;
}

export interface ConversionImpactMetric {
  testId: string;
  estimatedImpact: number;
  revenueImpact?: number;
  userImpact: number;
}

// Mock data generator for development/demo purposes
export const generateMockDashboardData = (): DashboardMetrics => {
  return {
    overview: {
      totalVisitors: 12543,
      totalPageViews: 45678,
      averageSessionDuration: 245, // seconds
      bounceRate: 0.34,
      conversionRate: 0.078,
      topPages: [
        { path: '/', title: 'Homepage', views: 15234, uniqueViews: 12543, averageTime: 180, bounceRate: 0.32 },
        { path: '/features', title: 'Features', views: 8765, uniqueViews: 7234, averageTime: 320, bounceRate: 0.28 },
        { path: '/pricing', title: 'Pricing', views: 5432, uniqueViews: 4567, averageTime: 280, bounceRate: 0.25 },
      ],
      topCountries: [
        { country: 'Turkey', countryCode: 'TR', visitors: 8765, percentage: 0.70 },
        { country: 'Germany', countryCode: 'DE', visitors: 1876, percentage: 0.15 },
        { country: 'United States', countryCode: 'US', visitors: 1254, percentage: 0.10 },
      ],
      deviceBreakdown: [
        { category: 'mobile', visitors: 7526, percentage: 0.60, averageSessionDuration: 195 },
        { category: 'desktop', visitors: 3761, percentage: 0.30, averageSessionDuration: 340 },
        { category: 'tablet', visitors: 1256, percentage: 0.10, averageSessionDuration: 220 },
      ],
    },
    traffic: {
      sources: [
        { source: 'google', medium: 'organic', visitors: 6271, sessions: 8765, conversionRate: 0.085 },
        { source: 'direct', medium: '(none)', visitors: 3761, sessions: 4532, conversionRate: 0.092 },
        { source: 'facebook', medium: 'social', visitors: 1505, sessions: 2134, conversionRate: 0.065 },
      ],
      channels: [
        { channel: 'organic', visitors: 6271, percentage: 0.50, conversionRate: 0.085 },
        { channel: 'direct', visitors: 3761, percentage: 0.30, conversionRate: 0.092 },
        { channel: 'social', visitors: 1505, percentage: 0.12, conversionRate: 0.065 },
        { channel: 'referral', visitors: 753, percentage: 0.06, conversionRate: 0.078 },
        { channel: 'email', visitors: 251, percentage: 0.02, conversionRate: 0.125 },
      ],
      campaigns: [
        { campaign: 'sustainability_awareness', source: 'google', medium: 'cpc', clicks: 1234, conversions: 98, cost: 2500, roas: 4.2 },
        { campaign: 'app_launch', source: 'facebook', medium: 'social', clicks: 876, conversions: 67, cost: 1800, roas: 3.8 },
      ],
      referrers: [
        { domain: 'reddit.com', visitors: 432, conversionRate: 0.089 },
        { domain: 'twitter.com', visitors: 321, conversionRate: 0.076 },
      ],
      searchTerms: [
        { term: 'sustainable living app', impressions: 12000, clicks: 840, position: 3.2, ctr: 0.07 },
        { term: 'barcode scanner sustainability', impressions: 8500, clicks: 595, position: 4.1, ctr: 0.07 },
      ],
    },
    conversions: {
      funnelSteps: [
        { step: 'Landing Page View', visitors: 12543, conversionRate: 1.0, dropoffRate: 0.0 },
        { step: 'Feature Page View', visitors: 8765, conversionRate: 0.70, dropoffRate: 0.30 },
        { step: 'Pricing Page View', visitors: 5432, conversionRate: 0.62, dropoffRate: 0.38 },
        { step: 'Download Click', visitors: 1876, conversionRate: 0.35, dropoffRate: 0.65 },
        { step: 'App Store Visit', visitors: 1254, conversionRate: 0.67, dropoffRate: 0.33 },
      ],
      downloadClicks: [
        { platform: 'ios', clicks: 654, conversionRate: 0.72, source: 'homepage' },
        { platform: 'android', clicks: 876, conversionRate: 0.68, source: 'homepage' },
      ],
      formSubmissions: [
        { formType: 'contact', submissions: 123, completionRate: 0.78, averageTime: 180 },
        { formType: 'newsletter', submissions: 456, completionRate: 0.92, averageTime: 45 },
      ],
      engagementEvents: [
        { event: 'demo_video_play', count: 2345, uniqueUsers: 1876 },
        { event: 'feature_card_click', count: 4567, uniqueUsers: 3210 },
        { event: 'faq_expand', count: 1234, uniqueUsers: 987 },
      ],
      goalCompletions: [
        { goal: 'app_download_intent', completions: 1530, conversionRate: 0.122 },
        { goal: 'newsletter_signup', completions: 456, conversionRate: 0.036 },
      ],
    },
    content: {
      blogPosts: [
        { slug: 'sustainable-living-guide', title: 'Complete Guide to Sustainable Living', views: 2345, readTime: 420, engagementRate: 0.68, socialShares: 234 },
        { slug: 'carbon-footprint-reduction', title: 'How to Reduce Your Carbon Footprint', views: 1876, readTime: 380, engagementRate: 0.72, socialShares: 189 },
      ],
      featurePages: [
        { feature: 'barcode-scanning', views: 3456, timeOnPage: 240, conversionRate: 0.089, exitRate: 0.45 },
        { feature: 'sustainability-scoring', views: 2876, timeOnPage: 280, conversionRate: 0.095, exitRate: 0.42 },
      ],
      languagePerformance: [
        { language: 'tr', visitors: 8765, conversionRate: 0.085, averageSessionDuration: 260 },
        { language: 'en', visitors: 2345, conversionRate: 0.078, averageSessionDuration: 240 },
        { language: 'de', visitors: 1234, conversionRate: 0.072, averageSessionDuration: 220 },
      ],
      contentEngagement: [
        { contentType: 'feature_explanation', interactions: 4567, shareRate: 0.12, commentRate: 0.08 },
        { contentType: 'methodology', interactions: 2345, shareRate: 0.15, commentRate: 0.11 },
      ],
    },
    performance: {
      coreWebVitals: [
        { metric: 'LCP', value: 2.1, rating: 'good', percentile: 75 },
        { metric: 'FID', value: 85, rating: 'good', percentile: 80 },
        { metric: 'CLS', value: 0.08, rating: 'good', percentile: 85 },
        { metric: 'FCP', value: 1.6, rating: 'good', percentile: 78 },
        { metric: 'TTFB', value: 650, rating: 'good', percentile: 72 },
      ],
      pageLoadTimes: [
        { page: '/', averageLoadTime: 1.8, p75LoadTime: 2.1, p95LoadTime: 3.2 },
        { page: '/features', averageLoadTime: 2.1, p75LoadTime: 2.5, p95LoadTime: 3.8 },
      ],
      errorRates: [
        { errorType: 'javascript_error', count: 23, affectedUsers: 18, errorRate: 0.0014 },
        { errorType: 'network_error', count: 12, affectedUsers: 11, errorRate: 0.0009 },
      ],
      resourcePerformance: [
        { resourceType: 'javascript', averageLoadTime: 450, totalSize: 245000, compressionRatio: 0.68 },
        { resourceType: 'image', averageLoadTime: 320, totalSize: 1200000, compressionRatio: 0.85 },
      ],
    },
    abTests: {
      activeTests: [
        { testId: 'hero_cta_text', testName: 'Hero CTA Button Text', status: 'running', participants: 1234, conversionRate: 0.089, confidence: 0.78 },
        { testId: 'pricing_display', testName: 'Pricing Display Format', status: 'running', participants: 876, conversionRate: 0.095, confidence: 0.65 },
      ],
      testResults: [
        { testId: 'hero_cta_text', variantId: 'control', variantName: 'Download Now', participants: 617, conversions: 52, conversionRate: 0.084, improvement: 0, significance: 0 },
        { testId: 'hero_cta_text', variantId: 'variant_a', variantName: 'Get Started Free', participants: 617, conversions: 58, conversionRate: 0.094, improvement: 0.12, significance: 0.78 },
      ],
      conversionImpact: [
        { testId: 'hero_cta_text', estimatedImpact: 0.12, userImpact: 1500 },
        { testId: 'pricing_display', estimatedImpact: 0.08, userImpact: 950 },
      ],
    },
  };
};

// Track dashboard view
export const trackDashboardView = (section: string) => {
  trackEvent('dashboard_view', 'admin', section);
};

// Track dashboard interaction
export const trackDashboardInteraction = (action: string, section: string, details?: string) => {
  trackEvent('dashboard_interaction', 'admin', `${section}_${action}`, undefined, {
    section,
    action,
    details,
  });
};