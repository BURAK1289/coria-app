/**
 * Contentful CMS type definitions and augmentations
 */

import { Entry, Asset, EntrySkeletonType } from 'contentful';
import { LocalizedContent, ImageData, SEOMetadata } from './global';

// Contentful field types
export interface AuthorFields {
  contentTypeId: 'author';
  fields: {
    name: string;
    bio: LocalizedContent;
    avatar: Asset;
    social: {
      twitter?: string;
      linkedin?: string;
      github?: string;
      website?: string;
    };
  };
}

export interface BlogCategoryFields {
  contentTypeId: 'blogCategory';
  fields: {
    name: LocalizedContent;
    slug: string;
    description: LocalizedContent;
  };
}

export interface BlogPostFields {
  contentTypeId: 'blogPost';
  fields: {
    title: LocalizedContent;
    slug: string;
    excerpt: LocalizedContent;
    content: LocalizedContent;
    author: Entry<AuthorFields>;
    category: Entry<BlogCategoryFields>;
    tags: string[];
    featuredImage: Asset;
    publishedAt: string;
    updatedAt: string;
    seoTitle: LocalizedContent;
    seoDescription: LocalizedContent;
    seoKeywords: LocalizedContent;
    ogImage?: Asset;
  };
}

export interface FeatureCategoryFields {
  contentTypeId: 'featureCategory';
  fields: {
    name: LocalizedContent;
    slug: string;
    description: LocalizedContent;
    icon: string;
    order: number;
  };
}

export interface FeatureFields {
  contentTypeId: 'feature';
  fields: {
    name: LocalizedContent;
    description: LocalizedContent;
    icon: string;
    screenshots: Asset[];
    benefits: LocalizedContent[];
    category: Entry<FeatureCategoryFields>;
    methodology?: LocalizedContent;
    dataSources?: Array<{
      name: string;
      url: string;
      description: LocalizedContent;
    }>;
    relatedFeatures?: Entry<FeatureFields>[];
  };
}

export interface PageFields {
  contentTypeId: 'page';
  fields: {
    title: LocalizedContent;
    slug: string;
    content: LocalizedContent;
    seoTitle: LocalizedContent;
    seoDescription: LocalizedContent;
    seoKeywords: LocalizedContent;
    ogImage?: Asset;
    publishedAt: string;
    updatedAt: string;
  };
}



// Contentful entry types with proper skeleton structure
export interface AuthorSkeleton extends EntrySkeletonType {
  contentTypeId: 'author';
  fields: AuthorFields['fields'];
}

export interface BlogCategorySkeleton extends EntrySkeletonType {
  contentTypeId: 'blogCategory';
  fields: BlogCategoryFields['fields'];
}

export interface BlogPostSkeleton extends EntrySkeletonType {
  contentTypeId: 'blogPost';
  fields: BlogPostFields['fields'];
}

export interface FeatureCategorySkeleton extends EntrySkeletonType {
  contentTypeId: 'featureCategory';
  fields: FeatureCategoryFields['fields'];
}

export interface FeatureSkeleton extends EntrySkeletonType {
  contentTypeId: 'feature';
  fields: FeatureFields['fields'];
}

export interface PageSkeleton extends EntrySkeletonType {
  contentTypeId: 'page';
  fields: PageFields['fields'];
}

// Contentful entry types
export type ContentfulAuthor = Entry<AuthorSkeleton>;
export type ContentfulBlogCategory = Entry<BlogCategorySkeleton>;
export type ContentfulBlogPost = Entry<BlogPostSkeleton>;
export type ContentfulFeatureCategory = Entry<FeatureCategorySkeleton>;
export type ContentfulFeature = Entry<FeatureSkeleton>;
export type ContentfulPage = Entry<PageSkeleton>;

// Asset transformation helpers
export interface ContentfulAssetFile {
  url: string;
  details: {
    size: number;
    image?: {
      width: number;
      height: number;
    };
  };
  fileName: string;
  contentType: string;
}

export interface ContentfulAssetFields {
  title: string;
  description?: string;
  file: ContentfulAssetFile;
}

export type ContentfulAsset = Asset<ContentfulAssetFields>;

// Collection types
export interface ContentfulCollection<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

// Query options
export interface ContentfulQueryOptions {
  content_type?: string;
  'fields.slug'?: string;
  'sys.id'?: string;
  limit?: number;
  skip?: number;
  order?: string;
  include?: number;
  locale?: string;
  select?: string;
  [key: string]: any;
}

// Rich text content types
export interface RichTextContent {
  nodeType: string;
  data: any;
  content?: RichTextContent[];
  marks?: Array<{
    type: string;
  }>;
  value?: string;
}

export interface RichTextDocument {
  nodeType: 'document';
  data: {};
  content: RichTextContent[];
}

// Localized content helpers
export type ContentfulLocalizedField<T> = {
  [locale: string]: T;
};

// Error types
export interface ContentfulError {
  message: string;
  details?: {
    errors: Array<{
      name: string;
      value: string;
    }>;
  };
}

// Client configuration
export interface ContentfulClientConfig {
  space: string;
  accessToken: string;
  environment?: string;
  host?: string;
  basePath?: string;
  httpAgent?: any;
  httpsAgent?: any;
  adapter?: any;
  timeout?: number;
  retryLimit?: number;
  retryOnError?: boolean;
  logHandler?: (level: string, data?: any) => void;
  requestLogger?: (config: any) => void;
  responseLogger?: (response: any) => void;
}

export {};