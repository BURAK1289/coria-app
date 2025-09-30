import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Environment configuration
  environment: process.env.NODE_ENV,
  
  // Release tracking
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  
  // Server-specific configuration
  debug: process.env.NODE_ENV === 'development',
  
  // Error filtering for server
  beforeSend(event, hint) {
    const error = hint.originalException;
    
    if (error && typeof error === 'object' && 'message' in error) {
      const message = error.message as string;
      
      // Filter out expected errors
      if (message.includes('ENOTFOUND') || 
          message.includes('ECONNREFUSED') ||
          message.includes('timeout')) {
        // Log but don't send to Sentry for network issues
        console.warn('Network error filtered:', message);
        return null;
      }
    }
    
    return event;
  },
  
  // Custom tags for server
  initialScope: {
    tags: {
      component: 'website-server',
      platform: 'node',
    },
  },
});