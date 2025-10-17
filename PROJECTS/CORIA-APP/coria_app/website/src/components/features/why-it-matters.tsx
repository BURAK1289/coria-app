'use client';

import { useTranslations, useMessages } from 'next-intl';
import { Icon } from '@/components/icons/Icon';
import { HealthSvgIcon } from '@/components/icons/svg-icons';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading, Text } from '@/components/ui/typography';
import { getMessageArray } from '@/lib/messages';
import { isNonEmptyString, isValidObject } from '@/lib/type-guards';

interface WhyItMattersProps {
  category: string;
}

type ImpactIconKey = 'environmental' | 'health' | 'economic' | 'social' | 'ethical' | 'global';

interface Impact {
  type: ImpactIconKey;
  title: string;
  description: string;
}

interface Statistic {
  value: string;
  label: string;
  description?: string;
}

const impactIcons: Record<ImpactIconKey, { type: 'coria' | 'svg'; iconName?: string; icon?: any }> = {
  environmental: { type: 'coria', iconName: 'leaf' },
  health: { type: 'svg', icon: HealthSvgIcon },
  economic: { type: 'coria', iconName: 'trending-up' },
  social: { type: 'coria', iconName: 'star' },
  ethical: { type: 'coria', iconName: 'star' },
  global: { type: 'coria', iconName: 'globe' },
};

function isImpact(value: unknown): value is Impact {
  if (!isValidObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.title) &&
    isNonEmptyString(value.description) &&
    (Object.keys(impactIcons) as ImpactIconKey[]).includes(value.type as ImpactIconKey)
  );
}

function isStatistic(value: unknown): value is Statistic {
  if (!isValidObject(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.value) &&
    isNonEmptyString(value.label) &&
    (value.description === undefined || isNonEmptyString(value.description))
  );
}

export function WhyItMatters({ category }: WhyItMattersProps) {
  const t = useTranslations('features');
  const messages = useMessages();

  const impacts = getMessageArray(messages, ['features', 'categories', category, 'whyItMatters', 'impacts'], isImpact);
  const statistics = getMessageArray(messages, ['features', 'categories', category, 'whyItMatters', 'statistics'], isStatistic);

  return (
    <section className="space-y-10">
      <div className="text-center space-y-4">
        <Heading as="h3" size="2xl" weight="bold" className="text-coria-primary">
          {t('whyItMatters.title')}
        </Heading>
        <Text size="lg" color="secondary" className="mx-auto max-w-2xl text-gray-600">
          {t(`categories.${category}.whyItMatters.description`)}
        </Text>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {impacts.map((impact, index) => {
          const iconConfig = impactIcons[impact.type] ?? { type: 'coria' as const, iconName: 'leaf' };

          return (
            <Card
              key={`${impact.type}-${index}`}
              className="rounded-[24px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-6 text-center shadow-sm"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-coria-primary/10 text-coria-primary">
                {iconConfig.type === 'coria' && iconConfig.iconName ? (
                  <Icon name={iconConfig.iconName} size={20} aria-hidden="true" />
                ) : iconConfig.type === 'svg' && iconConfig.icon ? (
                  <iconConfig.icon size={20} className="text-current" />
                ) : null}
              </span>
              <Badge variant="secondary" className="mt-4 bg-coria-primary/10 text-coria-primary">
                {t(`whyItMatters.impactTypes.${impact.type}`)}
              </Badge>
              <Heading as="h4" size="lg" weight="semibold" className="mt-4 text-coria-primary">
                {impact.title}
              </Heading>
              <Text size="sm" color="secondary" className="mt-2 text-gray-600">
                {impact.description}
              </Text>
            </Card>
          );
        })}
      </div>

      {statistics.length > 0 && (
        <Card className="rounded-[28px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm px-8 py-10 text-center shadow-sm">
          <Heading as="h4" size="xl" weight="bold" className="text-coria-primary">
            {t('whyItMatters.statisticsTitle')}
          </Heading>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {statistics.map((stat, index) => (
              <div key={`${stat.label}-${index}`} className="space-y-2">
                <Heading as="h4" size="2xl" weight="bold" className="text-coria-primary">
                  {stat.value}
                </Heading>
                <Text size="sm" color="secondary" className="text-gray-600">
                  {stat.label}
                </Text>
                {stat.description && (
                  <Text size="xs" color="secondary" className="text-gray-500">
                    {stat.description}
                  </Text>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="rounded-[24px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-6 text-center shadow-sm">
        <Heading as="h5" size="lg" weight="semibold" className="text-coria-primary">
          {t(`categories.${category}.whyItMatters.cta.title`)}
        </Heading>
        <Text size="sm" color="secondary" className="mt-2 text-gray-600">
          {t(`categories.${category}.whyItMatters.cta.description`)}
        </Text>
        <Text size="sm" className="mt-4 font-semibold uppercase tracking-[0.35em] text-coria-primary">
          {t('whyItMatters.joinMovement')}
        </Text>
      </Card>
    </section>
  );
}
