'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
}

export default function BlogPagination({ 
  currentPage, 
  totalPages, 
  totalPosts 
}: BlogPaginationProps) {
  const searchParams = useSearchParams();
  const t = useTranslations('blog');
  
  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    return `/blog?${params.toString()}`;
  };
  
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }
    
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }
    
    rangeWithDots.push(...range);
    
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }
    
    return rangeWithDots;
  };
  
  if (totalPages <= 1) return null;
  
  const visiblePages = getVisiblePages();
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Results Info */}
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {t('paginationInfo', {
          start: (currentPage - 1) * 12 + 1,
          end: Math.min(currentPage * 12, totalPosts),
          total: totalPosts,
        })}
      </p>
      
      {/* Pagination Controls */}
      <nav className="flex items-center space-x-1">
        {/* Previous Button */}
        {currentPage > 1 ? (
          <Link
            href={createPageUrl(currentPage - 1)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            {t('previous')}
          </Link>
        ) : (
          <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md cursor-not-allowed">
            <ChevronLeftIcon className="w-4 h-4 mr-1" />
            {t('previous')}
          </span>
        )}
        
        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                >
                  ...
                </span>
              );
            }
            
            const pageNumber = page as number;
            const isActive = pageNumber === currentPage;
            
            return (
              <Link
                key={pageNumber}
                href={createPageUrl(pageNumber)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-coria-green text-white'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {pageNumber}
              </Link>
            );
          })}
        </div>
        
        {/* Next Button */}
        {currentPage < totalPages ? (
          <Link
            href={createPageUrl(currentPage + 1)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {t('next')}
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Link>
        ) : (
          <span className="flex items-center px-3 py-2 text-sm font-medium text-gray-300 dark:text-gray-600 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md cursor-not-allowed">
            {t('next')}
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </span>
        )}
      </nav>
    </div>
  );
}