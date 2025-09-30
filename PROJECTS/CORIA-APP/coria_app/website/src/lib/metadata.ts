import { Metadata } from 'next';
import { Locale, LocalizedSEO } from '@/types/localization';
import { generateAlternateUrls, generateHreflangUrls, getCanonicalUrl } from './urls';
import { getLocalizedString } from './content';

/**
 * Metadata generation utilities for internationalized pages
 */

export interface LocalizedMetadataOptions {
  locale: Locale;
  path: string;
  seo: LocalizedSEO;
  type?: 'website' | 'article';
  images?: string[];
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  section?: string;
  tags?: string[];
}

/**
 * Generate Next.js metadata from localized SEO data
 */
export function generateLocalizedMetadata(
  options: LocalizedMetadataOptions
): Metadata {
  const {
    locale,
    path,
    seo,
    type = 'website',
    images = [],
    publishedTime,
    modifiedTime,
    authors = [],
    section,
    tags = [],
  } = options;

  const title = getLocalizedString(seo.title, locale);
  const description = getLocalizedString(seo.description, locale);
  const keywords = seo.keywords[locale] || seo.keywords.en || [];
  
  const canonicalUrl = getCanonicalUrl(path, locale);
  const alternateUrls = generateAlternateUrls(path, { absolute: true });
  const hreflangUrls = generateHreflangUrls(path);

  // Determine locale for Open Graph
  const ogLocaleMap: Record<Locale, string> = {
    tr: 'tr_TR',
    en: 'en_US',
    de: 'de_DE',
    fr: 'fr_FR',
  };

  // Default OG image if none provided
  const defaultOgImage = 'https://coria.app/og-image.png';
  const ogImages = images.length > 0 ? images : [defaultOgImage];

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    authors: authors.map(author => ({ name: author })),
    creator: 'CORIA Team',
    publisher: 'CORIA',
    applicationName: 'CORIA',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    
    // Canonical URL
    alternates: {
      canonical: canonicalUrl,
      languages: alternateUrls,
    },

    // Open Graph
    openGraph: {
      type,
      locale: ogLocaleMap[locale],
      url: canonicalUrl,
      siteName: 'CORIA',
      title,
      description,
      images: ogImages.map(image => ({
        url: image,
        width: 1200,
        height: 630,
        alt: title,
      })),
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors.length > 0 && { authors }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@coria_app',
      site: '@coria_app',
      images: ogImages,
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Icons
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#1B5E3F' },
      ],
    },

    // Manifest
    manifest: '/site.webmanifest',

    // Additional metadata
    other: {
      'apple-mobile-web-app-title': 'CORIA',
      'application-name': 'CORIA',
      'msapplication-TileColor': '#1B5E3F',
      'theme-color': '#1B5E3F',
      // Hreflang links for SEO
      ...Object.entries(hreflangUrls).reduce((acc, [hreflang, url]) => {
        acc[`hreflang-${hreflang}`] = url;
        return acc;
      }, {} as Record<string, string>),
    },
  };

  // Add article-specific metadata
  if (type === 'article') {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors.length > 0 && { authors }),
      ...(section && { section }),
      ...(tags.length > 0 && { tags }),
    };
  }

  return metadata;
}

/**
 * Generate JSON-LD structured data
 */
