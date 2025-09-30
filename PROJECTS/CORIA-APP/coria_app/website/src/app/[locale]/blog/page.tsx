import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { getBlogPosts, getBlogCategories } from '@/lib/cms/blog';
import { isContentfulConfigured } from '@/lib/contentful';
import BlogList from '@/components/blog/blog-list';
import BlogCategories from '@/components/blog/blog-categories';
import BlogSearch from '@/components/blog/blog-search';
import { Container } from '@/components/ui';
import { LocalizedPageProps } from '@/types/global';

interface BlogPageProps extends LocalizedPageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const { category, search, page } = params;
  const currentPage = parseInt(page || '1', 10);
  const postsPerPage = 12;
  const t = await getTranslations('blog');

  if (!isContentfulConfigured) {
    return (
      <Container className="py-16">
        <div className="mx-auto max-w-3xl text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {t('subtitle')}
          </p>
          <div className="rounded-3xl border border-dashed border-coria-primary/30 bg-white/80 p-8 shadow-sm dark:border-coria-primary/40 dark:bg-slate-900/70">
            <h2 className="text-2xl font-semibold text-coria-primary">
              {t('emptyState.title')}
            </h2>
            <p className="mt-3 text-base text-gray-600 dark:text-gray-300">
              {t('emptyState.description')}
            </p>
          </div>
        </div>
      </Container>
    );
  }
  
  // Fetch blog posts and categories
  const [posts, categories] = await Promise.all([
    getBlogPosts(undefined, category),
    getBlogCategories(),
  ]);
  
  // Filter posts by search if provided
  let filteredPosts = posts;
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPosts = posts.filter(
      post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  // Pagination
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);
  
  return (
    <Container className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          {t('subtitle')}
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {/* Search */}
            <Suspense fallback={<div className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />}>
              <BlogSearch initialValue={search} />
            </Suspense>
            
            {/* Categories */}
            <Suspense fallback={<div className="h-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />}>
              <BlogCategories 
                categories={categories} 
                activeCategory={category}
              />
            </Suspense>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Results Info */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-300">
              {search || category ? (
                <>
                  {t('resultsFound', { count: totalPosts })}
                  {search && (
                    <span className="ml-2">
                      {t('searchFor')} "<strong>{search}</strong>"
                    </span>
                  )}
                  {category && (
                    <span className="ml-2">
                      {t('inCategory')} "<strong>{categories.find(c => c.slug === category)?.name}</strong>"
                    </span>
                  )}
                </>
              ) : (
                t('allPosts', { count: totalPosts })
              )}
            </p>
          </div>
          
          {/* Blog Posts */}
          <Suspense fallback={<BlogListSkeleton />}>
            <BlogList 
              posts={paginatedPosts}
              currentPage={currentPage}
              totalPages={totalPages}
              totalPosts={totalPosts}
            />
          </Suspense>
        </div>
      </div>
    </Container>
  );
}

// Loading skeleton for blog list
function BlogListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="p-6 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
