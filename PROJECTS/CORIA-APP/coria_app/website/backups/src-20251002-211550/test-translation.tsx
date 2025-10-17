
'use client';

import { useTranslations } from 'next-intl';

export function TestTranslation() {
  const t = useTranslations('about.timeline');
  // Use useMessages to get raw translation data
  const timelineEvents = t('events');

  return (
    <div>
      <pre>{JSON.stringify(timelineEvents, null, 2)}</pre>
    </div>
  );
}
