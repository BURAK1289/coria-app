import * as Sentry from '@sentry/nextjs';
import { replayIntegration } from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out known non-critical errors
    const error = hint.originalException;
    
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message as string;
      
      // Filter out network errors that are not actionable
      if (message.includes('Network request failed') || 
          message.includes('Failed to fetch') ||
          message.includes('Load failed')) {
        return null;
      }
      
      // Filter out browser extension errors
      if (message.includes('extension') || 
          message.includes('chrome-extension') ||
          message.includes('moz-extension')) {
        return null;
      }
    }
    
    return event;
  },
  
  // Additional configuration
  integrations: [
    replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Custom tags
  initialScope: {
    tags: {
      component: 'website',
      platform: 'web',
    },
  },
});