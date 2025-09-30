import { 
  fetchContentfulEntry, 
  fetchContentfulEntries, 
  ContentfulBlogPost,
  ContentfulBlogCategory,
  ContentfulAuthor,
  ContentfulAsset,
  BlogPostSkeleton,
  BlogCategorySkeleton,
  AuthorSkeleton
} from '../contentful';
import { Asset, Entry } from 'contentful';

export interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  content: any; // Rich text document
  author: Author;
  category: BlogCategory;
  tags: string[];
  featuredImage: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  publishedAt: Date;
  seo: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

export interface Author {
  name: string;
  bio: string;
  avatar: {
    url: string;
    alt: string;
  };
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface BlogCategory {
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

// Type guards
function isAsset(item: any): item is Asset {
  return item && item.sys && item.sys.type === 'Asset' && item.fields && item.fields.file;
}

// Transform functions
function transformAuthor(contentfulAuthor: Entry<AuthorSkeleton>): Author {
  const avatar = contentfulAuthor.fields.avatar;
  
  if (!isAsset(avatar)) {
    throw new Error('Invalid avatar asset');
  }

  const file = avatar.fields.file;
  if (!file) {
    throw new Error('Avatar file is missing');
  }

  const title = typeof avatar.fields.title === 'string' ? avatar.fields.title : '';
  const description = typeof avatar.fields.description === 'string' ? avatar.fields.description : '';

  return {
    name: contentfulAuthor.fields.name as unknown as string,
    bio: contentfulAuthor.fields.bio as unknown as string,
    avatar: {
      url: `https:${file.url}`,
      alt: title || description || 'Author avatar',
    },
    socialLinks: contentfulAuthor.fields.socialLinks,
  };
}

function transformBlogCategory(contentfulCategory: Entry<BlogCategorySkeleton>): BlogCategory {
  return {
    name: contentfulCategory.fields.name as unknown as string,
    slug: contentfulCategory.fields.slug as unknown as string,
    description: contentfulCategory.fields.description as unknown as string | undefined,
    color: contentfulCategory.fields.color as unknown as string | undefined,
  };
}

function transformBlogPost(contentfulPost: Entry<BlogPostSkeleton>): BlogPost {
  const featuredImage = contentfulPost.fields.featuredImage;
  
  if (!isAsset(featuredImage)) {
    throw new Error('Invalid featured image asset');
  }

  const file = featuredImage.fields.file;
  if (!file) {
    throw new Error('Featured image file is missing');
  }

  const title = typeof featuredImage.fields.title === 'string' ? featuredImage.fields.title : '';
  const description = typeof featuredImage.fields.description === 'string' ? featuredImage.fields.description : '';

  // Safely access image details
  const imageDetails = file.details && 'image' in file.details ? file.details.image : undefined;

  return {
    title: contentfulPost.fields.title as unknown as string,
    slug: contentfulPost.fields.slug as unknown as string,
    excerpt: contentfulPost.fields.excerpt as unknown as string,
    content: contentfulPost.fields.content,
    author: transformAuthor(contentfulPost.fields.author as any),
    category: transformBlogCategory(contentfulPost.fields.category as any),
    tags: contentfulPost.fields.tags as unknown as string[],
    featuredImage: {
      url: `https:${file.url}`,
      alt: title || description || 'Blog post image',
      width: imageDetails?.width,
      height: imageDetails?.height,
    },
    publishedAt: new Date(contentfulPost.fields.publishedAt as unknown as string),
    seo: {
      title: contentfulPost.fields.seoTitle as unknown as string | undefined,
      description: contentfulPost.fields.seoDescription as unknown as string | undefined,
      keywords: contentfulPost.fields.seoKeywords as unknown as string[] | undefined,
    },
  };
}

// Get all blog posts
export async function getBlogPosts(
  limit?: number,
  category?: string | null,
  preview = false
): Promise<BlogPost[]> {
  const query: Record<string, any> = {
    order: '-fields.publishedAt',
    include: 2, // Include linked entries
  };
  
  if (limit) {
    query.limit = limit;
  }
  
  if (category) {
    query['fields.category.fields.slug'] = category;
  }
  
  const contentfulPosts = await fetchContentfulEntries<BlogPostSkeleton>(
    'blogPost',
    query,
    preview
  );
  
  return contentfulPosts.map(transformBlogPost);
}

// Get blog post by slug
export async function getBlogPostBySlug(slug: string, preview = false): Promise<BlogPost | null> {
  const contentfulPost = await fetchContentfulEntry<BlogPostSkeleton>('blogPost', slug, preview);
  
  if (!contentfulPost) {
    return null;
  }
  
  return transformBlogPost(contentfulPost);
}

// Get blog categories
export async function getBlogCategories(preview = false): Promise<BlogCategory[]> {
  const contentfulCategories = await fetchContentfulEntries<BlogCategorySkeleton>(
    'blogCategory',
    { order: 'fields.name' },
    preview
  );
  
  return contentfulCategories.map(transformBlogCategory);
}

// Get related blog posts
export async function getRelatedBlogPosts(
  currentSlug: string,
  category: string,
  limit = 3,
  preview = false
): Promise<BlogPost[]> {
  const contentfulPosts = await fetchContentfulEntries<BlogPostSkeleton>(
    'blogPost',
    {
      'fields.category.fields.slug': category,
      'fields.slug[ne]': currentSlug, // Exclude current post
      order: '-fields.publishedAt',
      limit,
      include: 2,
    },
    preview
  );
  
  return contentfulPosts.map(transformBlogPost);
}

// Search blog posts
export async function searchBlogPosts(
  query: string,
  limit = 10,
  preview = false
): Promise<BlogPost[]> {
  const contentfulPosts = await fetchContentfulEntries<BlogPostSkeleton>(
    'blogPost',
    {
      query,
      order: '-fields.publishedAt',
      limit,
      include: 2,
    },
    preview
  );
  
  return contentfulPosts.map(transformBlogPost);
}

// Get blog post slugs for static generation
export async function getBlogPostSlugs(): Promise<string[]> {
  const posts = await getBlogPosts();
  return posts.map(post => post.slug);
}