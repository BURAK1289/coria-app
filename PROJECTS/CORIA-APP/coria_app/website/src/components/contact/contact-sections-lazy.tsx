'use client';

import dynamic from 'next/dynamic';

// Lazy load heavy contact components
export const ContactFormLazy = dynamic(
  () => import('./contact-form').then((mod) => ({ default: mod.ContactForm })),
  {
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading form...</div>
      </div>
    ),
    ssr: false,
  }
);

export const ContactMethodsLazy = dynamic(
  () => import('./contact-methods').then((mod) => ({ default: mod.ContactMethods })),
  {
    loading: () => (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    ),
  }
);

export const ContactFAQLazy = dynamic(
  () => import('./contact-faq').then((mod) => ({ default: mod.ContactFAQ })),
  {
    loading: () => (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading FAQs...</div>
      </div>
    ),
  }
);

export const SupportTicketingLazy = dynamic(
  () => import('./support-ticketing').then((mod) => ({ default: mod.SupportTicketing })),
  {
    loading: () => (
      <div className="min-h-[300px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading support options...</div>
      </div>
    ),
    ssr: false,
  }
);
