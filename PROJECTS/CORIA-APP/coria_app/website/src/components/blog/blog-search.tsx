'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface BlogSearchProps {
  initialValue?: string;
}

export default function BlogSearch({ initialValue = '' }: BlogSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('blog');
  
  useEffect(() => {
    setSearchTerm(initialValue);
  }, [initialValue]);
  
  const handleSearch = (term: string) => {
    setIsSearching(true);
    const params = new URLSearchParams(searchParams || undefined);
    
    if (term.trim()) {
      params.set('search', term.trim());
    } else {
      params.delete('search');
    }
    
    params.delete('page'); // Reset pagination when searching
    
    router.push(`/blog?${params.toString()}`);
    
    // Reset searching state after a short delay
    setTimeout(() => setIsSearching(false), 500);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchTerm);
  };
  
  const handleClear = () => {
    setSearchTerm('');
    handleSearch('');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('search')}
      </h3>
      
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-coria-green focus:border-transparent"
          />
          
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon 
              className={`h-5 w-5 text-gray-400 ${isSearching ? 'animate-pulse' : ''}`} 
            />
          </div>
          
          {/* Clear Button */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
        
        {/* Search Button */}
        <button
          type="submit"
          disabled={isSearching}
          className="w-full mt-3 px-4 py-2 bg-coria-green text-white rounded-md hover:bg-coria-green/90 focus:ring-2 focus:ring-coria-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? t('searching') : t('searchButton')}
        </button>
      </form>
      
      {/* Search Tips */}
      <div className="mt-4 text-xs text-gray-500">
        <p>{t('searchTips')}</p>
      </div>
    </div>
  );
}