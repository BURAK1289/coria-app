import { createClient, Entry, Asset, EntryCollection, EntrySkeletonType } from 'contentful';
import { Document } from '@contentful/rich-text-types';
import { logger } from '@/lib/logger';

type ContentfulClient = ReturnType<typeof createClient>;

function initializeContentfulClient(options: { accessToken?: string; host?: string }): ContentfulClient | null {
  const space = process.env.CONTENTFUL_SPACE_ID;
  const environment = process.env.CONTENTFUL_ENVIRONMENT ?? 'master';
  const { accessToken, host } = options;

  if (!space || !accessToken) {
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('[Contentful] Gerekli kimlik bilgileri eksik; istemci başlatılamadı.');
    }
    return null;
  }

  try {
    return createClient({
      space,
      accessToken,
      environment,
      ...(host ? { host } : {}),
    });
  } catch (error) {
    logger.error('[Contentful] İstemci oluşturulurken hata oluştu:', error);
    return null;
  }
}

// Contentful client configuration
const client = initializeContentfulClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
});

// Preview client for draft content
const previewClient = initializeContentfulClient({
  accessToken: process.env.CONTENTFUL_PREVIEW_TOKEN,
  host: 'preview.contentful.com',
});

export const isContentfulConfigured = Boolean(client);
export const isContentfulPreviewConfigured = Boolean(previewClient);

// Base Contentful entry type
export interface ContentfulEntry<T = any> {
  sys: {
    id: string;
    type: string;
    createdAt: string;
    updatedAt: string;
    locale: string;
    contentType: {
      sys: {
        type: 'Link';
        linkType: 'ContentType';
        id: string;
      };
    };
  };
  fields: T;
}

// Content type skeleton interfaces
export interface PageSkeleton extends EntrySkeletonType {
  contentTypeId: 'page';
  fields: {
    title: string;
    slug: string;
    content: Document;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
    ogImage?: Asset;
    publishedAt: string;
    updatedAt: string;
  };
}

export interface AuthorSkeleton extends EntrySkeletonType {
  contentTypeId: 'author';
  fields: {
    name: string;
    bio: string;
    avatar: Asset;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
      website?: string;
    };
  };
}

export interface BlogCategorySkeleton extends EntrySkeletonType {
  contentTypeId: 'blogCategory';
  fields: {
    name: string;
    slug: string;
    description?: string;
    color?: string;
  };
}

export interface FeatureCategorySkeleton extends EntrySkeletonType {
  contentTypeId: 'featureCategory';
  fields: {
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    order: number;
  };
}

export interface BlogPostSkeleton extends EntrySkeletonType {
  contentTypeId: 'blogPost';
  fields: {
    title: string;
    slug: string;
    excerpt: string;
    content: Document;
    author: Entry<AuthorSkeleton>;
    category: Entry<BlogCategorySkeleton>;
    tags: string[];
    featuredImage: Asset;
    publishedAt: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string[];
  };
}

export interface FeatureSkeleton extends EntrySkeletonType {
  contentTypeId: 'feature';
  fields: {
    name: string;
    description: string;
    icon: string;
    screenshots: Asset[];
    benefits: string[];
    category: Entry<FeatureCategorySkeleton>;
    methodology?: Document;
    dataSources?: string[];
    relatedFeatures?: Entry<FeatureSkeleton>[];
  };
}

// Legacy field interfaces for backward compatibility
export type PageFields = PageSkeleton['fields'];
export type AuthorFields = AuthorSkeleton['fields'];
export type BlogCategoryFields = BlogCategorySkeleton['fields'];
export type FeatureCategoryFields = FeatureCategorySkeleton['fields'];
export type BlogPostFields = BlogPostSkeleton['fields'];
export type FeatureFields = FeatureSkeleton['fields'];

// Typed content entries
export type ContentfulPage = Entry<PageSkeleton>;
export type ContentfulBlogPost = Entry<BlogPostSkeleton>;
export type ContentfulFeature = Entry<FeatureSkeleton>;
export type ContentfulAuthor = Entry<AuthorSkeleton>;
export type ContentfulBlogCategory = Entry<BlogCategorySkeleton>;
export type ContentfulFeatureCategory = Entry<FeatureCategorySkeleton>;
export type ContentfulAsset = Asset;

// Utility function to get client based on preview mode
export function getContentfulClient(preview = false): ContentfulClient | null {
  return preview ? previewClient : client;
}

// Query options interface
export interface ContentfulQueryOptions {
  content_type: string;
  limit?: number;
  skip?: number;
  order?: string;
  include?: number;
  locale?: string;
  [key: string]: any;
}

// Generic fetch function with error handling
export async function fetchContentfulEntries<T extends EntrySkeletonType>(
  contentType: string,
  query: Omit<ContentfulQueryOptions, 'content_type'> = {},
  preview = false
): Promise<Entry<T>[]> {
  try {
    const client = getContentfulClient(preview);

    if (!client) {
      if (process.env.NODE_ENV !== 'production') {
        logger.warn(`[Contentful] '${contentType}' içerikleri için istemci bulunamadı. Boş sonuç dönüyor.`);
      }
      return [];
    }

    const response: EntryCollection<T> = await client.getEntries({
      content_type: contentType,
      ...query,
    });
    
    return response.items;
  } catch (error) {
    logger.error(`Error fetching ${contentType} entries:`, error);
    return [];
  }
}

// Generic fetch single entry function
export async function fetchContentfulEntry<T extends EntrySkeletonType>(
  contentType: string,
  slug: string,
  preview = false
): Promise<Entry<T> | null> {
  try {
    const client = getContentfulClient(preview);

    if (!client) {
      if (process.env.NODE_ENV !== 'production') {
        logger.warn(`[Contentful] '${contentType}' içeriği (${slug}) için istemci bulunamadı.`);
      }
      return null;
    }

    const response: EntryCollection<T> = await client.getEntries({
      content_type: contentType,
      limit: 1,
      ...({ 'fields.slug': slug } as any),
    });
    
    return response.items[0] || null;
  } catch (error) {
    logger.error(`Error fetching ${contentType} entry with slug ${slug}:`, error);
    return null;
  }
}

// Fetch entry by ID
export async function fetchContentfulEntryById<T extends EntrySkeletonType>(
  entryId: string,
  preview = false
): Promise<Entry<T> | null> {
  try {
    const client = getContentfulClient(preview);

    if (!client) {
      if (process.env.NODE_ENV !== 'production') {
        logger.warn(`[Contentful] ID'si ${entryId} olan kayıt için istemci bulunamadı.`);
      }
      return null;
    }

    const entry = await client.getEntry<T>(entryId);
    return entry;
  } catch (error) {
    logger.error(`Error fetching entry with ID ${entryId}:`, error);
    return null;
  }
}

// Fetch asset by ID
export async function fetchContentfulAsset(
  assetId: string,
  preview = false
): Promise<Asset | null> {
  try {
    const client = getContentfulClient(preview);

    if (!client) {
      if (process.env.NODE_ENV !== 'production') {
        logger.warn(`[Contentful] ID'si ${assetId} olan varlık için istemci bulunamadı.`);
      }
      return null;
    }

    const asset = await client.getAsset(assetId);
    return asset;
  } catch (error) {
    logger.error(`Error fetching asset with ID ${assetId}:`, error);
    return null;
  }
}

export { client as contentfulClient };
