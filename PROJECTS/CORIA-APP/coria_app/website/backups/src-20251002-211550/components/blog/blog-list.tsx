'use client';

import { BlogPost } from '@/lib/cms/blog';
import BlogCard from './blog-card';
import BlogPagination from './blog-pagination';

interface BlogListProps {
  posts: BlogPost[];
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

export default function BlogList({ 
  posts, 
  currentPage, 
  totalPages, 
  totalPosts 
}: BlogListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No posts found
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <BlogPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalPosts={totalPosts}
        />
      )}
    </div>
  );
}