import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { Heading, Text } from '@/components/ui/typography';
import {
  ScanIcon,
  BrainIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  BarChart3Icon,
  ArrowRightIcon,
} from 'lucide-react';

import {
  SmartPantrySvgIcon,
  SustainabilitySvgIcon,
  CommunitySvgIcon,
  AIAssistantSvgIcon,
} from '@/components/icons/svg-icons';

const featureCategories = [
  { id: 'scanning', icon: ScanIcon },
  { id: 'ai-recommendations', icon: AIAssistantSvgIcon },
  { id: 'impact-tracking', icon: TrendingUpIcon },
  { id: 'smart-pantry', icon: SmartPantrySvgIcon },
  { id: 'sustainability-scoring', icon: SustainabilitySvgIcon },
  { id: 'community', icon: CommunitySvgIcon },
  { id: 'premium-features', icon: ShieldCheckIcon },
  { id: 'data-insights', icon: BarChart3Icon },
] as const;

const categoryStyles: Record<string, { iconBg: string; iconText: string; card: string }> = {
  scanning: {
    iconBg: 'bg-coria-primary/12',
    iconText: 'text-coria-primary',
    card: 'hover:border-coria-primary/30 hover:shadow-[0_25px_60px_-45px_rgba(27,94,63,0.55)]',
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
      <Card className="relative overflow-hidden rounded-[36px] border border-white/60 bg-gradient-to-br from-coria-primary via-leaf to-water px-8 py-12 text-white shadow-[0_45px_120px_-60px_rgba(8,38,29,0.65)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_60%)]" aria-hidden />
        <div className="relative z-10 mx-auto max-w-3xl space-y-6 text-center">
          <Heading as="h2" size="3xl" weight="bold" className="text-balance">
            {t('overview.title')}
          </Heading>
          <Text size="lg" className="text-white/85">
            {t('overview.subtitle')}
          </Text>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              asChild
              variant="primary"
              size="lg"
              className="bg-white text-coria-primary hover:bg-white/90"
            >
              <a href="https://apps.apple.com/app/coria" target="_blank" rel="noopener noreferrer">
                {t('overview.cta.downloadIos')}
              </a>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="lg"
              className="border border-white/60 text-white hover:bg-white/15"
            >
              <a href="https://play.google.com/store/apps/details?id=com.coria.app" target="_blank" rel="noopener noreferrer">
                {t('overview.cta.downloadAndroid')}
              </a>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {featureCategories.map(({ id, icon: Icon }) => {
          const styles = categoryStyles[id] ?? categoryStyles.scanning;

          return (
            <Link key={id} href={{ pathname: '/features/[category]', params: { category: id } }}>
              <Card
                className={`group h-full rounded-[28px] border border-white/70 bg-white/95 p-6 transition-all ${styles.card}`}
              >
                <div className="flex items-start gap-4">
                  <span
                    className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-lg font-semibold ${styles.iconBg} ${styles.iconText}`}
                  >
                    <Icon className="h-5 w-5" />
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
                      <ArrowRightIcon className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="rounded-[32px] border border-white/70 bg-white/95 px-8 py-10 text-center shadow-[0_35px_90px_-65px_rgba(27,94,63,0.45)]">
        <Heading as="h3" size="2xl" weight="bold" className="text-coria-primary">
          {t('overview.cta.title')}
        </Heading>
        <Text size="lg" color="secondary" className="mx-auto mt-3 max-w-3xl text-gray-600">
          {t('overview.cta.description')}
        </Text>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            variant="primary"
            size="lg"
            className="shadow-lg shadow-coria-primary/20"
          >
            <a href="https://apps.apple.com/app/coria" target="_blank" rel="noopener noreferrer">
              {t('overview.cta.downloadIos')}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-coria-primary/30">
            <a href="https://play.google.com/store/apps/details?id=com.coria.app" target="_blank" rel="noopener noreferrer">
              {t('overview.cta.downloadAndroid')}
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
