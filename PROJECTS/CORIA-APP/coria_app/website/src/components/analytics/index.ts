// Analytics Components
export { AnalyticsProvider } from './analytics-provider';
export { ConsentBanner } from './consent-banner';

// Dashboard Components
export { AnalyticsDashboard } from './dashboard/analytics-dashboard';
export { OverviewMetricsDashboard } from './dashboard/overview-metrics';
export { ConversionFunnelDashboard } from './dashboard/conversion-funnel';
export { ContentPerformanceDashboard } from './dashboard/content-performance';
export { ABTestResultsDashboard } from './dashboard/ab-test-results';

// Analytics Utilities
export * from '../../lib/analytics/gtag';
export * from '../../lib/analytics/consent';
export * from '../../lib/analytics/web-vitals';
export * from '../../lib/analytics/ab-testing';
export * from '../../lib/analytics/dashboard-data';