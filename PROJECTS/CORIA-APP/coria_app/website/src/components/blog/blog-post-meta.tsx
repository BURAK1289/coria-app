'use client';

import Image from 'next/image';
import { CalendarIcon, ClockIcon, UserIcon } from '@heroicons/react/24/outline';
import { useLocale, useTranslations } from 'next-intl';

import { BlogPost } from '@/lib/cms/blog';
import { formatDate } from '@/lib/formatting';
import type { Locale } from '@/types/localization';

interface BlogPostMetaProps {
  post: BlogPost;
  className?: string;
}

interface RichTextNode {
  nodeType?: string;
  value?: string;
  content?: RichTextNode[];
}

const supportedLocales: ReadonlyArray<Locale> = ['tr', 'en', 'de', 'fr'];

const isLocale = (value: string): value is Locale => supportedLocales.some((item) => item === value);

const isRichTextNode = (value: unknown): value is RichTextNode => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const node = value as Partial<RichTextNode>;

  if (node.nodeType !== undefined && typeof node.nodeType !== 'string') {
    return false;
  }

  if (node.value !== undefined && typeof node.value !== 'string') {
    return false;
  }

  if (node.content === undefined) {
    return true;
  }

  if (!Array.isArray(node.content)) {
    return false;
  }

  return node.content.every(isRichTextNode);
};

const countWords = (node: RichTextNode): number => {
  const textWords = node.value ? node.value.trim().split(/\s+/).filter(Boolean).length : 0;
  const childWords = Array.isArray(node.content)
    ? node.content.reduce((total, child) => total + countWords(child), 0)
    : 0;

  return textWords + childWords;
};

const estimateReadingTime = (content: unknown): number => {
  if (!isRichTextNode(content)) {
    return 1;
  }

  const wordCount = countWords(content);
  return Math.max(1, Math.ceil(wordCount / 200));
};

export default function BlogPostMeta({ post, className = '' }: BlogPostMetaProps) {
  const locale = useLocale();
  const appLocale: Locale = isLocale(locale) ? locale : 'tr';
  const t = useTranslations('blog');

  const readingTime = estimateReadingTime(post.content);

  return (
    <div className={`flex flex-wrap items-center gap-6 text-sm text-gray-600 dark:text-gray-300 ${className}`}>
      {/* Author */}
      <div className="flex items-center space-x-3">
        <Image
          src={post.author.avatar.url}
          alt={post.author.avatar.alt}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <div className="flex items-center space-x-1">
            <UserIcon className="w-4 h-4" />
            <span className="font-medium text-gray-900 dark:text-white">
              {post.author.name}
            </span>
          </div>
        </div>
      </div>
      
      {/* Published Date */}
      <div className="flex items-center space-x-1">
        <CalendarIcon className="w-4 h-4" />
        <time dateTime={post.publishedAt.toISOString()}>
          {formatDate(post.publishedAt, appLocale)}
        </time>
      </div>
      
      {/* Reading Time */}
      <div className="flex items-center space-x-1">
        <ClockIcon className="w-4 h-4" />
        <span>
          {t('readingTime', { minutes: readingTime })}
        </span>
      </div>
      
      {/* Category */}
      <div className="flex items-center">
        <span className="text-gray-500 dark:text-gray-400 mr-2">in</span>
        <span 
          className="px-2 py-1 text-xs font-medium text-white rounded"
          style={{ backgroundColor: post.category.color || '#1B5E3F' }}
        >
          {post.category.name}
        </span>
      </div>
    </div>
  );
}
