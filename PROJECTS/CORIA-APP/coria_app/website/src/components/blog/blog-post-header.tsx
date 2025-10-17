'use client';

import { BlogPost } from '@/lib/cms/blog';

interface BlogPostHeaderProps {
  post: BlogPost;
}

export default function BlogPostHeader({ post }: BlogPostHeaderProps) {
  return (
    <div className="text-white">
      {/* Category */}
      <div className="mb-4">
        <span 
          className="inline-block px-3 py-1 text-sm font-medium rounded-full"
          style={{ backgroundColor: post.category.color || 'var(--coria-primary)' }}
        >
          {post.category.name}
        </span>
      </div>
      
      {/* Title */}
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
        {post.title}
      </h1>
      
      {/* Excerpt */}
      <p className="text-xl md:text-2xl text-gray-200 mb-6 max-w-4xl">
        {post.excerpt}
      </p>
    </div>
  );
}