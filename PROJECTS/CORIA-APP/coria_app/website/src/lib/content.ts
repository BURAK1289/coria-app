import { 
  Locale, 
  LocalizedContent, 
  LocalizedString, 
  ContentFilter, 
  ContentResponse,
  LocalizedPage,
  LocalizedBlogPost,
  LocalizedFeature,
  LocalizedFAQ,
  LocalizedTestimonial,
  LocalizedPricingPlan
} from '@/types/localization';

/**
 * Extract content for a specific locale from localized content
 */
export function getLocalizedContent<T>(
  content: LocalizedContent<T>,
  locale: Locale,
  fallbackLocale: Locale = 'en'
): T {
  return content[locale] || content[fallbackLocale] || content.tr;
}

/**
 * Get localized string with fallback
 */
export function getLocalizedString(
  content: LocalizedString,
  locale: Locale,
  fallbackLocale: Locale = 'en'
): string {
  return getLocalizedContent(content, locale, fallbackLocale);
}

/**
 * Check if localized content exists for a specific locale
 */
export function hasLocalizedContent<T>(
  content: LocalizedContent<T>,
  locale: Locale
): boolean {
  return content[locale] !== undefined && content[locale] !== null && content[locale] !== '';
}

/**
 * Get all available locales for a piece of content
 */
export function getAvailableLocales<T>(content: LocalizedContent<T>): Locale[] {
  return Object.entries(content)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([locale]) => locale as Locale);
}

/**
 * Create empty localized content structure
 */
export function createEmptyLocalizedContent<T>(defaultValue: T): LocalizedContent<T> {
  return {
    tr: defaultValue,
    en: defaultValue,
    de: defaultValue,
    fr: defaultValue,
  };
}

/**
 * Merge localized content with fallbacks
 */
export function mergeLocalizedContent<T>(
  primary: Partial<LocalizedContent<T>>,
  fallback: LocalizedContent<T>
): LocalizedContent<T> {
  return {
    tr: primary.tr ?? fallback.tr,
    en: primary.en ?? fallback.en,
    de: primary.de ?? fallback.de,
    fr: primary.fr ?? fallback.fr,
  };
}

/**
 * Content loading utilities
 * These would typically connect to a CMS or database
 */

// Mock data for development - replace with actual CMS integration
const mockPages: LocalizedPage[] = [];
const mockBlogPosts: LocalizedBlogPost[] = [];
const mockFeatures: LocalizedFeature[] = [];
const mockFAQs: LocalizedFAQ[] = [];
const mockTestimonials: LocalizedTestimonial[] = [];
const mockPricingPlans: LocalizedPricingPlan[] = [];

/**
 * Load pages with filtering and pagination
 */
export async function loadPages(filter: ContentFilter = {}): Promise<ContentResponse<LocalizedPage>> {
  // This would typically make an API call to your CMS
  const filteredPages = mockPages.filter(page => {
    if (filter.status && page.status !== filter.status) return false;
    return true;
  });

  const start = filter.offset || 0;
  const limit = filter.limit || 10;
  const data = filteredPages.slice(start, start + limit);

  return {
    data,
    total: filteredPages.length,
    hasMore: start + limit < filteredPages.length,
    nextOffset: start + limit < filteredPages.length ? start + limit : undefined,
  };
}

/**
 * Load a single page by slug
 */
export async function loadPageBySlug(slug: string, locale: Locale): Promise<LocalizedPage | null> {
  // This would typically make an API call to your CMS
  const page = mockPages.find(p => getLocalizedString(p.slug, locale) === slug);
  return page || null;
}

/**
 * Load blog posts with filtering and pagination
 */
