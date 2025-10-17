'use client';

import { BlogPost } from '@/lib/cms/blog';
import { useTranslations } from 'next-intl';
import BlogCard from './blog-card';

interface RelatedPostsProps {
  posts: BlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  const t = useTranslations('blog');
  
  if (posts.length === 0) {
    return null;
  }
  
  return (
    <section>
      <h2 className="text-3xl font-bold text-gray-900 mb-8">
        {t('relatedPosts')}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
}