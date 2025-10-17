import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { getBlogPostBySlug, getRelatedBlogPosts, getBlogPostSlugs } from '@/lib/cms/blog';
import { Container } from '@/components/ui';
import RichTextRenderer from '@/components/cms/rich-text-renderer';
import BlogPostHeader from '@/components/blog/blog-post-header';
import BlogPostMeta from '@/components/blog/blog-post-meta';
import RelatedPosts from '@/components/blog/related-posts';
import BlogPostNavigation from '@/components/blog/blog-post-navigation';
import Image from 'next/image';

import { BlogPageProps } from '@/types/global';

interface BlogPostPageProps extends BlogPageProps {}

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  return {
    title: post.seo.title || post.title,
    description: post.seo.description || post.excerpt,
    keywords: post.seo.keywords || post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.seo.title || post.title,
      description: post.seo.description || post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt.toISOString(),
      authors: [post.author.name],
      images: [
        {
          url: post.featuredImage.url,
          width: post.featuredImage.width,
          height: post.featuredImage.height,
          alt: post.featuredImage.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo.title || post.title,
      description: post.seo.description || post.excerpt,
      images: [post.featuredImage.url],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  
  if (!post) {
    notFound();
  }
  
  // Get related posts
  const relatedPosts = await getRelatedBlogPosts(
    post.slug,
    post.category.slug,
    3
  );
  
  const t = useTranslations('blog');
  
  return (
    <article>
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <Image
          src={post.featuredImage.url}
          alt={post.featuredImage.alt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-end">
          <Container className="pb-12">
            <BlogPostHeader post={post} />
          </Container>
        </div>
      </div>
      
      {/* Content */}
      <Container className="py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Post Meta */}
            <BlogPostMeta post={post} className="mb-8" />
            
            {/* Post Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <RichTextRenderer document={post.content} />
            </div>
            
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  {t('tags')}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Author Bio */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-start space-x-4">
                <Image
                  src={post.author.avatar.url}
                  alt={post.author.avatar.alt}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {post.author.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {post.author.bio}
                  </p>
                  {post.author.socialLinks && (
                    <div className="flex space-x-4 mt-3">
                      {post.author.socialLinks.twitter && (
                        <a
                          href={post.author.socialLinks.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-600"
                        >
                          Twitter
                        </a>
                      )}
                      {post.author.socialLinks.linkedin && (
                        <a
                          href={post.author.socialLinks.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-800"
                        >
                          LinkedIn
                        </a>
                      )}
                      {post.author.socialLinks.website && (
                        <a
                          href={post.author.socialLinks.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-coria-green hover:text-coria-green/80"
                        >
                          Website
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BlogPostNavigation />
            </div>
          </div>
        </div>
        
        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-gray-200 dark:border-gray-700">
            <RelatedPosts posts={relatedPosts} />
          </div>
        )}
      </Container>
    </article>
  );
}