export async function loadBlogPosts(filter: ContentFilter = {}): Promise<ContentResponse<LocalizedBlogPost>> {
  const filteredPosts = mockBlogPosts.filter(post => {
    if (filter.category && post.category.id !== filter.category) return false;
    if (filter.tags && filter.tags.length > 0) {
      const postTags = getLocalizedContent(post.tags, filter.locale || 'tr');
      const hasMatchingTag = filter.tags.some(tag => postTags.includes(tag));
      if (!hasMatchingTag) return false;
    }
    return true;
  });

  const start = filter.offset || 0;
  const limit = filter.limit || 10;
  const data = filteredPosts.slice(start, start + limit);

  return {
    data,
    total: filteredPosts.length,
    hasMore: start + limit < filteredPosts.length,
    nextOffset: start + limit < filteredPosts.length ? start + limit : undefined,
  };
}

/**
 * Load a single blog post by slug
 */
export async function loadBlogPostBySlug(slug: string, locale: Locale): Promise<LocalizedBlogPost | null> {
  const post = mockBlogPosts.find(p => getLocalizedString(p.slug, locale) === slug);
  return post || null;
}

/**
 * Load features with filtering
 */
export async function loadFeatures(filter: ContentFilter = {}): Promise<LocalizedFeature[]> {
  let features = mockFeatures.filter(feature => feature.isActive);
  
  if (filter.category) {
    features = features.filter(f => f.category.id === filter.category);
  }

  return features.sort((a, b) => a.order - b.order);
}

/**
 * Load FAQs with filtering
 */
export async function loadFAQs(filter: ContentFilter = {}): Promise<LocalizedFAQ[]> {
  let faqs = mockFAQs.filter(faq => faq.isActive);
  
  if (filter.category) {
    const locale = filter.locale || 'tr';
    faqs = faqs.filter(f => getLocalizedString(f.category, locale) === filter.category);
  }

  return faqs.sort((a, b) => a.order - b.order);
}

/**
 * Load testimonials
 */
export async function loadTestimonials(): Promise<LocalizedTestimonial[]> {
  return mockTestimonials
    .filter(testimonial => testimonial.isActive)
    .sort((a, b) => a.order - b.order);
}

/**
 * Load pricing plans
 */
export async function loadPricingPlans(): Promise<LocalizedPricingPlan[]> {
  return mockPricingPlans.sort((a, b) => a.order - b.order);
}

/**
 * Search content across all types
 */
export async function searchContent(
  query: string, 
  locale: Locale,
  types: ('pages' | 'blog' | 'features' | 'faqs')[] = ['pages', 'blog', 'features', 'faqs']
): Promise<{
  pages: LocalizedPage[];
  blog: LocalizedBlogPost[];
  features: LocalizedFeature[];
  faqs: LocalizedFAQ[];
}> {
  const results = {
    pages: [] as LocalizedPage[],
    blog: [] as LocalizedBlogPost[],
    features: [] as LocalizedFeature[],
    faqs: [] as LocalizedFAQ[],
  };

  const searchTerm = query.toLowerCase();

  if (types.includes('pages')) {
    results.pages = mockPages.filter(page => {
      const title = getLocalizedString(page.title, locale).toLowerCase();
      const content = getLocalizedString(page.content, locale).toLowerCase();
      return title.includes(searchTerm) || content.includes(searchTerm);
    });
  }

  if (types.includes('blog')) {
    results.blog = mockBlogPosts.filter(post => {
      const title = getLocalizedString(post.title, locale).toLowerCase();
      const excerpt = getLocalizedString(post.excerpt, locale).toLowerCase();
      const content = getLocalizedString(post.content, locale).toLowerCase();
      return title.includes(searchTerm) || excerpt.includes(searchTerm) || content.includes(searchTerm);
    });
  }

  if (types.includes('features')) {
    results.features = mockFeatures.filter(feature => {
      const name = getLocalizedString(feature.name, locale).toLowerCase();
      const description = getLocalizedString(feature.description, locale).toLowerCase();
      return name.includes(searchTerm) || description.includes(searchTerm);
    });
  }

  if (types.includes('faqs')) {
    results.faqs = mockFAQs.filter(faq => {
      const question = getLocalizedString(faq.question, locale).toLowerCase();
      const answer = getLocalizedString(faq.answer, locale).toLowerCase();
      return question.includes(searchTerm) || answer.includes(searchTerm);
    });
  }

  return results;
}