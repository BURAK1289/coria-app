/**
 * Global type definitions for the website
 */

// Google Analytics gtag function
declare function gtag(
  command: 'config' | 'event' | 'js' | 'set' | 'consent',
  targetId: string | Date | 'default' | 'update',
  config?: {
    [key: string]: any;
    event_category?: string;
    event_label?: string;
    value?: number;
    custom_map?: Record<string, any>;
    // Consent parameters
    ad_storage?: 'granted' | 'denied';
    analytics_storage?: 'granted' | 'denied';
    ad_user_data?: 'granted' | 'denied';
    ad_personalization?: 'granted' | 'denied';
    functionality_storage?: 'granted' | 'denied';
    personalization_storage?: 'granted' | 'denied';
    security_storage?: 'granted' | 'denied';
  }
): void;

// Analytics and consent types
export type ConsentStatus = 'granted' | 'denied' | 'pending';

export interface ConsentPreferences {
  analytics: ConsentStatus;
  marketing: ConsentStatus;
  functional: ConsentStatus;
}

export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, string | number | boolean>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface ConversionEvent extends AnalyticsEvent {
  conversionType: 'download' | 'signup' | 'contact' | 'subscription';
  value?: number;
  currency?: string;
}

// Extend Window interface for global variables
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'consent' | 'js' | 'set',
      targetId: string | Date | 'default' | 'update',
      config?: Record<string, unknown>
    ) => void;
    va?: (event: string, data?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
    // Performance Observer
    PerformanceObserver?: {
      new (callback: PerformanceObserverCallback): PerformanceObserver;
      supportedEntryTypes?: ReadonlyArray<string>;
    };
  }

  // Performance Observer types
  interface PerformanceObserver {
    observe(options: PerformanceObserverInit): void;
    disconnect(): void;
    takeRecords(): PerformanceEntryList;
  }

  interface PerformanceObserverCallback {
    (entries: PerformanceObserverEntryList, observer: PerformanceObserver): void;
  }

  interface PerformanceObserverEntryList {
    getEntries(): PerformanceEntryList;
    getEntriesByType(type: string): PerformanceEntryList;
    getEntriesByName(name: string, type?: string): PerformanceEntryList;
  }

  interface PerformanceObserverInit {
    entryTypes?: string[];
    type?: string;
    buffered?: boolean;
  }

  // Navigator connection API
  interface Navigator {
    connection?: {
      effectiveType?: string;
      downlink?: number;
      rtt?: number;
      saveData?: boolean;
    };
  }

  // Performance memory API
  interface Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }

  // Performance navigation timing
  interface PerformanceNavigationTiming {
    navigationStart?: number;
  }
}

// Module declarations for assets
declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

// Language types
export type Language = 'tr' | 'en' | 'de' | 'fr';

// Localized content type
export interface LocalizedContent<T = string> {
  tr: T;
  en: T;
  de: T;
  fr: T;
}

// Base component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  id?: string;
  'data-testid'?: string;
}

// Extended component props for UI components
export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  asChild?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

export interface TypographyProps extends BaseComponentProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'large' | 'small' | 'muted' | 'body' | 'body-large' | 'body-small';
  as?: keyof JSX.IntrinsicElements;
}

export interface ContainerProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outlined' | 'elevated';
}

// Card sub-component props
export interface CardHeaderProps extends BaseComponentProps {}
export interface CardTitleProps extends BaseComponentProps {}
export interface CardDescriptionProps extends BaseComponentProps {}
export interface CardContentProps extends BaseComponentProps {}
export interface CardFooterProps extends BaseComponentProps {}

// API response types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// SEO metadata types
export interface SEOMetadata {
  title: LocalizedContent;
  description: LocalizedContent;
  keywords: LocalizedContent;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  canonical?: string;
  noindex?: boolean;
}

// Image types
export interface ImageData {
  src: string;
  alt: LocalizedContent;
  width: number;
  height: number;
  blurDataURL?: string;
  sizes?: string;
}

// Performance monitoring types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'score' | 'count';
  timestamp: number;
  url: string;
  userAgent?: string;
}

export interface WebVitalsMetric extends PerformanceMetric {
  id: string;
  delta: number;
  entries: PerformanceEntry[];
  navigationType?: 'navigate' | 'reload' | 'back_forward' | 'prerender';
}

export interface CoreWebVitals {
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  tti?: number; // Time to Interactive
  loadTime?: number; // Total load time
}

// PWA and notification types
export interface NotificationPermissionResult {
  permission: NotificationPermission;
  subscription?: PushSubscription | undefined;
}

export interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync?: {
    register: (tag: string) => Promise<void>;
  };
}

// Utility types for debouncing and throttling
export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel: () => void;
}

// Test and accessibility types
export interface A11yViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
  }>;
}

export interface A11yResults {
  violations: A11yViolation[];
  passes: any[];
  incomplete: any[];
  inapplicable: unknown[];
}

// Next.js page and routing types
export interface NextPageProps<T = {}> {
  params: Promise<T>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface LocalizedPageProps extends NextPageProps<{ locale: string }> {}

export interface BlogPageProps extends NextPageProps<{ locale: string; slug: string }> {}

export interface FeaturePageProps extends NextPageProps<{ locale: string; category?: string; feature?: string }> {}

export interface DynamicPageProps<T = {}> extends NextPageProps<T> {
  params: Promise<T & { locale: string }>;
}

// Layout component types
export interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export interface LocaleLayoutProps extends LocalizedPageProps {
  children: React.ReactNode;
}

// Metadata generation types
export interface MetadataGenerationProps<T = {}> {
  params: Promise<T>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export interface LocalizedMetadataProps extends MetadataGenerationProps<{ locale: string }> {}

// Provider component types
export interface ProviderProps {
  children: React.ReactNode;
}

export interface ThemeProviderProps extends ProviderProps {
  defaultTheme?: 'light' | 'dark' | 'system';
  storageKey?: string;
}

export interface AnalyticsProviderProps extends ProviderProps {}

export interface LocaleProviderProps extends ProviderProps {
  locale: Language;
  messages: Record<string, unknown>;
}

// Navigation and routing types
export interface NavigationState {
  isLoading: boolean;
  error?: string;
  currentPath: string;
}

// Form and validation types
export interface FormFieldError {
  field: string;
  message: string;
  code?: string;
}

export interface FormState<T = unknown> {
  data: T;
  errors: FormFieldError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Content types for CMS
export interface BlogPost {
  id: string;
  slug: string;
  title: LocalizedContent;
  excerpt: LocalizedContent;
  content: LocalizedContent;
  author: Author;
  category: BlogCategory;
  tags: string[];
  featuredImage: ImageData;
  publishedAt: string;
  updatedAt: string;
  seo: SEOMetadata;
}

export interface Author {
  id: string;
  name: string;
  bio: LocalizedContent;
  avatar: ImageData;
  social: SocialLinks;
}

export interface BlogCategory {
  id: string;
  name: LocalizedContent;
  slug: string;
  description: LocalizedContent;
}

export interface Feature {
  id: string;
  name: LocalizedContent;
  description: LocalizedContent;
  icon: string;
  screenshots: ImageData[];
  benefits: LocalizedContent<string[]>;
  category: FeatureCategory;
  methodology?: LocalizedContent;
  dataSources?: DataSource[];
  relatedFeatures?: Feature[];
}

export interface FeatureCategory {
  id: string;
  name: LocalizedContent;
  slug: string;
  description: LocalizedContent;
  icon: string;
  order: number;
}

export interface DataSource {
  name: string;
  url: string;
  description: LocalizedContent;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export {};