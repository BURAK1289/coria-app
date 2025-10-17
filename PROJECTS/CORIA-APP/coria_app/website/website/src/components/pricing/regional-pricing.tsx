'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icons/Icon';
import { REGIONAL_PRICING, type Region, calculateYearlySavings } from '@/data/pricing';

export function RegionalPricing() {
  const t = useTranslations('pricing');
  const [selectedRegion, setSelectedRegion] = useState<Region>('TR');

  const regional = REGIONAL_PRICING.find((r) => r.region === selectedRegion)!;
  const yearlySavings = calculateYearlySavings(selectedRegion);

  return (
    <section className="py-16 lg:py-24" aria-labelledby="regional-pricing">
      <Container>
        <div className="text-center mb-12">
          <Typography variant="h2" id="regional-pricing" className="mb-4">
            {t('regional.title')}
          </Typography>
          <Typography variant="large" className="text-text-secondary max-w-2xl mx-auto">
            {t('regional.subtitle')}
          </Typography>
        </div>

        {/* Region Selector */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {REGIONAL_PRICING.map((region) => (
            <button
              key={region.region}
              onClick={() => setSelectedRegion(region.region)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                selectedRegion === region.region
                  ? 'bg-coria-green text-white shadow-md'
                  : 'bg-white text-text-secondary border border-gray-200 hover:border-coria-green hover:text-coria-green'
              }`}
              aria-pressed={selectedRegion === region.region}
              aria-label={`${t(`regional.regions.${region.region}.name`)} bölgesini seç`}
            >
              <span className="flex items-center gap-2">
                {t(`regional.regions.${region.region}.name`)}
                <span className="text-sm opacity-75">({region.currencySymbol})</span>
              </span>
            </button>
          ))}
        </div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-coria-green transition-all">
            <div className="text-center mb-6">
              <Typography variant="h4" className="mb-2 text-text-primary">
                {t('billingPeriods.monthly')}
              </Typography>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-coria-green">
                  {regional.currencySymbol}
                  {regional.pricing.monthly}
                </span>
                <span className="text-text-secondary text-sm">{t('regional.perMonth')}</span>
              </div>
              {regional.vatIncluded && (
                <p className="text-xs text-text-secondary mt-2">{t('regional.vatIncluded')}</p>
              )}
            </div>

            <Button variant="secondary" size="lg" className="w-full">
              {t('plans.premium.cta')}
            </Button>
          </div>

          {/* Yearly Plan (Most Popular) */}
          <div className="relative bg-white rounded-2xl border-2 border-coria-green p-6 shadow-lg transform scale-105">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="inline-flex items-center gap-1 bg-coria-green text-white px-4 py-1.5 rounded-full text-sm font-medium shadow-md">
                <Icon name="sparkles" className="w-4 h-4" aria-hidden="true" />
                {t('regional.discount', { percent: yearlySavings })}
              </span>
            </div>

            <div className="text-center mb-6 mt-4">
              <Typography variant="h4" className="mb-2 text-text-primary">
                {t('billingPeriods.yearly')}
              </Typography>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-coria-green">
                  {regional.currencySymbol}
                  {regional.pricing.yearly}
                </span>
                <span className="text-text-secondary text-sm">{t('regional.perYear')}</span>
              </div>
              <p className="text-sm text-leaf mt-2 font-medium">
                {regional.currencySymbol}
                {(regional.pricing.yearly / 12).toFixed(2)}
                {t('regional.perMonth')}
              </p>
              {regional.vatIncluded && (
                <p className="text-xs text-text-secondary mt-1">{t('regional.vatIncluded')}</p>
              )}
            </div>

            <Button variant="primary" size="lg" className="w-full">
              {t('plans.premium.cta')}
            </Button>
          </div>

          {/* Family Plan */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-coria-green transition-all">
            <div className="text-center mb-6">
              <Typography variant="h4" className="mb-2 text-text-primary">
                {t('billingPeriods.family')}
              </Typography>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-coria-green">
                  {regional.currencySymbol}
                  {regional.pricing.family}
                </span>
                <span className="text-text-secondary text-sm">{t('regional.perMonth')}</span>
              </div>
              <p className="text-sm text-text-secondary mt-2">6 kişiye kadar</p>
              {regional.vatIncluded && (
                <p className="text-xs text-text-secondary mt-1">{t('regional.vatIncluded')}</p>
              )}
            </div>

            <Button variant="secondary" size="lg" className="w-full">
              {t('plans.premium.cta')}
            </Button>
          </div>

          {/* Lifetime */}
          <div className="bg-gradient-to-br from-coria-green/10 to-leaf/10 rounded-2xl border-2 border-coria-green/30 p-6 hover:border-coria-green transition-all">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium mb-3">
                <Icon name="star" className="w-3 h-3" aria-hidden="true" />
                En İyi Değer
              </div>
              <Typography variant="h4" className="mb-2 text-text-primary">
                {t('billingPeriods.lifetime')}
              </Typography>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-coria-green">
                  {regional.currencySymbol}
                  {regional.pricing.lifetime}
                </span>
              </div>
              <p className="text-sm text-text-secondary mt-2">{t('regional.oneTime')}</p>
              {regional.vatIncluded && (
                <p className="text-xs text-text-secondary mt-1">{t('regional.vatIncluded')}</p>
              )}
            </div>

            <Button variant="primary" size="lg" className="w-full">
              {t('plans.premium.cta')}
            </Button>
          </div>
        </div>

        {/* Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary max-w-2xl mx-auto flex items-center justify-center gap-2">
            <Icon name="info" className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {t('regional.note')}
          </p>
        </div>
      </Container>
    </section>
  );
}
