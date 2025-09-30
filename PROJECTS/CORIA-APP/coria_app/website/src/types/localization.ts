import { routing } from '@/i18n/routing';

export type Locale = (typeof routing.locales)[number];

export interface LocalizedContent<T = string> {
  tr: T;
  en: T;
  de: T;
  fr: T;
}

export type LocalizedString = LocalizedContent<string>;

export type LocalizedRichText = LocalizedContent<string>;

export interface LocalizedSEO {
  title: LocalizedString;
  description: LocalizedString;
  keywords: LocalizedContent<string[]>;
  ogImage?: string;
  canonicalUrl?: LocalizedString;
}

export interface LocalizedPage {
  id: string;
  slug: LocalizedString;
  title: LocalizedString;
  content: LocalizedRichText;
  seo: LocalizedSEO;
  publishedAt: Date;
  updatedAt: Date;
  status: 'draft' | 'published' | 'archived';
}

export interface LocalizedFeature {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  longDescription?: LocalizedRichText;
  icon: string;
  screenshots: LocalizedContent<string[]>;
  benefits: LocalizedContent<string[]>;
  category: FeatureCategory;
  order: number;
  isActive: boolean;
}

export interface LocalizedBlogPost {
  id: string;
  slug: LocalizedString;
  title: LocalizedString;
  excerpt: LocalizedString;
  content: LocalizedRichText;
  author: Author;
  category: BlogCategory;
  tags: LocalizedContent<string[]>;
  featuredImage: string;
  publishedAt: Date;
  updatedAt: Date;
  seo: LocalizedSEO;
  readingTime: LocalizedContent<number>; // in minutes
}

export interface LocalizedPricingPlan {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  features: LocalizedContent<string[]>;
  price: PriceInfo;
  isPopular: boolean;
  order: number;
}

export interface PriceInfo {
  amount: number;
  currency: Currency;
  period: 'monthly' | 'yearly' | 'lifetime';
  originalAmount?: number; // for discounts
}

export interface Currency {
  code: string; // ISO 4217 currency code
  symbol: string;
  name: LocalizedString;
}

export interface Author {
  id: string;
  name: string;
  bio: LocalizedString;
  avatar: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface BlogCategory {
  id: string;
  name: LocalizedString;
  slug: LocalizedString;
  description: LocalizedString;
  color: string;
}

export interface FeatureCategory {
  id: string;
  name: LocalizedString;
  slug: LocalizedString;
  description: LocalizedString;
  icon: string;
  order: number;
}

export interface LocalizedNavigation {
  main: NavigationItem[];
  footer: FooterNavigation;
}

export interface NavigationItem {
  id: string;
  label: LocalizedString;
  href: LocalizedString;
  children?: NavigationItem[];
  isExternal?: boolean;
  order: number;
}

export interface FooterNavigation {
  sections: FooterSection[];
  social: SocialLink[];
  legal: NavigationItem[];
}

export interface FooterSection {
  id: string;
  title: LocalizedString;
  links: NavigationItem[];
  order: number;
}

export interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  order: number;
}

export interface LocalizedTestimonial {
  id: string;
  content: LocalizedString;
  author: {
    name: string;
    title: LocalizedString;
    company: LocalizedString;
    avatar: string;
  };
  rating: number;
  isActive: boolean;
  order: number;
}

export interface LocalizedFAQ {
  id: string;
  question: LocalizedString;
  answer: LocalizedRichText;
  category: LocalizedString;
  order: number;
  isActive: boolean;
}

// Content loading and management types
export interface ContentFilter {
  locale?: Locale;
  status?: 'draft' | 'published' | 'archived';
  category?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  sortBy?: 'publishedAt' | 'updatedAt' | 'title' | 'order';
  sortOrder?: 'asc' | 'desc';
}

export interface ContentResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface LocalizedMetadata {
  locale: Locale;
  alternateUrls: Record<Locale, string>;
  hreflang: Record<Locale, string>;
  canonicalUrl: string;
}