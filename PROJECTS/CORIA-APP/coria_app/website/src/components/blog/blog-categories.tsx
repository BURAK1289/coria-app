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
    const params = new URLSearchParams(searchParams || undefined);
    if (categorySlug) {
      params.set('category', categorySlug);
    } else {
      params.delete('category');
    }
    params.delete('page'); // Reset pagination when changing category
    return `/blog?${params.toString()}`;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('categories')}
      </h3>
      
      <div className="space-y-2">
        {/* All Categories */}
        <Link
          href={createCategoryUrl()}
          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            !activeCategory
              ? 'bg-coria-green text-white'
              : 'text-gray-700 hover:bg-gray-100'
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
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            style={{
              backgroundColor: activeCategory === category.slug 
                ? category.color || 'var(--coria-primary)' 
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