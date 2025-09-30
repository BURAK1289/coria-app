'use client';

import { useTranslations, useMessages } from 'next-intl';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { getMessageArray } from '@/lib/messages';
import { isNonEmptyString, isValidObject } from '@/lib/type-guards';

interface ContactMethod {
  id: string;
  title: string;
  description: string;
  contact: string;
  icon: string;
  availability?: string;
  responseTime?: string;
}

function isContactMethod(value: unknown): value is ContactMethod {
  if (!isValidObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    isNonEmptyString(value.contact) &&
    isNonEmptyString(value.icon) &&
    (value.availability === undefined || isNonEmptyString(value.availability)) &&
    (value.responseTime === undefined || isNonEmptyString(value.responseTime))
  );
}

export function ContactMethods() {
  const t = useTranslations('contact.methods');
  const messages = useMessages();
  const contactMethods = getMessageArray(messages, ['contact', 'methods', 'list'], isContactMethod);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <Typography variant="h2" className="mb-4">
          {t('title')}
        </Typography>
        <Typography variant="body-large" className="text-gray-600 max-w-3xl mx-auto">
          {t('subtitle')}
        </Typography>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {contactMethods.map((method) => (
          <ContactMethodCard key={method.id} method={method} />
        ))}
      </div>

      {/* Emergency Contact */}
      <div className="mt-12 bg-gradient-to-r from-coral/10 to-coral/5 rounded-2xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <Typography variant="h3" className="mb-4 text-coral">
            {t('emergency.title')}
          </Typography>
          <Typography variant="body" className="text-gray-700 mb-6">
            {t('emergency.description')}
          </Typography>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${t('emergency.email')}`}
              className="bg-coral text-white px-6 py-3 rounded-lg font-semibold hover:bg-coral/90 transition-colors"
            >
              {t('emergency.contactNow')}
            </a>
            <a
              href={`tel:${t('emergency.phone')}`}
              className="bg-transparent border-2 border-coral text-coral px-6 py-3 rounded-lg font-semibold hover:bg-coral hover:text-white transition-colors"
            >
              {t('emergency.phone')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactMethodCard({ method }: { method: ContactMethod }) {
  const getMethodIcon = (iconName: string) => {
    switch (iconName) {
      case 'email':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'chat':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'phone':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'help':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'social':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
    }
  };

  const getContactLink = (method: ContactMethod) => {
    switch (method.icon) {
      case 'email':
        return `mailto:${method.contact}`;
      case 'phone':
        return `tel:${method.contact}`;
      case 'chat':
        return '#';
      default:
        return method.contact;
    }
  };

  return (
    <Card className="p-6 text-center hover:shadow-lg transition-shadow h-full">
      <div className="w-16 h-16 bg-coria-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-coria-green">
        {getMethodIcon(method.icon)}
      </div>
      
      <Typography variant="h4" className="mb-3">
        {method.title}
      </Typography>
      
      <Typography variant="body-small" className="text-gray-600 leading-relaxed mb-4">
        {method.description}
      </Typography>

      {method.availability && (
        <div className="mb-4">
          <Typography variant="body-small" className="text-gray-500">
            <strong>Availability:</strong> {method.availability}
          </Typography>
        </div>
      )}

      {method.responseTime && (
        <div className="mb-6">
          <Typography variant="body-small" className="text-gray-500">
            <strong>Response Time:</strong> {method.responseTime}
          </Typography>
        </div>
      )}
      
      <a
        href={getContactLink(method)}
        target={method.icon === 'social' ? '_blank' : undefined}
        rel={method.icon === 'social' ? 'noopener noreferrer' : undefined}
        className="inline-block bg-coria-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-coria-green/90 transition-colors"
      >
        {method.contact}
      </a>
    </Card>
  );
}
