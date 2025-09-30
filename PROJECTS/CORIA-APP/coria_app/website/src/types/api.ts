/**
 * API and Content Management Type Definitions
 */

import { LocalizedContent, LocalizedString, LocalizedRichText, LocalizedSEO, Locale } from './localization';

// Re-export localization types for convenience
export type { LocalizedContent, LocalizedString, LocalizedRichText, LocalizedSEO, Locale } from './localization';

// Base API types
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  timestamp?: string;
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

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Content Management System types
export interface CMSContent {
  id: string;
  slug: string;
  title: LocalizedString;
  content: LocalizedRichText;
  publishedAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
  author?: Author;
  seo: LocalizedSEO;
}

export interface BlogPost extends CMSContent {
  excerpt: LocalizedString;
  category: BlogCategory;
  tags: LocalizedContent<string[]>;
  featuredImage: ImageAsset;
  readingTime: LocalizedContent<number>; // in minutes
  relatedPosts?: string[]; // IDs of related posts
}

export interface BlogCategory {
  id: string;
  name: LocalizedString;
  slug: LocalizedString;
  description: LocalizedString;
  color: string;
  postCount: number;
  order: number;
}

export interface Author {
  id: string;
  name: string;
  bio: LocalizedString;
  avatar: ImageAsset;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  postCount: number;
}

export interface Feature extends CMSContent {
  name: LocalizedString;
  description: LocalizedString;
  longDescription?: LocalizedRichText;
  icon: string;
  screenshots: ImageAsset[];
  benefits: LocalizedContent<string[]>;
  category: FeatureCategory;
  methodology?: LocalizedRichText;
  dataSources?: DataSource[];
  order: number;
  isActive: boolean;
  isPremium: boolean;
}

export interface FeatureCategory {
  id: string;
  name: LocalizedString;
  slug: LocalizedString;
  description: LocalizedString;
  icon: string;
  color: string;
  featureCount: number;
  order: number;
}

export interface DataSource {
  id: string;
  name: string;
  url: string;
  description: LocalizedString;
  type: 'api' | 'database' | 'file' | 'external';
  reliability: 'high' | 'medium' | 'low';
  lastUpdated: string;
}

export interface Page extends CMSContent {
  template: 'default' | 'landing' | 'legal' | 'contact';
  sections?: PageSection[];
  metadata?: Record<string, any>;
}

export interface PageSection {
  id: string;
  type: 'hero' | 'features' | 'testimonials' | 'cta' | 'content' | 'gallery';
  title?: LocalizedString;
  content?: LocalizedRichText;
  data?: Record<string, any>;
  order: number;
  isVisible: boolean;
}

// SEO and metadata types
export interface SEOMetadata {
  title: LocalizedString;
  description: LocalizedString;
  keywords: LocalizedContent<string[]>;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: StructuredData[];
}

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

// Image and media types
export interface ImageAsset {
  id: string;
  src: string;
  alt: LocalizedString;
  width: number;
  height: number;
  format: 'jpg' | 'png' | 'webp' | 'svg' | 'gif';
  size: number; // in bytes
  blurDataURL?: string;
  sizes?: string;
  caption?: LocalizedString;
  credit?: string;
  tags?: string[];
}

export interface VideoAsset {
  id: string;
  src: string;
  title: LocalizedString;
  description?: LocalizedString;
  duration: number; // in seconds
  thumbnail: ImageAsset;
  format: 'mp4' | 'webm' | 'mov';
  size: number; // in bytes
  quality: '720p' | '1080p' | '4k';
}

// Analytics and performance monitoring types
export interface AnalyticsEvent {
  name: string;
  parameters: Record<string, string | number | boolean>;
  timestamp: number;
  userId?: string;
  sessionId: string;
  locale: Locale;
  userAgent: string;
  referrer?: string;
  page: string;
}

export interface ConversionEvent extends AnalyticsEvent {
  conversionType: 'download' | 'signup' | 'contact' | 'subscription' | 'purchase';
  value?: number;
  currency?: string;
  funnel?: string;
  step?: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'score' | 'count' | 'percentage';
  timestamp: number;
  url: string;
  userAgent: string;
  connectionType?: string;
  deviceType?: 'mobile' | 'tablet' | 'desktop';
  locale: Locale;
}

export interface WebVitalsMetric extends PerformanceMetric {
  id: string;
  delta: number;
  entries: PerformanceEntry[];
  navigationType: 'navigate' | 'reload' | 'back_forward' | 'prerender';
  rating: 'good' | 'needs-improvement' | 'poor';
}

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  url: string;
  lineNumber?: number;
  columnNumber?: number;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId: string;
  locale: Locale;
  severity: 'low' | 'medium' | 'high' | 'critical';
  tags?: string[];
  context?: Record<string, any>;
}

// Content filtering and search types
export interface ContentFilter {
  locale?: Locale;
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  tags?: string[];
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'publishedAt' | 'updatedAt' | 'title' | 'order' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  item: T;
  score: number;
  highlights?: Record<string, string[]>;
}

export interface SearchResponse<T> extends PaginatedResponse<SearchResult<T>> {
  query: string;
  totalResults: number;
  searchTime: number;
  suggestions?: string[];
  facets?: Record<string, Array<{ value: string; count: number }>>;
}

