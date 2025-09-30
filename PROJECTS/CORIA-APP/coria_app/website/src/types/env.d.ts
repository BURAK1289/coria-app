/**
 * Environment variable type definitions
 */

declare namespace NodeJS {
  interface ProcessEnv {
    // Next.js built-in environment variables
    readonly NODE_ENV: 'development' | 'production' | 'test';
    readonly NEXT_PUBLIC_VERCEL_URL?: string;
    readonly VERCEL_URL?: string;
    readonly PORT?: string;

    // Analytics and tracking
    readonly NEXT_PUBLIC_GA_ID?: string;
    readonly NEXT_PUBLIC_GTM_ID?: string;
    readonly NEXT_PUBLIC_HOTJAR_ID?: string;
    readonly NEXT_PUBLIC_MIXPANEL_TOKEN?: string;

    // Content Management System
    readonly CONTENTFUL_SPACE_ID?: string;
    readonly CONTENTFUL_ACCESS_TOKEN?: string;
    readonly CONTENTFUL_PREVIEW_ACCESS_TOKEN?: string;
    readonly CONTENTFUL_MANAGEMENT_TOKEN?: string;
    readonly CONTENTFUL_ENVIRONMENT?: string;

    // Error tracking and monitoring
    readonly SENTRY_DSN?: string;
    readonly NEXT_PUBLIC_SENTRY_DSN?: string;
    readonly SENTRY_ORG?: string;
    readonly SENTRY_PROJECT?: string;
    readonly SENTRY_AUTH_TOKEN?: string;

    // Performance monitoring
    readonly NEXT_PUBLIC_VERCEL_ANALYTICS_ID?: string;
    readonly NEXT_PUBLIC_SPEED_INSIGHTS_ID?: string;

    // Security and authentication
    readonly NEXTAUTH_SECRET?: string;
    readonly NEXTAUTH_URL?: string;
    readonly JWT_SECRET?: string;

    // API keys and external services
    readonly OPENAI_API_KEY?: string;
    readonly RESEND_API_KEY?: string;
    readonly UPLOADTHING_SECRET?: string;
    readonly UPLOADTHING_APP_ID?: string;

    // Database and storage
    readonly DATABASE_URL?: string;
    readonly REDIS_URL?: string;
    readonly S3_BUCKET_NAME?: string;
    readonly S3_ACCESS_KEY_ID?: string;
    readonly S3_SECRET_ACCESS_KEY?: string;
    readonly S3_REGION?: string;

    // Feature flags and configuration
    readonly NEXT_PUBLIC_APP_ENV?: 'development' | 'staging' | 'production';
    readonly NEXT_PUBLIC_API_URL?: string;
    readonly NEXT_PUBLIC_SITE_URL?: string;
    readonly NEXT_PUBLIC_ENABLE_ANALYTICS?: 'true' | 'false';
    readonly NEXT_PUBLIC_ENABLE_PWA?: 'true' | 'false';
    readonly NEXT_PUBLIC_MAINTENANCE_MODE?: 'true' | 'false';

    // Localization and internationalization
    readonly NEXT_PUBLIC_DEFAULT_LOCALE?: string;
    readonly NEXT_PUBLIC_SUPPORTED_LOCALES?: string;

    // Build and deployment
    readonly ANALYZE?: 'true' | 'false';
    readonly BUNDLE_ANALYZE?: 'true' | 'false';
    readonly TURBOPACK?: 'true' | 'false';

    // Testing and development
    readonly PLAYWRIGHT_BASE_URL?: string;
    readonly LIGHTHOUSE_CI_TOKEN?: string;
    readonly CHROMATIC_PROJECT_TOKEN?: string;

    // Custom application settings
    readonly NEXT_PUBLIC_CONTACT_EMAIL?: string;
    readonly NEXT_PUBLIC_SUPPORT_EMAIL?: string;
    readonly NEXT_PUBLIC_COMPANY_NAME?: string;
    readonly NEXT_PUBLIC_APP_NAME?: string;
    readonly NEXT_PUBLIC_APP_VERSION?: string;
  }
}

// Environment configuration types
export interface EnvironmentConfig {
  nodeEnv: 'development' | 'production' | 'test';
  appEnv: 'development' | 'staging' | 'production';
  siteUrl: string;
  apiUrl: string;
  enableAnalytics: boolean;
  enablePWA: boolean;
  maintenanceMode: boolean;
  defaultLocale: string;
  supportedLocales: string[];
}

// Runtime environment validation
export interface EnvironmentValidation {
  isValid: boolean;
  missingVariables: string[];
  invalidVariables: Array<{
    name: string;
    value: string;
    expectedType: string;
  }>;
}

export {};