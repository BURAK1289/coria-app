'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading, Text } from '@/components/ui/typography';
import {
  LeafIcon,
  HeartIcon,
  UsersIcon,
  ShieldIcon,
  BarChart3Icon,
  InfoIcon,
} from 'lucide-react';

interface MethodologyExplanationProps {
  feature: string;
}

const scoringCriteria = {
  'environmental-score': {
    icon: LeafIcon,
    accent: 'text-coria-primary',
    bg: 'bg-coria-primary/12',
    factors: [
      'Carbon footprint during production',
      'Water usage and pollution',
      'Packaging sustainability',
      'Transportation impact',
      'End-of-life disposal',
    ],
  },
  'social-impact': {
    icon: UsersIcon,
    accent: 'text-water',
    bg: 'bg-water/12',
    factors: [
      'Fair labor practices',
      'Community impact',
      'Supply chain transparency',
      'Worker safety standards',
      'Local economic contribution',
    ],
  },
  'health-rating': {
    icon: HeartIcon,
    accent: 'text-coria-accent',
    bg: 'bg-coria-accent/12',
    factors: [
      'Nutritional value',
      'Additive content',
      'Processing level',
      'Allergen information',
      'Health claims verification',
    ],
  },
  'ethical-production': {
    icon: ShieldIcon,
    accent: 'text-coria-primary-dark',
    bg: 'bg-coria-primary-light/12',
    factors: [
      'Animal welfare standards',
      'Organic certification',
      'Fair trade compliance',
      'Ethical sourcing',
      'Corporate responsibility',
    ],
  },
} as const;

export function MethodologyExplanation({ feature }: MethodologyExplanationProps) {
  const t = useTranslations('features');

  const criteria = scoringCriteria[feature as keyof typeof scoringCriteria];

  if (!criteria) {
    return null;
  }

  const Icon = criteria.icon;

  return (
    <section className="space-y-10">
      <div className="text-center space-y-4">
        <Heading as="h3" size="2xl" weight="bold" className="text-coria-primary">
          {t('methodology.title')}
        </Heading>
        <Text size="lg" color="secondary" className="mx-auto max-w-2xl text-gray-600">
          {t(`methodology.${feature}.description`)}
        </Text>
      </div>

      <Card className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_35px_90px_-65px_rgba(27,94,63,0.45)]">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <span className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${criteria.bg} ${criteria.accent}`}>
            <Icon className="h-6 w-6" />
          </span>
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Heading as="h4" size="lg" weight="semibold" className="text-coria-primary">
                {t(`features.${feature}.title`)} {t('methodology.scoringSystem')}
              </Heading>
              <Text size="sm" color="secondary" className="text-gray-600">
                {t(`methodology.${feature}.overview`)}
              </Text>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="rounded-2xl border border-white/70 bg-white/90 p-4">
                <Heading as="h5" size="sm" weight="semibold" className="uppercase tracking-wider text-coria-primary">
                  {t('methodology.scoringRange')}
                </Heading>
                <div className="mt-3 space-y-2 text-xs text-gray-600">
                  <p><Badge variant="error">0-2</Badge> {t('methodology.ratings.poor')}</p>
                  <p><Badge variant="warning">3-5</Badge> {t('methodology.ratings.fair')}</p>
                  <p><Badge variant="success">6-8</Badge> {t('methodology.ratings.good')}</p>
                  <p><Badge variant="default">9-10</Badge> {t('methodology.ratings.excellent')}</p>
                </div>
              </Card>
              <Card className="rounded-2xl border border-white/70 bg-white/90 p-4">
                <Heading as="h5" size="sm" weight="semibold" className="uppercase tracking-wider text-coria-primary">
                  {t('methodology.updateFrequency')}
                </Heading>
                <Text size="sm" color="secondary" className="mt-3 text-gray-600">
                  {t(`methodology.${feature}.updateFrequency`)}
                </Text>
              </Card>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Heading as="h4" size="xl" weight="bold" className="text-coria-primary">
          {t('methodology.scoringFactors')}
        </Heading>
        <div className="grid gap-4 md:grid-cols-2">
          {criteria.factors.map((factor, index) => (
            <Card
              key={factor}
              className="rounded-[22px] border border-white/70 bg-white/95 p-4 shadow-[0_25px_70px_-55px_rgba(27,94,63,0.4)]"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-coria-primary/10 text-sm font-semibold text-coria-primary">
                  {index + 1}
                </span>
                <div className="space-y-1">
                  <Heading as="h5" size="sm" weight="semibold" className="text-coria-primary">
                    {factor}
                  </Heading>
                  <Text size="xs" color="secondary" className="text-gray-600">
                    {t(`methodology.${feature}.factors.${index}.description`)}
                  </Text>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Card className="rounded-[24px] border border-white/70 bg-white/95 p-6 shadow-[0_28px_80px_-65px_rgba(27,94,63,0.4)]">
        <div className="flex items-start gap-3">
          <BarChart3Icon className="h-5 w-5 text-coria-primary" />
          <div className="space-y-2">
            <Heading as="h5" size="sm" weight="semibold" className="text-coria-primary">
              {t('methodology.dataProcessing.title')}
            </Heading>
            <Text size="sm" color="secondary" className="text-gray-600">
              {t(`methodology.${feature}.dataProcessing`)}
            </Text>
          </div>
        </div>
      </Card>

      <Card className="rounded-[20px] border border-coria-primary/20 bg-coria-primary/5 p-5 text-sm text-coria-primary">
        <div className="flex items-start gap-3">
          <InfoIcon className="h-5 w-5" />
          <div className="space-y-1">
            <Heading as="h5" size="sm" weight="semibold">
              {t('methodology.transparency.title')}
            </Heading>
            <Text size="sm" color="secondary" className="text-coria-primary/80">
              {t('methodology.transparency.description')}
            </Text>
          </div>
        </div>
      </Card>
    </section>
  );
}