// Newsletter and subscription types
export interface NewsletterSubscription {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed' | 'bounced' | 'pending';
  locale: Locale;
  subscribedAt: string;
  unsubscribedAt?: string;
  preferences: {
    frequency: 'daily' | 'weekly' | 'monthly';
    categories: string[];
    format: 'html' | 'text';
  };
  source: string;
  tags?: string[];
}

export interface NewsletterCampaign {
  id: string;
  subject: LocalizedString;
  content: LocalizedRichText;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  scheduledAt?: string;
  sentAt?: string;
  recipients: number;
  opens: number;
  clicks: number;
  unsubscribes: number;
  bounces: number;
  locale?: Locale;
  tags?: string[];
}

// Contact and support types
export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'business' | 'press' | 'partnership';
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  locale: Locale;
  submittedAt: string;
  respondedAt?: string;
  assignedTo?: string;
  tags?: string[];
  attachments?: string[];
  metadata?: Record<string, any>;
}

export interface SupportTicket extends ContactSubmission {
  ticketNumber: string;
  category: 'technical' | 'billing' | 'feature-request' | 'bug-report' | 'other';
  product?: string;
  version?: string;
  browser?: string;
  operatingSystem?: string;
  reproductionSteps?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  screenshots?: ImageAsset[];
  resolution?: string;
  satisfactionRating?: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
}

// A/B testing types
export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate: string;
  endDate?: string;
  trafficAllocation: number; // percentage
  variants: ABTestVariant[];
  metrics: ABTestMetric[];
  results?: ABTestResults;
  targetAudience?: {
    locale?: Locale[];
    deviceType?: ('mobile' | 'tablet' | 'desktop')[];
    newUsers?: boolean;
    returningUsers?: boolean;
  };
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  allocation: number; // percentage
  isControl: boolean;
  config: Record<string, any>;
}

export interface ABTestMetric {
  name: string;
  type: 'conversion' | 'engagement' | 'revenue' | 'custom';
  goal: 'increase' | 'decrease';
  primaryMetric: boolean;
}

export interface ABTestResults {
  totalParticipants: number;
  variants: Array<{
    variantId: string;
    participants: number;
    conversions: number;
    conversionRate: number;
    confidence: number;
    significance: 'significant' | 'not-significant' | 'inconclusive';
    lift: number; // percentage change from control
  }>;
  winner?: string;
  recommendation: 'implement' | 'continue-testing' | 'abandon';
}

// Pricing and subscription types
export interface PricingPlan {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  features: LocalizedContent<string[]>;
  price: PriceInfo;
  isPopular: boolean;
  isCustom: boolean;
  order: number;
  metadata?: Record<string, any>;
}

export interface PriceInfo {
  amount: number;
  currency: Currency;
  period: 'monthly' | 'yearly' | 'lifetime' | 'one-time';
  originalAmount?: number; // for discounts
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    validUntil?: string;
  };
}

export interface Currency {
  code: string; // ISO 4217 currency code
  symbol: string;
  name: LocalizedString;
  exchangeRate?: number; // relative to base currency
}

// Testimonial and social proof types
export interface Testimonial {
  id: string;
  content: LocalizedString;
  author: {
    name: string;
    title: LocalizedString;
    company: LocalizedString;
    avatar: ImageAsset;
    verified: boolean;
  };
  rating: number; // 1-5
  isActive: boolean;
  order: number;
  source: 'website' | 'app-store' | 'google-play' | 'social' | 'email';
  submittedAt: string;
  approvedAt?: string;
  tags?: string[];
}

export interface SocialProof {
  type: 'user-count' | 'download-count' | 'rating' | 'testimonial' | 'press-mention';
  value: string | number;
  label: LocalizedString;
  source?: string;
  verifiedAt: string;
  displayOrder: number;
  isActive: boolean;
}

// FAQ types
export interface FAQ {
  id: string;
  question: LocalizedString;
  answer: LocalizedRichText;
  category: LocalizedString;
  order: number;
  isActive: boolean;
  helpfulVotes: number;
  notHelpfulVotes: number;
  tags?: string[];
  relatedFAQs?: string[];
  lastUpdated: string;
}

// Navigation and menu types
export interface NavigationItem {
  id: string;
  label: LocalizedString;
  href: LocalizedString;
  children?: NavigationItem[];
  isExternal?: boolean;
  icon?: string;
  description?: LocalizedString;
  order: number;
  isActive: boolean;
  requiresAuth?: boolean;
  roles?: string[];
}

export interface FooterSection {
  id: string;
  title: LocalizedString;
  links: NavigationItem[];
  order: number;
  isActive: boolean;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  order: number;
  isActive: boolean;
  followerCount?: number;
}

// Content management and workflow types
export interface ContentWorkflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  isActive: boolean;
  contentTypes: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  order: number;
  assignedRole: string;
  requiredFields?: string[];
  actions: WorkflowAction[];
  isRequired: boolean;
}

export interface WorkflowAction {
  id: string;
  name: string;
  type: 'approve' | 'reject' | 'request-changes' | 'publish' | 'archive';
  requiresComment: boolean;
  nextStep?: string;
}

// API request and response helpers
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
  method: ApiMethod;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
}

export interface ApiEndpoint {
  path: string;
  method: ApiMethod;
  description: string;
  parameters?: ApiParameter[];
  responses: ApiResponseSpec[];
}

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description: string;
  example?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
}

export interface ApiResponseSpec {
  status: number;
  description: string;
  schema?: Record<string, any>;
  example?: any;
}