'use client';

import { useTranslations, useMessages } from 'next-intl';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { getStringArray } from '@/lib/messages';

export function MissionVision() {
  const t = useTranslations('about.missionVision');
  const messages = useMessages();
  const missionPoints = getStringArray(messages, ['about', 'missionVision', 'mission', 'points']);
  const visionPoints = getStringArray(messages, ['about', 'missionVision', 'vision', 'points']);

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

      <div className="grid md:grid-cols-2 gap-8">
        {/* Mission */}
        <Card className="p-8 h-full">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-coria-green/10 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-coria-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <Typography variant="h3" className="text-coria-green">
              {t('mission.title')}
            </Typography>
          </div>
          <Typography variant="body" className="text-gray-700 leading-relaxed mb-6">
            {t('mission.description')}
          </Typography>
          <div className="space-y-3">
            {missionPoints.map((point) => (
              <div key={point} className="flex items-start">
                <div className="w-2 h-2 bg-coria-green rounded-full mt-2 mr-3 flex-shrink-0" />
                <Typography variant="body-small" className="text-gray-600">
                  {point}
                </Typography>
              </div>
            ))}
          </div>
        </Card>

        {/* Vision */}
        <Card className="p-8 h-full">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-water/10 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-water" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <Typography variant="h3" className="text-water">
              {t('vision.title')}
            </Typography>
          </div>
          <Typography variant="body" className="text-gray-700 leading-relaxed mb-6">
            {t('vision.description')}
          </Typography>
          <div className="space-y-3">
            {visionPoints.map((point) => (
              <div key={point} className="flex items-start">
                <div className="w-2 h-2 bg-water rounded-full mt-2 mr-3 flex-shrink-0" />
                <Typography variant="body-small" className="text-gray-600">
                  {point}
                </Typography>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
