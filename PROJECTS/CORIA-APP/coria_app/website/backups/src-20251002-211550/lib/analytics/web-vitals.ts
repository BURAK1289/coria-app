/**
 * Core Web Vitals monitoring and performance tracking
 * Integrates with Google Analytics for performance insights
 */

import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';
import { trackPerformance, isGAEnabled } from './gtag';
import type { 
  WebVitalsMetric, 
  CustomPerformanceMetric, 
  NavigationTimingMetrics,
  ResourceTimingMetric,
  PerformanceThresholds 
} from '@/types/analytics';

interface PerformanceMemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemoryStats;
}

const hasMemoryStats = (perf: Performance): perf is PerformanceWithMemory => {
  const memory = (perf as PerformanceWithMemory).memory;
  return (
    !!memory &&
    typeof memory.usedJSHeapSize === 'number' &&
    typeof memory.totalJSHeapSize === 'number' &&
    typeof memory.jsHeapSizeLimit === 'number'
  );
};

// Performance thresholds (Google's recommended values)
const PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  lcp: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  fid: { good: 100, poor: 300 },   // First Input Delay
  cls: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  fcp: { good: 1800, poor: 3000 }, // First Contentful Paint
  ttfb: { good: 800, poor: 1800 }, // Time to First Byte
};

// Performance rating based on thresholds
const getPerformanceRating = (metric: string, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const metricKey = metric.toLowerCase() as keyof PerformanceThresholds;
  const threshold = PERFORMANCE_THRESHOLDS[metricKey];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// Send metric to analytics
const sendToAnalytics = (metric: Metric) => {
  if (!isGAEnabled()) return;

  const rating = getPerformanceRating(metric.name, metric.value);
  
  // Send to Google Analytics
  trackPerformance(metric.name, metric.value, {
    metric_rating: rating,
    metric_delta: metric.delta,
    metric_id: metric.id,
    metric_navigation_type: metric.navigationType,
  });

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating,
      delta: metric.delta,
      id: metric.id,
    });
  }
};

// Initialize Core Web Vitals monitoring
export const initWebVitals = () => {
  // Only run in browser environment
  if (typeof window === 'undefined') return;

  try {
    // Core Web Vitals
    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onLCP(sendToAnalytics);
    
    // Additional metrics
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  } catch (error) {
    console.warn('Failed to initialize Web Vitals:', error);
  }
};

// Custom performance tracking
export const trackCustomPerformance = (name: string, value: number, additionalData?: Record<string, unknown>) => {
  trackPerformance(name, value, additionalData);
};

// Track page load performance
export const trackPageLoadPerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (!navigation || !navigation.navigationStart) return;

  // Calculate key timing metrics
  const metrics: NavigationTimingMetrics = {
    dns_lookup: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp_connection: navigation.connectEnd - navigation.connectStart,
    ssl_handshake: navigation.connectEnd - navigation.secureConnectionStart,
    server_response: navigation.responseStart - navigation.requestStart,
    dom_processing: navigation.domContentLoadedEventEnd - navigation.responseEnd,
    resource_loading: navigation.loadEventStart - navigation.domContentLoadedEventEnd,
    total_load_time: navigation.loadEventEnd - navigation.navigationStart,
  };

  // Send each metric to analytics
  Object.entries(metrics).forEach(([name, value]) => {
    if (value > 0) {
      trackCustomPerformance(`page_load_${name}`, Math.round(value));
    }
  });
};

// Track resource loading performance
export const trackResourcePerformance = () => {
  if (typeof window === 'undefined' || !window.performance) return;

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  // Group resources by type
  const resourceTypes = resources.reduce((acc, resource) => {
    const type = getResourceType(resource.name);
    if (!acc[type]) acc[type] = [];
    acc[type].push(resource.duration);
    return acc;
  }, {} as Record<string, number[]>);

  // Calculate averages and send to analytics
  Object.entries(resourceTypes).forEach(([type, durations]) => {
    const average = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
    trackCustomPerformance(`resource_load_${type}`, Math.round(average), {
      resource_count: durations.length,
    });
  });
};

// Determine resource type from URL
const getResourceType = (url: string): string => {
  if (url.includes('.js')) return 'javascript';
  if (url.includes('.css')) return 'stylesheet';
  if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) return 'image';
  if (url.match(/\.(woff|woff2|ttf|otf)$/i)) return 'font';
  if (url.includes('api/') || url.includes('.json')) return 'api';
  return 'other';
};

// Performance observer for long tasks
export const initLongTaskObserver = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Tasks longer than 50ms
          trackCustomPerformance('long_task', entry.duration, {
            task_name: entry.name,
            start_time: entry.startTime,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    console.warn('Long task observer not supported:', error);
  }
};

// Memory usage tracking (if available)
export const trackMemoryUsage = () => {
  if (typeof window === 'undefined' || typeof window.performance === 'undefined') {
    return;
  }

  const perf = window.performance;

  if (!hasMemoryStats(perf) || !perf.memory) {
    return;
  }

  const { memory } = perf;

  trackCustomPerformance('memory_used', memory.usedJSHeapSize, {
    memory_total: memory.totalJSHeapSize,
    memory_limit: memory.jsHeapSizeLimit,
  });
};

// Initialize all performance monitoring
export const initPerformanceMonitoring = () => {
  initWebVitals();
  initLongTaskObserver();
  
  // Track page load performance after load event
  if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      setTimeout(() => {
        trackPageLoadPerformance();
        trackResourcePerformance();
        trackMemoryUsage();
      }, 1000); // Wait 1 second after load
    });
  }
};