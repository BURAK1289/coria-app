'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/badge';
import { Heading, Text } from '@/components/ui/typography';
import { Icon } from '@/components/icons/Icon';

interface DataSourceAttributionProps {
  feature: string;
}

const dataSources = [
  {
    id: 'openfoodfacts',
    name: 'Open Food Facts',
    url: 'https://world.openfoodfacts.org/',
    description: 'Global food products database with nutritional and sustainability information.',
    coverage: '2.8M+ products',
    updateFrequency: 'Real-time',
    reliability: 'Community-verified',
    iconName: 'home',
    accent: 'text-coria-primary',
    bg: 'bg-coria-primary/12',
  },
  {
    id: 'nutritionix',
    name: 'Nutritionix',
    url: 'https://www.nutritionix.com/',
    description: 'Professionally curated database with detailed nutrition analysis.',
    coverage: '800K+ foods',
    updateFrequency: 'Weekly',
    reliability: 'Dietician verified',
    iconName: 'star',
    accent: 'text-coria-accent',
    bg: 'bg-coria-accent/12',
  },
  {
    id: 'edamam',
    name: 'Edamam',
    url: 'https://www.edamam.com/',
    description: 'Food, nutrition, and recipe intelligence API powering CORIA analytics.',
    coverage: '2M+ recipes',
    updateFrequency: 'Daily',
    reliability: 'API-verified',
    iconName: 'globe',
    accent: 'text-water',
    bg: 'bg-water/12',
  },
  {
    id: 'spoonacular',
    name: 'Spoonacular',
    url: 'https://spoonacular.com/',
    description: 'Ingredient analysis and recipe data enhancing AI recommendations.',
    coverage: '5K+ recipes',
    updateFrequency: 'Daily',
    reliability: 'Curated content',
    iconName: 'star',
    accent: 'text-leaf-700',
    bg: 'bg-leaf/12',
  },
] as const;

const featureDataSources: Record<string, string[]> = {
  'barcode-scan': ['openfoodfacts', 'nutritionix'],
  'product-info': ['openfoodfacts', 'nutritionix', 'edamam'],
  'personalized-suggestions': ['nutritionix', 'edamam', 'spoonacular'],
  'alternative-products': ['openfoodfacts', 'nutritionix'],
  'environmental-score': ['openfoodfacts', 'edamam'],
  'social-impact': ['openfoodfacts'],
  'health-rating': ['nutritionix', 'edamam'],
  'ethical-production': ['openfoodfacts'],
  'carbon-footprint': ['edamam', 'openfoodfacts'],
  'water-consumption': ['edamam'],
  'environmental-metrics': ['openfoodfacts', 'edamam'],
};

export function DataSourceAttribution({ feature }: DataSourceAttributionProps) {
  const t = useTranslations('features');

  const relevantSources = featureDataSources[feature] || [];
  const sources = dataSources.filter((source) => relevantSources.includes(source.id));

  if (sources.length === 0) {
    return null;
  }

  return (
    <section className="space-y-10">
      <div className="text-center space-y-4">
        <Heading as="h3" size="2xl" weight="bold" className="text-coria-primary">
          {t('dataSources.title')}
        </Heading>
        <Text size="lg" color="secondary" className="mx-auto max-w-2xl text-gray-600">
          {t('dataSources.description')}
        </Text>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {sources.map((source) => {
          return (
            <Card
              key={source.id}
              className="h-full rounded-[26px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${source.bg} ${source.accent}`}
                >
                  <Icon name={source.iconName} size={24} aria-hidden="true" />
                </span>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heading as="h4" size="lg" weight="semibold" className="text-coria-primary">
                      {source.name}
                    </Heading>
                    <Badge variant="secondary" className="bg-coria-primary/10 text-coria-primary">
                      {t('dataSources.verified')}
                    </Badge>
                  </div>
                  <Text size="sm" color="secondary" className="text-gray-600">
                    {source.description}
                  </Text>
                </div>
              </div>

              <div className="mt-5 grid gap-4 rounded-[20px] border border-[var(--foam)] bg-[var(--foam)]/90 backdrop-blur-sm px-4 py-3 text-center text-xs text-gray-600 md:grid-cols-3">
                <div>
                  <Text size="sm" color="secondary" className="font-semibold text-coria-primary">
                    {source.coverage}
                  </Text>
                  <p>{t('dataSources.coverage')}</p>
                </div>
                <div>
                  <Text size="sm" color="secondary" className="font-semibold text-coria-primary">
                    {source.updateFrequency}
                  </Text>
                  <p>{t('dataSources.updates')}</p>
                </div>
                <div>
                  <Text size="sm" color="secondary" className="font-semibold text-coria-primary">
                    {source.reliability}
                  </Text>
                  <p>{t('dataSources.reliability')}</p>
                </div>
              </div>

              <div className="mt-5">
                <Button
                  asChild

                  size="sm"
                  className="w-full border-coria-primary/30 text-coria-primary"
                >
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {t('dataSources.visitSource')}
                    <Icon name="external-link" size={16} className="ml-2" aria-hidden="true" />
                  </a>
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-[28px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-8 shadow-sm">
        <Heading as="h4" size="xl" weight="bold" className="text-coria-primary">
          {t('dataSources.quality.title')}
        </Heading>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Heading as="h5" size="sm" weight="semibold" className="uppercase tracking-wider text-coria-primary">
              {t('dataSources.quality.verification.title')}
            </Heading>
            <Text size="sm" color="secondary" className="text-gray-600">
              {t('dataSources.quality.verification.description')}
            </Text>
          </div>
          <div className="space-y-2">
            <Heading as="h5" size="sm" weight="semibold" className="uppercase tracking-wider text-coria-primary">
              {t('dataSources.quality.accuracy.title')}
            </Heading>
            <Text size="sm" color="secondary" className="text-gray-600">
              {t('dataSources.quality.accuracy.description')}
            </Text>
          </div>
        </div>

        <div className="mt-6 rounded-[20px] border border-coria-primary/20 bg-coria-primary/5 px-5 py-4">
          <Heading as="h5" size="sm" weight="semibold" className="text-coria-primary">
            {t('dataSources.attribution.title')}
          </Heading>
          <Text size="sm" color="secondary" className="mt-1 text-coria-primary/80">
            {t('dataSources.attribution.description')}
          </Text>
        </div>
      </Card>
    </section>
  );
}
