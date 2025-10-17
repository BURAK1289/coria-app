import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';
import type { Metric } from 'web-vitals';
import * as Sentry from '@sentry/nextjs';
import { logger } from '@/lib/logger';

interface NavigatorConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NavigatorConnectionInfo;
}

const getConnectionInfo = (): NavigatorConnectionInfo | null => {
  if (typeof navigator === 'undefined') {
    return null;
  }
  const connection = (navigator as NavigatorWithConnection).connection;
  return typeof connection === 'object' && connection !== null ? connection : null;
};

const getResourceSource = (element: Element): string | undefined => {
  if ('src' in element && typeof (element as HTMLImageElement).src === 'string') {
    return (element as HTMLImageElement).src;
  }

  if ('href' in element && typeof (element as HTMLLinkElement).href === 'string') {
    return (element as HTMLLinkElement).href;
  }

  return element.baseURI;
};

// Performance thresholds based on Core Web Vitals
export const PERFORMANCE_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
};

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  connection?: string;
  deviceType?: string;
}

// Initialize performance monitoring
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Track Core Web Vitals
  onCLS(onPerfEntry);
  onFCP(onPerfEntry);
  onFID(onPerfEntry);
  onLCP(onPerfEntry);
  onTTFB(onPerfEntry);

  // Track custom metrics
  trackCustomMetrics();
}

function onPerfEntry(metric: Metric) {
  const performanceMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    timestamp: Date.now(),
    url: window.location.href,
    connection: getConnectionType(),
    deviceType: getDeviceType(),
  };

  // Send to analytics
  sendPerformanceMetric(performanceMetric);

  // Alert if performance is poor
  if (metric.rating === 'poor') {
    alertPoorPerformance(performanceMetric);
  }
}

function sendPerformanceMetric(metric: PerformanceMetric) {
  // Send to Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      custom_map: {
        metric_rating: metric.rating,
        metric_value: metric.value,
      },
    });
  }

  // Send to Sentry for performance monitoring
  Sentry.addBreadcrumb({
    category: 'performance',
    message: `${metric.name}: ${metric.value} (${metric.rating})`,
    level: metric.rating === 'poor' ? 'warning' : 'info',
    data: metric,
  });

  // Send to Vercel Analytics if available
  if (typeof window !== 'undefined' && typeof window.va === 'function') {
    window.va('track', {
      category: 'Web Vitals',
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
    });
  }
}

function alertPoorPerformance(metric: PerformanceMetric) {
  // Log poor performance
  logger.warn(`Poor performance detected: ${metric.name} = ${metric.value} (${metric.rating})`);

  // Send to Sentry as a performance issue
  Sentry.captureMessage(
    `Poor performance: ${metric.name} = ${metric.value}ms`,
    'warning'
  );

  // Track in analytics as a problem
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'poor_performance', {
      event_category: 'Performance Issues',
      event_label: metric.name,
      value: Math.round(metric.value),
    });
  }
}

function trackCustomMetrics() {
  // Track page load time
  window.addEventListener('load', () => {
    const loadTime = performance.now();
    sendPerformanceMetric({
      name: 'page_load_time',
      value: loadTime,
      rating: loadTime < 3000 ? 'good' : loadTime < 5000 ? 'needs-improvement' : 'poor',
      timestamp: Date.now(),
      url: window.location.href,
      connection: getConnectionType(),
      deviceType: getDeviceType(),
    });
  });

  // Track resource loading errors
  window.addEventListener('error', (event) => {
    if (event.target instanceof Element) {
      const source = getResourceSource(event.target);
      Sentry.captureMessage(
        `Resource loading error: ${event.target.tagName} - ${source ?? 'unknown'}`,
        'error'
      );
    }
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    Sentry.captureException(event.reason);
  });
}

function getConnectionType(): string {
  const connection = getConnectionInfo();
  return connection?.effectiveType ?? 'unknown';
}

function getDeviceType(): string {
  const userAgent = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

// Performance monitoring dashboard data
export async function getPerformanceMetrics(timeRange: '1h' | '24h' | '7d' | '30d' = '24h') {
  // This would typically fetch from your analytics service
  // For now, return mock data structure
  return {
    timeRange,
    metrics: {
      lcp: { average: 2100, p95: 3200, trend: 'improving' },
      fid: { average: 45, p95: 120, trend: 'stable' },
      cls: { average: 0.08, p95: 0.15, trend: 'improving' },
      fcp: { average: 1600, p95: 2400, trend: 'stable' },
      ttfb: { average: 650, p95: 1200, trend: 'improving' },
    },
    alerts: [
      {
        type: 'warning',
        metric: 'LCP',
        message: 'LCP increased by 15% in the last hour',
        timestamp: new Date().toISOString(),
      },
    ],
    recommendations: [
      'Consider optimizing images on the homepage',
      'Review third-party scripts impact on FID',
      'Implement resource hints for critical resources',
    ],
  };
}

// Performance optimization suggestions
export function getOptimizationSuggestions(metrics: PerformanceMetric[]): string[] {
  const suggestions: string[] = [];
  
  const lcpMetrics = metrics.filter(m => m.name === 'LCP');
  const fidMetrics = metrics.filter(m => m.name === 'FID');
  const clsMetrics = metrics.filter(m => m.name === 'CLS');
  
  // LCP suggestions
  if (lcpMetrics.some(m => m.rating === 'poor')) {
    suggestions.push('Optimize images and use next/image for better LCP');
    suggestions.push('Consider implementing resource hints (preload, prefetch)');
    suggestions.push('Review server response times and consider CDN optimization');
  }
  
  // FID suggestions
  if (fidMetrics.some(m => m.rating === 'poor')) {
    suggestions.push('Reduce JavaScript execution time');
    suggestions.push('Consider code splitting and lazy loading');
    suggestions.push('Review third-party scripts and their impact');
  }
  
  // CLS suggestions
  if (clsMetrics.some(m => m.rating === 'poor')) {
    suggestions.push('Add size attributes to images and videos');
    suggestions.push('Reserve space for dynamic content');
    suggestions.push('Avoid inserting content above existing content');
  }
  
  return suggestions;
}