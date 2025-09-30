'use client';

import { useState } from 'react';
import { useTranslations, useMessages } from 'next-intl';

import { Typography } from '@/components/ui/typography';
import { getMessageArray } from '@/lib/messages';
import { isNonEmptyString, isValidObject } from '@/lib/type-guards';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

interface FAQCategory {
  id: string;
  name: string;
}

function isFaqItem(value: unknown): value is FAQItem {
  if (!isValidObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.question) &&
    isNonEmptyString(value.answer) &&
    isNonEmptyString(value.category)
  );
}

function isFaqCategory(value: unknown): value is FAQCategory {
  if (!isValidObject(value)) {
    return false;
  }

  return isNonEmptyString(value.id) && isNonEmptyString(value.name);
}

export function ContactFAQ() {
  const t = useTranslations('contact.faq');
  const messages = useMessages();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const faqItems = getMessageArray(messages, ['contact', 'faq', 'items'], isFaqItem);
  const categories = getMessageArray(messages, ['contact', 'faq', 'categories'], isFaqCategory);

  const filteredFAQs = faqItems.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query);
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((current) => {
      const next = new Set(current);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <Typography variant="h2" className="mb-4">
          {t('title')}
        </Typography>
        <Typography variant="body-large" className="text-gray-600 max-w-3xl mx-auto">
          {t('subtitle')}
        </Typography>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coria-green focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-coria-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {t('allCategories')}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-coria-green text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search Results Info */}
      {searchQuery && (
        <div className="mb-6">
          <Typography variant="body-small" className="text-gray-600">
            {t('searchResults', { count: filteredFAQs.length, query: searchQuery })}
          </Typography>
        </div>
      )}

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.291-1.1-5.291-2.709M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <Typography variant="h4" className="mb-2 text-gray-500">
              {t('noResults.title')}
            </Typography>
            <Typography variant="body" className="text-gray-400 mb-6">
              {t('noResults.description')}
            </Typography>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="bg-coria-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-coria-green/90 transition-colors"
            >
              {t('noResults.clearFilters')}
            </button>
          </div>
        ) : (
          filteredFAQs.map((item) => (
            <FAQItem
              key={item.id}
              item={item}
              isExpanded={expandedItems.has(item.id)}
              onToggle={() => toggleExpanded(item.id)}
            />
          ))
        )}
      </div>

      {/* Still Need Help */}
      <div className="mt-12 bg-gradient-to-r from-coria-green/5 to-water/5 rounded-2xl p-8 text-center">
        <Typography variant="h3" className="mb-4 text-coria-green">
          {t('stillNeedHelp.title')}
        </Typography>
        <Typography variant="body" className="text-gray-700 mb-6">
          {t('stillNeedHelp.description')}
        </Typography>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact-form"
            className="bg-coria-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-coria-green/90 transition-colors"
          >
            {t('stillNeedHelp.contactUs')}
          </a>
          <a
            href="mailto:support@coria.app"
            className="bg-transparent border-2 border-coria-green text-coria-green px-6 py-3 rounded-lg font-semibold hover:bg-coria-green hover:text-white transition-colors"
          >
            {t('stillNeedHelp.emailSupport')}
          </a>
        </div>
      </div>
    </div>
  );
}

function FAQItem({
  item,
  isExpanded,
  onToggle,
}: {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left bg-white hover:bg-gray-50 transition-colors flex items-center justify-between"
      >
        <Typography variant="h4" className="pr-4">
          {item.question}
        </Typography>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Typography variant="body" className="text-gray-600">
            {item.answer}
          </Typography>
        </div>
      )}
    </div>
  );
}
