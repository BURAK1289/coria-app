'use client';

import { useTranslations, useMessages } from 'next-intl';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { getMessageArray } from '@/lib/messages';
import { isNonEmptyString, isValidArray, isValidObject } from '@/lib/type-guards';

interface Value {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface CommitmentMetric {
  value: string;
  label: string;
}

interface Commitment {
  id: string;
  title: string;
  description: string;
  metrics: CommitmentMetric[];
}

function isCommitmentMetric(value: unknown): value is CommitmentMetric {
  if (!isValidObject(value)) {
    return false;
  }

  return isNonEmptyString(value.value) && isNonEmptyString(value.label);
}

function isValueItem(value: unknown): value is Value {
  if (!isValidObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    isNonEmptyString(value.icon)
  );
}

function isCommitmentItem(value: unknown): value is Commitment {
  if (!isValidObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    isValidArray(value.metrics) &&
    value.metrics.every(isCommitmentMetric)
  );
}

export function ValuesCommitment() {
  const t = useTranslations('about.values');
  const messages = useMessages();
  const values = getMessageArray(messages, ['about', 'values', 'list'], isValueItem);
  const commitments = getMessageArray(messages, ['about', 'values', 'commitments'], isCommitmentItem);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Values Section */}
      <div className="mb-16">
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            {t('title')}
          </Typography>
          <Typography variant="body-large" className="text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </Typography>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value) => (
            <ValueCard key={value.id} value={value} />
          ))}
        </div>
      </div>

      {/* Sustainability Commitments */}
      <div>
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            {t('sustainability.title')}
          </Typography>
          <Typography variant="body-large" className="text-gray-600 max-w-3xl mx-auto">
            {t('sustainability.subtitle')}
          </Typography>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {commitments.map((commitment) => (
            <CommitmentCard key={commitment.id} commitment={commitment} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-coria-green to-water rounded-2xl p-8 text-white text-center">
          <Typography variant="h3" className="mb-4">
            {t('cta.title')}
          </Typography>
          <Typography variant="body-large" className="mb-6 text-white/90">
            {t('cta.description')}
          </Typography>
          <button className="bg-white text-coria-green px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            {t('cta.action')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ValueCard({ value }: { value: Value }) {
  const getValueIcon = (iconName: string) => {
    switch (iconName) {
      case 'sustainability':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
        );
      case 'transparency':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case 'innovation':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'community':
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
    }
  };

  return (
    <Card className="p-6 text-center hover:shadow-lg transition-shadow h-full">
      <div className="w-16 h-16 bg-coria-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-coria-green">
        {getValueIcon(value.icon)}
      </div>
      
      <Typography variant="h4" className="mb-3">
        {value.title}
      </Typography>
      
      <Typography variant="body-small" className="text-gray-600 leading-relaxed">
        {value.description}
      </Typography>
    </Card>
  );
}

function CommitmentCard({ commitment }: { commitment: Commitment }) {
  return (
    <Card className="p-8 h-full">
      <Typography variant="h3" className="mb-4 text-coria-green">
        {commitment.title}
      </Typography>
      
      <Typography variant="body" className="text-gray-700 leading-relaxed mb-6">
        {commitment.description}
      </Typography>
      
      <div className="grid grid-cols-2 gap-4">
        {commitment.metrics.map((metric) => (
          <div key={`${commitment.id}-${metric.label}`} className="text-center p-4 bg-gray-50 rounded-lg">
            <Typography variant="h3" className="text-coria-green mb-1">
              {metric.value}
            </Typography>
            <Typography variant="body-small" className="text-gray-600">
              {metric.label}
            </Typography>
          </div>
        ))}
      </div>
    </Card>
  );
}
