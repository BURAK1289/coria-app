import { fetchContentfulEntry, fetchContentfulEntries, ContentfulPage, PageSkeleton } from '../contentful';
import { Entry } from 'contentful';

export interface Page {
  title: string;
  slug: string;
  content: any; // Rich text document
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  publishedAt: Date;
  updatedAt: Date;
}

// Transform Contentful page to our Page interface
function transformPage(contentfulPage: Entry<PageSkeleton>): Page {
  const ogImageUrl = (contentfulPage.fields.ogImage as any)?.fields?.file?.url;
  
  return {
    title: contentfulPage.fields.title as unknown as string,
    slug: contentfulPage.fields.slug as unknown as string,
    content: contentfulPage.fields.content,
    seo: {
      title: contentfulPage.fields.seoTitle as unknown as string | undefined,
      description: contentfulPage.fields.seoDescription as unknown as string | undefined,
      keywords: contentfulPage.fields.seoKeywords as unknown as string[] | undefined,
      ogImage: ogImageUrl ? `https:${ogImageUrl}` : undefined,
    },
    publishedAt: new Date(contentfulPage.fields.publishedAt as unknown as string),
    updatedAt: new Date(contentfulPage.fields.updatedAt as unknown as string),
  };
}

// Get all pages
export async function getPages(preview = false): Promise<Page[]> {
  const contentfulPages = await fetchContentfulEntries<PageSkeleton>(
    'page',
    { order: '-fields.publishedAt' },
    preview
  );
  
  return contentfulPages.map(transformPage);
}

// Get page by slug
export async function getPageBySlug(slug: string, preview = false): Promise<Page | null> {
  const contentfulPage = await fetchContentfulEntry<PageSkeleton>('page', slug, preview);
  
  if (!contentfulPage) {
    return null;
  }
  
  return transformPage(contentfulPage);
}

// Get page slugs for static generation
export async function getPageSlugs(): Promise<string[]> {
  const pages = await getPages();
  return pages.map(page => page.slug);
}