'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Typography } from '@/components/ui/typography';


export function FeatureComparison() {
  const t = useTranslations('pricing');

  const features = [
    {
      key: 'scanning',
      name: t('comparison.features.scanning.name'),
      free: t('comparison.features.scanning.free'),
      premium: t('comparison.features.scanning.premium'),
    },
    {
      key: 'reports',
      name: t('comparison.features.reports.name'),
      free: t('comparison.features.reports.free'),
      premium: t('comparison.features.reports.premium'),
    },
    {
      key: 'analytics',
      name: t('comparison.features.analytics.name'),
      free: t('comparison.features.analytics.free'),
      premium: t('comparison.features.analytics.premium'),
    },
    {
      key: 'recommendations',
      name: t('comparison.features.recommendations.name'),
      free: t('comparison.features.recommendations.free'),
      premium: t('comparison.features.recommendations.premium'),
    },
    {
      key: 'support',
      name: t('comparison.features.support.name'),
      free: t('comparison.features.support.free'),
      premium: t('comparison.features.support.premium'),
    },
    {
      key: 'ads',
      name: t('comparison.features.ads.name'),
      free: t('comparison.features.ads.free'),
      premium: t('comparison.features.ads.premium'),
    },
    {
      key: 'export',
      name: t('comparison.features.export.name'),
      free: t('comparison.features.export.free'),
      premium: t('comparison.features.export.premium'),
    },
    {
      key: 'earlyAccess',
      name: t('comparison.features.earlyAccess.name'),
      free: t('comparison.features.earlyAccess.free'),
      premium: t('comparison.features.earlyAccess.premium'),
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            {t('comparison.title')}
          </Typography>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 bg-gray-50 border-b">
              <div className="p-6">
                <Typography variant="h4" className="text-text-primary">
                  Özellik
                </Typography>
              </div>
              <div className="p-6 text-center border-l">
                <Typography variant="h4" className="text-text-primary">
                  Ücretsiz
                </Typography>
              </div>
              <div className="p-6 text-center border-l bg-coria-green/5">
                <Typography variant="h4" className="text-coria-green">
                  Premium
                </Typography>
              </div>
            </div>

            {/* Feature rows */}
            {features.map((feature, index) => (
              <div
                key={feature.key}
                className={`grid grid-cols-3 border-b last:border-b-0 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <div className="p-6">
                  <Typography variant="large" className="font-medium">
                    {feature.name}
                  </Typography>
                </div>
                <div className="p-6 text-center border-l">
                  <Typography variant="large" className="text-text-secondary">
                    {feature.free}
                  </Typography>
                </div>
                <div className="p-6 text-center border-l bg-coria-green/5">
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