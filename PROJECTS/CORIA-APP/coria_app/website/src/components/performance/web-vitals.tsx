'use client';

import { useEffect } from 'react';
import { onCLS, onFID, onFCP, onLCP, onTTFB, Metric } from 'web-vitals';

interface WebVitalsProps {
  debug?: boolean;
}

export function WebVitals({ debug = false }: WebVitalsProps) {
  useEffect(() => {
    const reportWebVitals = (metric: Metric) => {
      if (debug) {
        console.log('Web Vitals:', metric);
      }

      // Send to analytics service
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }

      // Send to custom analytics endpoint
      if (process.env.NODE_ENV === 'production') {
        fetch('/api/analytics/web-vitals', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: metric.name,
            value: metric.value,
            id: metric.id,
            url: window.location.href,
            timestamp: Date.now(),
          }),
        }).catch(error => {
          if (debug) {
            console.error('Failed to send web vitals:', error);
          }
        });
      }
    };

    // Measure Core Web Vitals
    onCLS(reportWebVitals);
    onFID(reportWebVitals);
    onFCP(reportWebVitals);
    onLCP(reportWebVitals);
    onTTFB(reportWebVitals);
  }, [debug]);

  return null;
}

// Performance observer for custom metrics
export function usePerformanceObserver(): void {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.PerformanceObserver) {
      return;
    }

    // Observe navigation timing
    const navObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          
          // Calculate custom metrics
          const metrics = {
            dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp: navEntry.connectEnd - navEntry.connectStart,
            ssl: navEntry.connectEnd - navEntry.secureConnectionStart,
            ttfb: navEntry.responseStart - navEntry.requestStart,
            download: navEntry.responseEnd - navEntry.responseStart,
            domParse: navEntry.domContentLoadedEventStart - navEntry.responseEnd,
            domReady: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
            loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
          };

          console.log('Navigation Metrics:', metrics);
        }
      });
    });

    navObserver.observe({ entryTypes: ['navigation'] });

    // Observe resource timing
    const resourceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Track slow resources
          if (resourceEntry.duration > 1000) {
            console.warn('Slow resource:', {
              name: resourceEntry.name,
              duration: resourceEntry.duration,
              size: resourceEntry.transferSize,
            });
          }
        }
      });
    });

    resourceObserver.observe({ entryTypes: ['resource'] });

    return () => {
      navObserver.disconnect();
      resourceObserver.disconnect();
    };
  }, []);
}

// Component to display performance metrics in development
export function PerformanceDebugger() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const logPerformanceMetrics = () => {
      if (typeof window === 'undefined' || !window.performance) {
        return;
      }

      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      console.group('🚀 Performance Metrics');
      console.log('Navigation Type:', navigation.type);
      if (navigation.navigationStart) {
        console.log('Page Load Time:', navigation.loadEventEnd - navigation.navigationStart, 'ms');
        console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.navigationStart, 'ms');
      }
      console.log('First Paint:', paint.find(p => p.name === 'first-paint')?.startTime, 'ms');
      console.log('First Contentful Paint:', paint.find(p => p.name === 'first-contentful-paint')?.startTime, 'ms');
      console.groupEnd();
    };

    // Log metrics after page load
    if (document.readyState === 'complete') {
      setTimeout(logPerformanceMetrics, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(logPerformanceMetrics, 1000);
      });
    }
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-2 rounded text-xs z-50">
      Performance Debug Mode
    </div>
  );
}