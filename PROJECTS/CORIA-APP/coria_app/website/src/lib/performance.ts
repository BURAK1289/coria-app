/**
 * Performance optimization utilities
 */

import React from 'react';
import { logger } from './logger';

interface PerformanceMemoryStats {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface NavigatorConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NavigatorConnectionInfo;
}

const hasMemoryInfo = (perf: Performance): perf is Performance & { memory: PerformanceMemoryStats } => {
  const memory = (perf as Performance & { memory?: unknown }).memory;
  return (
    typeof memory === 'object' &&
    memory !== null &&
    typeof (memory as PerformanceMemoryStats).usedJSHeapSize === 'number' &&
    typeof (memory as PerformanceMemoryStats).totalJSHeapSize === 'number' &&
    typeof (memory as PerformanceMemoryStats).jsHeapSizeLimit === 'number'
  );
};

const getConnectionInfo = (nav: Navigator): NavigatorConnectionInfo | null => {
  const connection = (nav as NavigatorWithConnection).connection;
  if (typeof connection !== 'object' || connection === null) {
    return null;
  }
  return connection;
};

// Lazy loading utility for components
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
): React.FC<React.ComponentProps<T>> {
  const LazyComponent = React.lazy(importFn);
  
  return function LazyWrapper(props: React.ComponentProps<T>): React.ReactElement {
    return React.createElement(
      React.Suspense,
      { fallback: fallback ? React.createElement(fallback) : null },
      React.createElement(LazyComponent, props)
    );
  };
}

// Preload critical resources
export function preloadResource(href: string, as: string, type?: string): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  document.head.appendChild(link);
}

// Prefetch resources for next navigation
export function prefetchResource(href: string): void {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  
  document.head.appendChild(link);
}

// Critical CSS inlining utility
export function inlineCriticalCSS(css: string): void {
  if (typeof window === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  
  document.head.appendChild(style);
}

// Resource hints for external domains
export function addResourceHints(): void {
  if (typeof window === 'undefined') return;

  const hints: Array<{ rel: string; href: string; crossOrigin?: string }> = [
    { rel: 'dns-prefetch', href: 'https://fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: 'https://fonts.gstatic.com' },
    { rel: 'dns-prefetch', href: 'https://images.ctfassets.net' },
    { rel: 'dns-prefetch', href: 'https://www.google-analytics.com' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
  ];

  hints.forEach(({ rel, href, crossOrigin }) => {
    const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    if (crossOrigin) link.crossOrigin = crossOrigin;
    
    document.head.appendChild(link);
  });
}

// Image optimization utilities
export function generateImageSizes(breakpoints: number[] = [640, 768, 1024, 1280, 1536]): string {
  return breakpoints
    .map((bp, index) => {
      if (index === 0) return `(max-width: ${bp}px) 100vw`;
      if (index === breakpoints.length - 1) return `${bp}px`;
      return `(max-width: ${bp}px) ${Math.round((bp / breakpoints[0]) * 100)}vw`;
    })
    .join(', ');
}

export function generateBlurDataURL(width: number = 10, height: number = 10): string {
  if (typeof document === 'undefined') return '';
  
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Create a simple gradient blur placeholder
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

// Bundle splitting utilities
export function shouldSplitBundle(moduleName: string): boolean {
  const heavyModules = [
    'framer-motion',
    'react-spring',
    'three',
    'chart.js',
    'moment',
    'lodash',
  ];
  
  return heavyModules.some(heavy => moduleName.includes(heavy));
}

// Performance monitoring
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTiming(label: string): void {
    this.metrics.set(`${label}_start`, performance.now());
  }

  endTiming(label: string): number {
    const startTime = this.metrics.get(`${label}_start`);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.metrics.set(label, duration);

    if (process.env.NODE_ENV === 'development') {
      logger.debug(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  getMetric(label: string): number | undefined {
    return this.metrics.get(label);
  }

  getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  clearMetrics(): void {
    this.metrics.clear();
  }
}

// Memory usage monitoring
export function monitorMemoryUsage(): { used: number; total: number; limit: number } | null {
  if (typeof window === 'undefined' || !hasMemoryInfo(performance)) {
    return null;
  }

  const { memory } = performance;
  return {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
    limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
  };
}

// Network information
export function getNetworkInfo(): { 
  effectiveType: string; 
  downlink: number; 
  rtt: number; 
  saveData: boolean; 
} | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const connection = getConnectionInfo(navigator);
  if (!connection) {
    return null;
  }

  return {
    effectiveType: connection.effectiveType ?? 'unknown',
    downlink: typeof connection.downlink === 'number' ? connection.downlink : 0,
    rtt: typeof connection.rtt === 'number' ? connection.rtt : 0,
    saveData: Boolean(connection.saveData),
  };
}

// Adaptive loading based on network conditions
export function shouldLoadHeavyContent(): boolean {
  const networkInfo = getNetworkInfo();
  if (!networkInfo) return true; // Default to loading if no info available

  // Don't load heavy content on slow connections or when save-data is enabled
  if (networkInfo.saveData || networkInfo.effectiveType === 'slow-2g' || networkInfo.effectiveType === '2g') {
    return false;
  }

  return true;
}

// Critical resource loading
export function loadCriticalResources(): void {
  // Preload critical fonts
  preloadResource('/fonts/inter-var.woff2', 'font', 'font/woff2');
  
  // Preload critical images
  preloadResource('/images/hero-bg.webp', 'image');
  preloadResource('/images/logo.svg', 'image');
  
  // Add resource hints
  addResourceHints();
}

// Service Worker registration for caching
export function registerServiceWorker(): void {
  if (
    typeof window === 'undefined' ||
    process.env.NODE_ENV !== 'production' ||
    !('serviceWorker' in navigator)
  ) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration: ServiceWorkerRegistration) => {
        logger.info('SW registered: ', registration);
      })
      .catch((registrationError: Error) => {
        logger.error('SW registration failed: ', registrationError);
      });
  });
}
