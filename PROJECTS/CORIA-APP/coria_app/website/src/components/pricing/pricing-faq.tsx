'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Typography } from '@/components/ui/typography';
import { ChevronDownIcon } from '@/components/icons';

export function PricingFAQ() {
  const t = useTranslations('pricing');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: t('faq.questions.0.question'),
      answer: t('faq.questions.0.answer'),
    },
    {
      question: t('faq.questions.1.question'),
      answer: t('faq.questions.1.answer'),
    },
    {
      question: t('faq.questions.2.question'),
      answer: t('faq.questions.2.answer'),
    },
    {
      question: t('faq.questions.3.question'),
      answer: t('faq.questions.3.answer'),
    },
    {
      question: t('faq.questions.4.question'),
      answer: t('faq.questions.4.answer'),
    },
    {
      question: t('faq.questions.5.question'),
      answer: t('faq.questions.5.answer'),
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            {t('faq.title')}
          </Typography>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-[var(--foam)] rounded-lg overflow-hidden bg-[var(--foam)]/85 backdrop-blur-sm shadow-lg"
              >
                <button
                  className="w-full px-6 py-4 text-left hover:bg-[var(--foam)]/90 transition-colors duration-200 flex items-center justify-between"
                  onClick={() => toggleFAQ(index)}
                >
                  <Typography variant="large" className="font-medium pr-4">
                    {faq.question}
                  </Typography>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {openIndex === index && (
                  <div className="px-6 py-4 border-t border-[var(--foam)]">
                    <Typography variant="large" className="text-text-secondary">
                      {faq.answer}
                    </Typography>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}