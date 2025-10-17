'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Typography } from '@/components/ui/typography';
import { Icon } from '@/components/icons/Icon';
import { FEATURES, type FeatureAccess } from '@/data/pricing';

type FeatureKey = keyof typeof FEATURES;

interface FeatureRowProps {
  featureKey: FeatureKey;
  feature: FeatureAccess;
  name: string;
  free: string | boolean;
  premium: string | boolean;
  tooltip?: string;
}

function FeatureRow({ featureKey, feature, name, free, premium, tooltip }: FeatureRowProps) {
  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Icon name="check" className="w-5 h-5 text-leaf mx-auto" aria-label="Mevcut" />
      ) : (
        <Icon name="close" className="w-5 h-5 text-gray-300 mx-auto" aria-label="Mevcut değil" />
      );
    }
    return <span className="text-sm text-text-secondary">{value}</span>;
  };

  const hasPaywall = !!feature.paywallTrigger;

  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
      <td className="py-4 px-4 lg:px-6" scope="row">
        <div className="flex items-center gap-2">
          <Typography variant="base" className="font-medium text-text-primary">
            {name}
          </Typography>
          {(tooltip || hasPaywall) && (
            <button
              type="button"
              className="inline-flex items-center justify-center"
              aria-label={`${name} hakkında bilgi`}
              title={tooltip}
            >
              <Icon
                name="info"
                className="w-4 h-4 text-gray-400 hover:text-coria-green transition-colors"
                aria-hidden="true"
              />
            </button>
          )}
          {hasPaywall && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
              <Icon name="alert-triangle" className="w-3 h-3 text-amber-600" aria-hidden="true" />
              <span className="text-xs font-medium text-amber-700">Premium</span>
            </span>
          )}
        </div>
      </td>
      <td className="py-4 px-4 lg:px-6 text-center">{renderFeatureValue(free)}</td>
      <td className="py-4 px-4 lg:px-6 text-center bg-coria-green/5">
        {renderFeatureValue(premium)}
      </td>
    </tr>
  );
}

export function FeatureComparisonTable() {
  const t = useTranslations('pricing');

  const featuresList: FeatureKey[] = [
    'scanningAndNutrition',
    'sustainabilityMetrics',
    'alternativesAndRecipes',
    'smartPantry',
    'shoppingList',
    'aiChat',
    'mealPlanner',
    'scanHistory',
    'weeklySummary',
    'notifications',
    'ads',
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50" aria-labelledby="feature-comparison">
      <Container>
        <div className="text-center mb-12">
          <Typography variant="h2" id="feature-comparison" className="mb-4">
            {t('features.title')}
          </Typography>
          <Typography variant="large" className="text-text-secondary max-w-2xl mx-auto">
            {t('features.subtitle')}
          </Typography>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full" role="table" aria-label="Özellik karşılaştırma tablosu">
              <caption className="sr-only">
                Free ve Premium planları arasındaki özellik karşılaştırması
              </caption>

              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th
                    scope="col"
                    className="py-4 px-4 lg:px-6 text-left"
                    style={{ width: '50%' }}
                  >
                    <Typography variant="h4" className="text-text-primary">
                      {t('comparison.title')}
                    </Typography>
                  </th>
                  <th
                    scope="col"
                    className="py-4 px-4 lg:px-6 text-center"
                    style={{ width: '25%' }}
                  >
                    <Typography variant="h4" className="text-text-primary">
                      Free
                    </Typography>
                  </th>
                  <th
                    scope="col"
                    className="py-4 px-4 lg:px-6 text-center bg-coria-green/5"
                    style={{ width: '25%' }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Typography variant="h4" className="text-coria-green">
                        Premium
                      </Typography>
                      <Icon name="sparkles" className="w-5 h-5 text-coria-green" aria-hidden="true" />
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {featuresList.map((featureKey) => {
                  const feature = FEATURES[featureKey];
                  const name = t(`features.${featureKey}.name`);
                  const free = t(`features.${featureKey}.free`);
                  const premium = t(`features.${featureKey}.premium`);
                  const tooltip = t.has(`features.${featureKey}.tooltip`)
                    ? t(`features.${featureKey}.tooltip`)
                    : undefined;

                  return (
                    <FeatureRow
                      key={featureKey}
                      featureKey={featureKey}
                      feature={feature}
                      name={name}
                      free={free}
                      premium={premium}
                      tooltip={tooltip}
                    />
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Feature Notes */}
          <div className="mt-6 flex items-start gap-2 text-sm text-text-secondary px-4">
            <Icon name="info" className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" aria-hidden="true" />
            <p>
              {t('tagline')}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
