'use client';

import { useTranslations } from 'next-intl';
import { Icon } from '@/components/icons/Icon';

import { Link } from '@/i18n/routing';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heading, Text } from '@/components/ui/typography';

interface RelatedFeaturesProps {
  category: string;
  currentFeature: string;
}

const featureRelationships: Record<string, Record<string, string[]>> = {
  scanning: {
    'barcode-scan': ['product-info', 'personalized-suggestions', 'environmental-score'],
    'product-info': ['barcode-scan', 'alternative-products', 'health-rating'],
    'offline-mode': ['barcode-scan', 'inventory-management'],
  },
  'ai-recommendations': {
    'personalized-suggestions': ['alternative-products', 'smart-matching', 'consumption-patterns'],
    'alternative-products': ['personalized-suggestions', 'environmental-score', 'social-impact'],
    'smart-matching': ['personalized-suggestions', 'user-reviews'],
  },
  'impact-tracking': {
    'carbon-footprint': ['environmental-metrics', 'consumption-patterns', 'environmental-score'],
    'water-consumption': ['environmental-metrics', 'carbon-footprint'],
    'environmental-metrics': ['carbon-footprint', 'water-consumption', 'progress-tracking'],
  },
  'smart-pantry': {
    'inventory-management': ['expiry-tracking', 'shopping-lists', 'consumption-patterns'],
    'expiry-tracking': ['inventory-management', 'shopping-lists'],
    'shopping-lists': ['inventory-management', 'alternative-products'],
  },
  'sustainability-scoring': {
    'environmental-score': ['social-impact', 'health-rating', 'carbon-footprint'],
    'social-impact': ['environmental-score', 'ethical-production'],
    'health-rating': ['environmental-score', 'product-info'],
    'ethical-production': ['social-impact', 'environmental-score'],
  },
  community: {
    'user-reviews': ['community-ratings', 'shared-experiences'],
    'community-ratings': ['user-reviews', 'alternative-products'],
    'shared-experiences': ['user-reviews', 'consumption-patterns'],
  },
  'premium-features': {
    'unlimited-scans': ['detailed-reports', 'advanced-analytics'],
    'detailed-reports': ['unlimited-scans', 'advanced-analytics', 'progress-tracking'],
    'advanced-analytics': ['detailed-reports', 'consumption-patterns'],
    'ad-free': ['unlimited-scans', 'detailed-reports'],
  },
  'data-insights': {
    'consumption-patterns': ['impact-visualization', 'progress-tracking', 'personalized-suggestions'],
    'impact-visualization': ['consumption-patterns', 'progress-tracking', 'environmental-metrics'],
    'progress-tracking': ['consumption-patterns', 'impact-visualization'],
  },
};

export function RelatedFeatures({ category, currentFeature }: RelatedFeaturesProps) {
  const t = useTranslations('features');

  const relatedFeatureIds = featureRelationships[category]?.[currentFeature] || [];

  if (relatedFeatureIds.length === 0) {
    return null;
  }

  const groupedFeatures: Record<string, string[]> = {};

  relatedFeatureIds.forEach((featureId) => {
    for (const [cat, features] of Object.entries(featureRelationships)) {
      if (Object.prototype.hasOwnProperty.call(features, featureId)) {
        if (!groupedFeatures[cat]) {
          groupedFeatures[cat] = [];
        }
        groupedFeatures[cat].push(featureId);
        break;
      }
    }
  });

  return (
    <section className="space-y-10">
      <div className="text-center space-y-4">
        <Heading as="h3" size="2xl" weight="bold" className="text-coria-primary">
          {t('relatedFeatures.title')}
        </Heading>
        <Text size="lg" color="secondary" className="mx-auto max-w-2xl text-gray-600">
          {t('relatedFeatures.description')}
        </Text>
      </div>

      <div className="space-y-8">
        {Object.entries(groupedFeatures).map(([cat, features]) => (
          <div key={cat} className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-coria-primary/10 text-coria-primary">
                {t(`categories.${cat}.title`)}
              </Badge>
              <Text size="sm" color="secondary" className="uppercase tracking-[0.35em] text-coria-primary">
                {t('relatedFeatures.fromCategory')}
              </Text>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {features.map((featureId) => (
                <Link
                  key={featureId}
                  href={{ pathname: '/features/[category]/[feature]', params: { category: cat, feature: featureId } }}
                >
                  <Card className="group h-full rounded-[24px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-5 shadow-lg transition-all hover:border-coria-primary/20 hover:shadow-xl">
                    <Heading as="h4" size="lg" weight="semibold" className="text-coria-primary">
                      {t(`features.${featureId}.title`)}
                    </Heading>
                    <Text size="sm" color="secondary" className="mt-2 text-gray-600">
                      {t(`features.${featureId}.shortDescription`)}
                    </Text>
                    <Text size="xs" color="secondary" className="mt-4 text-coria-primary/70">
                      {t(`relatedFeatures.connections.${currentFeature}.${featureId}`)}
                    </Text>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-coria-primary/80">
                      {t('overview.learnMore')}
                      <Icon name="arrow-right" size={16} aria-hidden="true" />
                    </span>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Link href="/features">
        <Card className="group rounded-[26px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-6 text-center shadow-lg transition-all hover:border-coria-primary/30 hover:shadow-xl">
          <Heading as="h4" size="lg" weight="semibold" className="text-coria-primary">
            {t('relatedFeatures.exploreAll.title')}
          </Heading>
          <Text size="sm" color="secondary" className="mt-2 text-gray-600">
            {t('relatedFeatures.exploreAll.description')}
          </Text>
          <span className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-semibold text-coria-primary">
            {t('relatedFeatures.exploreAll.action')}
            <Icon name="arrow-right" size={16} aria-hidden="true" />
          </span>
        </Card>
      </Link>
    </section>
  );
}
