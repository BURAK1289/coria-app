'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BlogCategory } from '@/lib/cms/blog';
import { useTranslations } from 'next-intl';

interface BlogCategoriesProps {
  categories: BlogCategory[];
  activeCategory?: string;
}

export default function BlogCategories({ categories, activeCategory }: BlogCategoriesProps) {
  const searchParams = useSearchParams();
  const t = useTranslations('blog');
  
  const createCategoryUrl = (categorySlug?: string) => {
    const params = new URLSearchParams(searchParams);
    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    params.delete('page'); // Reset pagination when changing category
    return `/blog?${params.toString()}`;
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t('categories')}
      </h3>
      
      <div className="space-y-2">
        {/* All Categories */}
        <Link
          href={createCategoryUrl()}
          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            !activeCategory
              ? 'bg-coria-green text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          {t('allCategories')}
        </Link>
        
        {/* Individual Categories */}
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={createCategoryUrl(category.slug)}
            className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeCategory === category.slug
                ? 'text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            style={{
              backgroundColor: activeCategory === category.slug 
                ? category.color || '#1B5E3F' 
                : undefined
            }}
          >
            <div className="flex items-center justify-between">
              <span>{category.name}</span>
              {category.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              )}
            </div>
            {category.description && (
              <p className="text-xs mt-1 opacity-75">
                {category.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}