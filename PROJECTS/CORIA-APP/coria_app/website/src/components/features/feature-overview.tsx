import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { Heading, Text } from '@/components/ui/typography';
import { Icon } from '@/components/icons/Icon';

import {
  SmartPantrySvgIcon,
  SustainabilitySvgIcon,
  CommunitySvgIcon,
  AIAssistantSvgIcon,
} from '@/components/icons/svg-icons';

const featureCategories = [
  { id: 'scanning', iconType: 'coria' as const, iconName: 'search' },
  { id: 'ai-recommendations', iconType: 'svg' as const, icon: AIAssistantSvgIcon },
  { id: 'impact-tracking', iconType: 'coria' as const, iconName: 'trending-up' },
  { id: 'smart-pantry', iconType: 'svg' as const, icon: SmartPantrySvgIcon },
  { id: 'sustainability-scoring', iconType: 'svg' as const, icon: SustainabilitySvgIcon },
  { id: 'community', iconType: 'svg' as const, icon: CommunitySvgIcon },
  { id: 'premium-features', iconType: 'coria' as const, iconName: 'star' },
  { id: 'data-insights', iconType: 'coria' as const, iconName: 'bar-chart' },
] as const;

const categoryStyles: Record<string, { iconBg: string; iconText: string; card: string }> = {
  scanning: {
    iconBg: 'bg-coria-primary/12',
    iconText: 'text-coria-primary',
    card: 'hover:border-coria-primary/30 hover:shadow-sm',
  },
  'ai-recommendations': {
    iconBg: 'bg-coria-accent/15',
    iconText: 'text-coria-accent',
    card: 'hover:border-coria-accent/30 hover:shadow-[0_25px_60px_-45px_rgba(255,107,107,0.4)]',
  },
  'impact-tracking': {
    iconBg: 'bg-leaf/15',
    iconText: 'text-leaf-700',
    card: 'hover:border-leaf/30 hover:shadow-[0_25px_60px_-45px_rgba(102,187,106,0.45)]',
  },
  'smart-pantry': {
    iconBg: 'bg-water/15',
    iconText: 'text-water',
    card: 'hover:border-water/30 hover:shadow-[0_25px_60px_-45px_rgba(38,166,154,0.45)]',
  },
  'sustainability-scoring': {
    iconBg: 'bg-coria-primary-light/15',
    iconText: 'text-coria-primary-dark',
    card: 'hover:border-coria-primary-light/40 hover:shadow-[0_25px_60px_-45px_rgba(74,124,89,0.45)]',
  },
  community: {
    iconBg: 'bg-coria-sand/80',
    iconText: 'text-coria-primary',
    card: 'hover:border-coria-sand/70 hover:shadow-[0_25px_60px_-45px_rgba(249,241,231,0.6)]',
  },
  'premium-features': {
    iconBg: 'bg-coria-accent-light/70',
    iconText: 'text-coria-accent',
    card: 'hover:border-coria-accent-light/70 hover:shadow-[0_25px_60px_-45px_rgba(255,179,179,0.6)]',
  },
  'data-insights': {
    iconBg: 'bg-water/12',
    iconText: 'text-water',
    card: 'hover:border-water/30 hover:shadow-[0_25px_60px_-45px_rgba(38,166,154,0.45)]',
  },
};

export function FeatureOverview() {
  const t = useTranslations('features');

  return (
    <div className="space-y-14">
      <div className="relative mx-auto max-w-3xl space-y-6 text-center">
          <Heading as="h2" size="3xl" weight="bold" className="text-balance text-coria-primary">
            {t('overview.title')}
          </Heading>
          <Text size="lg" className="text-gray-600">
            {t('overview.subtitle')}
          </Text>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              variant="primary"
              size="lg"
            >
              <a href="https://apps.apple.com/app/coria" target="_blank" rel="noopener noreferrer">
                {t('overview.cta.downloadIos')}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
            >
              <a href="https://play.google.com/store/apps/details?id=com.coria.app" target="_blank" rel="noopener noreferrer">
                {t('overview.cta.downloadAndroid')}
              </a>
            </Button>
          </div>
        </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {featureCategories.map((category) => {
          const { id, iconType } = category;
          const styles = categoryStyles[id] ?? categoryStyles.scanning;

          return (
            <Link key={id} href={{ pathname: '/features/[category]', params: { category: id } }}>
              <Card
                variant="glass"
                rounded="organic"
                padding="lg"
                hover={true}
                className={`group h-full transition-all ${styles.card}`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-semibold ${styles.iconBg} ${styles.iconText}`}
                  >
                    {iconType === 'coria' && 'iconName' in category ? (
                      <Icon name={category.iconName} size={20} aria-hidden="true" />
                    ) : iconType === 'svg' && 'icon' in category ? (
                      <category.icon size={20} className="text-current" />
                    ) : null}
                  </span>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Heading as="h3" size="lg" weight="semibold" className="text-coria-primary">
                        {t(`categories.${id}.title`)}
                      </Heading>
                      <Text size="sm" color="secondary" className="text-gray-600">
                        {t(`categories.${id}.description`)}
                      </Text>
                    </div>
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-coria-primary/80">
                      {t('overview.learnMore')}
                      <Icon name="arrow-right" size={16} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
