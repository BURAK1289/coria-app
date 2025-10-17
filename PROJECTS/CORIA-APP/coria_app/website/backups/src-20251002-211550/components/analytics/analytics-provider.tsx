'use client';

/**
 * Analytics Provider Component
 * Initializes and manages all analytics functionality
 */

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { 
  GA_MEASUREMENT_ID, 
  isGAEnabled, 
  initGA, 
  trackPageView 
} from '@/lib/analytics/gtag';
import { initializeConsent } from '@/lib/analytics/consent';
import { initPerformanceMonitoring } from '@/lib/analytics/web-vitals';
import { initABTesting } from '@/lib/analytics/ab-testing';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const pathname = usePathname();

  // Track page views on route changes
  useEffect(() => {
    if (isGAEnabled()) {
      trackPageView(window.location.href, document.title);
    }
  }, [pathname]);

  // Initialize analytics on mount
  useEffect(() => {
    // Initialize consent management first
    initializeConsent();
    
    // Initialize performance monitoring
    initPerformanceMonitoring();
    
    // Initialize A/B testing
    initABTesting();
  }, []);

  // Handle GA script load
  const handleGALoad = () => {
    initGA();
  };

  if (!isGAEnabled()) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Google Analytics Scripts */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
        onLoad={handleGALoad}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            
            // Initialize consent mode before GA config
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'functionality_storage': 'granted',
              'personalization_storage': 'denied',
              'security_storage': 'granted',
              'wait_for_update': 500
            });
          `,
        }}
      />
      
      {children}
    </>
  );
}