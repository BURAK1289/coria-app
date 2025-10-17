# Analytics Implementation

This directory contains the complete analytics infrastructure for the CORIA website, including Google Analytics 4 integration, privacy-compliant consent management, A/B testing, and admin dashboard components.

## Features

### 🔍 Google Analytics 4 Integration
- Privacy-compliant tracking with consent management
- Custom event tracking for conversion funnel analysis
- Enhanced ecommerce tracking for subscription interest
- Core Web Vitals monitoring for performance insights

### 🍪 Privacy & Consent Management
- GDPR/KVKK compliant cookie consent banner
- Granular consent preferences (analytics, marketing, functional)
- Automatic consent expiration and renewal
- Privacy-first approach with denied-by-default settings

### 📊 Performance Monitoring
- Core Web Vitals tracking (LCP, FID, CLS, FCP, TTFB)
- Custom performance metrics
- Resource loading performance analysis
- Long task detection and monitoring

### 🧪 A/B Testing Infrastructure
- Client-side A/B testing with statistical significance
- Deterministic user assignment for consistent experience
- Conversion tracking and impact analysis
- Built-in test configurations for common optimizations

### 📈 Admin Dashboard
- Real-time analytics overview with key metrics
- Conversion funnel visualization and optimization
- Content performance tracking for blog posts and features
- A/B test results with statistical analysis

## Setup

### 1. Environment Variables

Add your Google Analytics measurement ID to your environment variables:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 2. Integration

The analytics system is automatically integrated into the main layout:

```tsx
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
import { ConsentBanner } from '@/components/analytics/consent-banner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AnalyticsProvider>
          {children}
          <ConsentBanner />
        </AnalyticsProvider>
      </body>
    </html>
  );
}
```

### 3. Custom Event Tracking

Track custom events throughout your application:

```tsx
import { trackEvent, ConversionEvents } from '@/lib/analytics/gtag';

// Track download button clicks
trackEvent(ConversionEvents.DOWNLOAD_BUTTON_CLICK, 'conversion', 'ios', undefined, {
  source: 'homepage',
  position: 'hero'
});

// Track feature engagement
trackEvent(ConversionEvents.FEATURE_CARD_CLICK, 'engagement', 'barcode-scanning');
```

### 4. A/B Testing

Use A/B tests in your components:

```tsx
import { useABTest } from '@/lib/analytics/ab-testing';

function HeroSection() {
  const { config, trackConversion } = useABTest('hero_cta_text');
  
  const handleCTAClick = () => {
    trackConversion('cta_click');
    // Handle click...
  };
  
  return (
    <button onClick={handleCTAClick}>
      {config.ctaText || 'Download Now'}
    </button>
  );
}
```

## File Structure

```
lib/analytics/
├── gtag.ts                 # Google Analytics 4 configuration
├── consent.ts              # Privacy consent management
├── web-vitals.ts           # Performance monitoring
├── ab-testing.ts           # A/B testing infrastructure
├── dashboard-data.ts       # Dashboard data types and mock data
└── README.md              # This file

components/analytics/
├── analytics-provider.tsx  # Main analytics provider
├── consent-banner.tsx      # Cookie consent banner
└── dashboard/             # Admin dashboard components
    ├── analytics-dashboard.tsx
    ├── overview-metrics.tsx
    ├── conversion-funnel.tsx
    ├── content-performance.tsx
    └── ab-test-results.tsx
```

## Privacy Compliance

### GDPR/KVKV Compliance
- Consent is denied by default for all non-essential cookies
- Users can granularly control consent preferences
- Consent expires after 30 days and must be renewed
- All tracking respects user consent preferences

### Data Protection
- No personally identifiable information is tracked
- IP addresses are anonymized
- Google Signals and ad personalization are disabled
- Secure cookie flags are enforced

## Performance Impact

The analytics implementation is designed for minimal performance impact:

- Scripts load with `afterInteractive` strategy
- Consent state is cached in localStorage
- A/B test assignments are pre-calculated to avoid layout shifts
- Performance monitoring uses passive observers

## Dashboard Access

The admin dashboard is available at `/admin/analytics` and provides:

- **Overview**: Key metrics, top pages, device/country breakdown
- **Conversions**: Funnel analysis, download tracking, goal completions
- **Content**: Blog performance, feature page analytics, language metrics
- **A/B Tests**: Test results, statistical significance, optimization recommendations

## Customization

### Adding New Events

1. Add event constants to `ConversionEvents` in `gtag.ts`
2. Use `trackEvent()` or specialized tracking functions
3. Events will automatically appear in GA4 and the dashboard

### Creating New A/B Tests

1. Add test configuration to `ACTIVE_TESTS` in `ab-testing.ts`
2. Use `useABTest()` hook in components
3. Track conversions with `trackConversion()`

### Extending Dashboard

1. Add new metrics to dashboard data types
2. Create dashboard components in `components/analytics/dashboard/`
3. Integrate with main dashboard navigation

## Monitoring

### Key Metrics to Monitor
- Conversion rate trends
- Core Web Vitals scores
- A/B test statistical significance
- Content engagement rates
- Privacy consent rates

### Alerts & Thresholds
- Conversion rate drops > 20%
- Core Web Vitals scores below "good" thresholds
- Error rates > 1%
- A/B test confidence levels

## Troubleshooting

### Common Issues

1. **Analytics not tracking**: Check GA_MEASUREMENT_ID environment variable
2. **Consent banner not showing**: Verify user hasn't already set preferences
3. **A/B tests not working**: Check test configuration and traffic allocation
4. **Dashboard showing no data**: Verify mock data is being used in development

### Debug Mode

Enable debug logging in development:

```tsx
<WebVitals debug={process.env.NODE_ENV === 'development'} />
```

This will log performance metrics and analytics events to the console.