export function generateStructuredData(
  options: LocalizedMetadataOptions & {
    organizationName?: string;
    organizationUrl?: string;
    organizationLogo?: string;
    breadcrumbs?: Array<{ name: string; url: string }>;
  }
): Record<string, unknown> {
  const {
    locale,
    path,
    seo,
    type = 'website',
    images = [],
    publishedTime,
    modifiedTime,
    authors = [],
    organizationName = 'CORIA',
    organizationUrl = 'https://coria.app',
    organizationLogo = 'https://coria.app/logo.png',
    breadcrumbs = [],
  } = options;

  const title = getLocalizedString(seo.title, locale);
  const description = getLocalizedString(seo.description, locale);
  const canonicalUrl = getCanonicalUrl(path, locale);

  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebPage',
    name: title,
    description,
    url: canonicalUrl,
    inLanguage: locale,
    isPartOf: {
      '@type': 'WebSite',
      name: organizationName,
      url: organizationUrl,
    },
    ...(images.length > 0 && {
      image: images.map(image => ({
        '@type': 'ImageObject',
        url: image,
        width: 1200,
        height: 630,
      })),
    }),
  };

  // Add article-specific structured data
  if (type === 'article') {
    Object.assign(baseStructuredData, {
      '@type': 'Article',
      headline: title,
      ...(publishedTime && { datePublished: publishedTime }),
      ...(modifiedTime && { dateModified: modifiedTime }),
      ...(authors.length > 0 && {
        author: authors.map(author => ({
          '@type': 'Person',
          name: author,
        })),
      }),
      publisher: {
        '@type': 'Organization',
        name: organizationName,
        url: organizationUrl,
        logo: {
          '@type': 'ImageObject',
          url: organizationLogo,
        },
      },
    });
  }

  // Add breadcrumb structured data
  if (breadcrumbs.length > 0) {
    const breadcrumbStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((breadcrumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: breadcrumb.name,
        item: breadcrumb.url,
      })),
    };

    return {
      webpage: baseStructuredData,
      breadcrumbs: breadcrumbStructuredData,
    };
  }

  return { webpage: baseStructuredData };
}

/**
 * Generate sitemap entry
 */
export function generateSitemapEntry(
  path: string,
  options: {
    lastModified?: Date;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
  } = {}
): Array<{
  url: string;
  lastModified: Date;
  changeFrequency: string;
  priority: number;
  alternates: {
    languages: Record<string, string>;
  };
}> {
  const {
    lastModified = new Date(),
    changeFrequency = 'weekly',
    priority = 0.8,
  } = options;

  const alternateUrls = generateAlternateUrls(path, { absolute: true });

  return [
    {
      url: getCanonicalUrl(path, 'tr'), // Use default locale as primary
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: alternateUrls,
      },
    },
  ];
}

/**
 * Generate robots.txt rules
 */
export function generateRobotsRules(
  options: {
    allowAll?: boolean;
    disallowPaths?: string[];
    sitemapUrl?: string;
  } = {}
): string {
  const {
    allowAll = true,
    disallowPaths = [],
    sitemapUrl = 'https://coria.app/sitemap.xml',
  } = options;

  let rules = 'User-agent: *\n';
  
  if (allowAll) {
    rules += 'Allow: /\n';
  }

  disallowPaths.forEach((path: string) => {
    rules += `Disallow: ${path}\n`;
  });

  rules += `\nSitemap: ${sitemapUrl}\n`;

  return rules;
}

/**
 * Validate SEO metadata
 */
export function validateSEOMetadata(seo: LocalizedSEO): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check title length
  Object.entries(seo.title).forEach(([locale, title]) => {
    if (!title || title.trim().length === 0) {
      errors.push(`Title is missing for locale: ${locale}`);
    } else if (title.length > 60) {
      warnings.push(`Title is too long for locale ${locale}: ${title.length} characters (recommended: 50-60)`);
    } else if (title.length < 30) {
      warnings.push(`Title is too short for locale ${locale}: ${title.length} characters (recommended: 30-60)`);
    }
  });

  // Check description length
  Object.entries(seo.description).forEach(([locale, description]) => {
    if (!description || description.trim().length === 0) {
      errors.push(`Description is missing for locale: ${locale}`);
    } else if (description.length > 160) {
      warnings.push(`Description is too long for locale ${locale}: ${description.length} characters (recommended: 120-160)`);
    } else if (description.length < 120) {
      warnings.push(`Description is too short for locale ${locale}: ${description.length} characters (recommended: 120-160)`);
    }
  });

  // Check keywords
  Object.entries(seo.keywords).forEach(([locale, keywords]) => {
    if (!keywords || keywords.length === 0) {
      warnings.push(`Keywords are missing for locale: ${locale}`);
    } else if (keywords.length > 10) {
      warnings.push(`Too many keywords for locale ${locale}: ${keywords.length} (recommended: 5-10)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}