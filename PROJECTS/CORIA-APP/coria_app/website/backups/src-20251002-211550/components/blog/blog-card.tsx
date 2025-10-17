'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLocale } from 'next-intl';

import { BlogPost } from '@/lib/cms/blog';
import { formatDate } from '@/lib/formatting';
import type { Locale } from '@/types/localization';

interface BlogCardProps {
  post: BlogPost;
}

const supportedLocales: ReadonlyArray<Locale> = ['tr', 'en', 'de', 'fr'];

const isLocale = (value: string): value is Locale => supportedLocales.some((item) => item === value);

export default function BlogCard({ post }: BlogCardProps) {
  const locale = useLocale();
  const appLocale: Locale = isLocale(locale) ? locale : 'tr';
  
  return (
    <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/blog/${post.slug}`}>
        <div className="relative h-48 overflow-hidden">
          <Image
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <span 
              className="px-3 py-1 text-xs font-medium text-white rounded-full"
              style={{ backgroundColor: post.category.color || '#1B5E3F' }}
            >
              {post.category.name}
            </span>
          </div>
        </div>
      </Link>
      
      <div className="p-6">
        {/* Meta Info */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
          <time dateTime={post.publishedAt.toISOString()}>
            {formatDate(post.publishedAt, appLocale)}
          </time>
          <span className="mx-2">•</span>
          <span>{post.author.name}</span>
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2">
          <Link 
            href={`/blog/${post.slug}`}
            className="hover:text-coria-green transition-colors"
          >
            {post.title}
          </Link>
        </h2>
        
        {/* Excerpt */}
        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {/* Read More */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-coria-green hover:text-coria-green/80 font-medium text-sm transition-colors"
        >
          Read more
          <svg
            className="ml-1 w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
}
