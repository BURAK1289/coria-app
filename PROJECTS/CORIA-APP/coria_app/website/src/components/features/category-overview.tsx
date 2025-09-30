import { useTranslations, useMessages } from 'next-intl';
import { ArrowRightIcon, CheckIcon } from 'lucide-react';

import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Heading, Text } from '@/components/ui/typography';
import { AppScreenshotGallery } from './app-screenshot-gallery';
import { WhyItMatters } from './why-it-matters';
import { getStringArray } from '@/lib/messages';

interface CategoryOverviewProps {
  category: string;
}

const categoryFeatures: Record<string, string[]> = {
  scanning: ['barcode-scan', 'product-info', 'offline-mode'],
  'ai-recommendations': ['personalized-suggestions', 'alternative-products', 'smart-matching'],
  'impact-tracking': ['carbon-footprint', 'water-consumption', 'environmental-metrics'],
  'smart-pantry': ['inventory-management', 'expiry-tracking', 'shopping-lists'],
  'sustainability-scoring': ['environmental-score', 'social-impact', 'health-rating', 'ethical-production'],
  community: ['user-reviews', 'community-ratings', 'shared-experiences'],
  'premium-features': ['unlimited-scans', 'detailed-reports', 'advanced-analytics', 'ad-free'],
  'data-insights': ['consumption-patterns', 'impact-visualization', 'progress-tracking'],
};

export function CategoryOverview({ category }: CategoryOverviewProps) {
  const t = useTranslations('features');
  const messages = useMessages();
  const features = categoryFeatures[category] || [];
  const benefits = getStringArray(messages, ['features', 'categories', category, 'benefits']);
  const relatedCategories = getStringArray(messages, ['features', 'categories', category, 'relatedCategories']);

  return (
    <div className="space-y-14">
      <Card className="relative overflow-hidden rounded-[36px] border border-white/60 bg-gradient-to-br from-coria-primary via-leaf to-water px-8 py-10 text-white shadow-[0_45px_120px_-60px_rgba(8,38,29,0.65)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_65%)]" aria-hidden />
        <div className="relative z-10 space-y-6">
          <Badge variant="secondary" className="bg-white/20 text-white">
            {t(`categories.${category}.badge`)}
          </Badge>
          <Heading as="h2" size="3xl" weight="bold" className="text-balance">
            {t(`categories.${category}.title`)}
          </Heading>
          <Text size="lg" className="max-w-3xl text-white/85">
            {t(`categories.${category}.longDescription`)}
          </Text>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {benefits.map((benefit) => (
          <Card
            key={benefit}
            className="flex items-start gap-3 rounded-[24px] border border-white/70 bg-white/95 p-4 shadow-[0_25px_70px_-55px_rgba(27,94,63,0.45)]"
          >
            <span className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-coria-primary/10 text-coria-primary">
              <CheckIcon className="h-4 w-4" />
            </span>
            <Text size="sm" color="secondary" className="text-gray-700">
              {benefit}
            </Text>
          </Card>
        ))}
      </div>

      <AppScreenshotGallery category={category} />

      <div className="space-y-6">
        <Heading as="h3" size="2xl" weight="bold" className="text-coria-primary">
          {t('categoryOverview.featuresTitle')}
        </Heading>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <Link
              key={feature}
              href={{ pathname: '/features/[category]/[feature]', params: { category, feature } }}
            >
              <Card className="group h-full rounded-[26px] border border-white/70 bg-white/95 p-5 transition-all hover:border-coria-primary/20 hover:shadow-[0_28px_80px_-60px_rgba(27,94,63,0.45)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <Heading as="h4" size="lg" weight="semibold" className="text-coria-primary">
                      {t(`features.${feature}.title`)}
                    </Heading>
                    <Text size="sm" color="secondary" className="text-gray-600">
                      {t(`features.${feature}.shortDescription`)}
                    </Text>
                  </div>
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-coria-primary/10 text-coria-primary transition-transform group-hover:translate-x-1">
                    <ArrowRightIcon className="h-4 w-4" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <WhyItMatters category={category} />

      <div className="space-y-6">
        <Heading as="h3" size="2xl" weight="bold" className="text-coria-primary">
          {t('categoryOverview.relatedTitle')}
        </Heading>
        <div className="grid gap-4 md:grid-cols-3">
          {relatedCategories.map((relatedCategory) => (
            <Link
              key={relatedCategory}
              href={{ pathname: '/features/[category]', params: { category: relatedCategory } }}
            >
              <Card className="group h-full rounded-[24px] border border-white/70 bg-white/95 p-5 transition-all hover:border-coria-primary/20 hover:shadow-[0_28px_80px_-60px_rgba(27,94,63,0.45)]">
                <Heading as="h4" size="lg" weight="semibold" className="text-coria-primary">
                  {t(`categories.${relatedCategory}.title`)}
                </Heading>
                <Text size="sm" color="secondary" className="mt-2 text-gray-600">
                  {t(`categories.${relatedCategory}.description`)}
                </Text>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-coria-primary/80">
                  {t('overview.learnMore')}
                  <ArrowRightIcon className="h-4 w-4" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Card className="rounded-[32px] border border-white/70 bg-white/95 px-8 py-10 text-center shadow-[0_35px_90px_-65px_rgba(27,94,63,0.45)]">
        <Heading as="h3" size="2xl" weight="bold" className="text-coria-primary">
          {t('categoryOverview.cta.title')}
        </Heading>
        <Text size="lg" color="secondary" className="mx-auto mt-3 max-w-3xl text-gray-600">
          {t('categoryOverview.cta.description')}
        </Text>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            variant="primary"
            size="lg"
            className="shadow-lg shadow-coria-primary/20"
          >
            <a href="https://apps.apple.com/app/coria" target="_blank" rel="noopener noreferrer">
              {t('categoryOverview.cta.downloadIos')}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="border-coria-primary/30">
            <a href="https://play.google.com/store/apps/details?id=com.coria.app" target="_blank" rel="noopener noreferrer">
              {t('categoryOverview.cta.downloadAndroid')}
            </a>
          </Button>
        </div>
      </Card>
    </div>
  );
}
