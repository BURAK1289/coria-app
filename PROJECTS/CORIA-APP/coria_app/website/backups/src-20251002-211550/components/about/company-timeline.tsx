'use client';

import { useTranslations, useMessages } from 'next-intl';

import { Typography } from '@/components/ui/typography';
import { getMessageArray } from '@/lib/messages';
import { isNonEmptyString, isValidObject } from '@/lib/type-guards';

interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'launch' | 'achievement' | 'expansion';
}

type TimelineEventType = TimelineEvent['type'];

function isTimelineEvent(value: unknown): value is TimelineEvent {
  if (!isValidObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.date) &&
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    (['milestone', 'launch', 'achievement', 'expansion'] as const).includes(
      value.type as TimelineEventType,
    )
  );
}

export function CompanyTimeline() {
  const t = useTranslations('about.timeline');
  const messages = useMessages();
  const timelineEvents = getMessageArray(messages, ['about', 'timeline', 'events'], isTimelineEvent);

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

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-coria-green via-water to-leaf"></div>

        <div className="space-y-12">
          {timelineEvents.map((event, index) => (
            <TimelineEventItem
              key={event.id}
              event={event}
              isLast={index === timelineEvents.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Future Vision */}
      <div className="mt-16 bg-gradient-to-r from-coria-green/5 to-water/5 rounded-2xl p-8">
        <div className="text-center">
          <Typography variant="h3" className="mb-4 text-coria-green">
            {t('future.title')}
          </Typography>
          <Typography variant="body-large" className="text-gray-700 leading-relaxed">
            {t('future.description')}
          </Typography>
        </div>
      </div>
    </div>
  );
}

function TimelineEventItem({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const getEventIcon = (type: TimelineEventType) => {
    switch (type) {
      case 'milestone':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'launch':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      case 'achievement':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'expansion':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getEventColor = (type: TimelineEventType) => {
    switch (type) {
      case 'milestone':
        return 'text-coria-green bg-coria-green/10 border-coria-green/20';
      case 'launch':
        return 'text-coral bg-coral/10 border-coral/20';
      case 'achievement':
        return 'text-leaf bg-leaf/10 border-leaf/20';
      case 'expansion':
        return 'text-water bg-water/10 border-water/20';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  return (
    <div className="relative flex items-start">
      {/* Timeline Node */}
      <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 ${getEventColor(event.type)}`}>
        {getEventIcon(event.type)}
      </div>

      {/* Content */}
      <div className="ml-8 flex-1">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Typography variant="body-small" className="text-gray-500 font-medium">
              {event.date}
            </Typography>
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getEventColor(event.type)}`}>
              {event.type}
            </span>
          </div>
          
          <Typography variant="h4" className="mb-3">
            {event.title}
          </Typography>
          
          <Typography variant="body" className="text-gray-700 leading-relaxed">
            {event.description}
          </Typography>
        </div>
      </div>

      {/* Visual connector for last element spacing */}
      {isLast && <span className="sr-only">Timeline end marker</span>}
    </div>
  );
}
