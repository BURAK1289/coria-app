'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Typography } from '@/components/ui/typography';


export function FeatureComparison() {
  const t = useTranslations('pricing');

  const features = [
    {
      key: 'scanningAndNutrition',
      name: t('features.scanningAndNutrition.name'),
      free: t('features.scanningAndNutrition.free'),
      premium: t('features.scanningAndNutrition.premium'),
    },
    {
      key: 'sustainabilityMetrics',
      name: t('features.sustainabilityMetrics.name'),
      free: t('features.sustainabilityMetrics.free'),
      premium: t('features.sustainabilityMetrics.premium'),
    },
    {
      key: 'alternativesAndRecipes',
      name: t('features.alternativesAndRecipes.name'),
      free: t('comparison.notAvailable'),
      premium: t('comparison.available'),
    },
    {
      key: 'smartPantry',
      name: t('features.smartPantry.name'),
      free: t('features.smartPantry.free'),
      premium: t('features.smartPantry.premium'),
    },
    {
      key: 'shoppingList',
      name: t('features.shoppingList.name'),
      free: t('features.shoppingList.free'),
      premium: t('features.shoppingList.premium'),
    },
    {
      key: 'aiChat',
      name: t('features.aiChat.name'),
      free: t('features.aiChat.free'),
      premium: t('features.aiChat.premium'),
    },
    {
      key: 'mealPlanner',
      name: t('features.mealPlanner.name'),
      free: t('comparison.notAvailable'),
      premium: t('comparison.available'),
    },
    {
      key: 'reports',
      name: t('features.reports.name'),
      free: t('features.reports.free'),
      premium: t('features.reports.premium'),
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            {t('features.title')}
          </Typography>
          <Typography variant="large" className="text-text-secondary">
            {t('features.subtitle')}
          </Typography>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-transparent backdrop-blur-sm border border-[var(--foam)]/50 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 border-b border-[var(--foam)]/30">
              <div className="p-6">
                <Typography variant="h4" className="text-text-primary">
                  Özellik
                </Typography>
              </div>
              <div className="p-6 text-center border-l border-[var(--foam)]/30">
                <Typography variant="h4" className="text-text-primary">
                  {t('comparison.free')}
                </Typography>
              </div>
              <div className="p-6 text-center border-l border-[var(--foam)]/30 bg-coria-green/10">
                <Typography variant="h4" className="text-coria-green">
                  {t('comparison.premium')}
                </Typography>
              </div>
            </div>

            {/* Feature rows */}
            {features.map((feature, index) => (
              <div
                key={feature.key}
                className={`grid grid-cols-3 border-b border-[var(--foam)]/30 last:border-b-0 ${
                  index % 2 === 0 ? 'bg-[var(--foam)]/20' : 'bg-transparent'
                }`}
              >
                <div className="p-6">
                  <Typography variant="large" className="font-medium">
                    {feature.name}
                  </Typography>
                </div>
                <div className="p-6 text-center border-l border-[var(--foam)]/30">
                  <Typography variant="large" className="text-text-secondary">
                    {feature.free}
                  </Typography>
                </div>
                <div className="p-6 text-center border-l border-[var(--foam)]/30 bg-coria-green/10">
                  <Typography variant="large" className="text-coria-green font-medium">
                    {feature.premium}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}