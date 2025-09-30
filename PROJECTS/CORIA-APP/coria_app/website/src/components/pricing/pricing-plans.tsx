'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { CheckIcon } from '@/components/icons';
import { formatPrice } from '@/lib/formatting';
import { Locale } from '@/types/localization';

export function PricingPlans() {
  const t = useTranslations('pricing');
  const locale = useLocale() as Locale;

  const plans = [
    {
      key: 'free',
      name: t('plans.free.name'),
      price: t('plans.free.price'),
      period: t('plans.free.period'),
      description: t('plans.free.description'),
      features: [
        t('plans.free.features.0'),
        t('plans.free.features.1'),
        t('plans.free.features.2'),
        t('plans.free.features.3'),
        t('plans.free.features.4'),
      ],
      cta: t('plans.free.cta'),
      popular: false,
    },
    {
      key: 'premium',
      name: t('plans.premium.name'),
      price: t('plans.premium.price'),
      period: t('plans.premium.period'),
      description: t('plans.premium.description'),
      features: [
        t('plans.premium.features.0'),
        t('plans.premium.features.1'),
        t('plans.premium.features.2'),
        t('plans.premium.features.3'),
        t('plans.premium.features.4'),
        t('plans.premium.features.5'),
        t('plans.premium.features.6'),
        t('plans.premium.features.7'),
      ],
      cta: t('plans.premium.cta'),
      popular: true,
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.key}
              className={`relative p-8 ${
                plan.popular
                  ? 'border-coria-green shadow-lg scale-105'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-coria-green text-white px-4 py-2 rounded-full text-sm font-medium">
                    En Popüler
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <Typography variant="h3" className="mb-2">
                  {plan.name}
                </Typography>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-coria-green">
                    {plan.price === '0' 
                      ? 'Ücretsiz' 
                      : formatPrice(parseFloat(plan.price), locale, 'TRY')
                    }
                  </span>
                  {plan.price !== '0' && (
                    <span className="text-text-secondary ml-2">
                      / {plan.period}
                    </span>
                  )}
                </div>
                <Typography variant="large" className="text-text-secondary">
                  {plan.description}
                </Typography>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckIcon className="w-5 h-5 text-leaf mt-0.5 flex-shrink-0" />
                    <Typography variant="large" className="text-text-primary">
                      {feature}
                    </Typography>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                size="lg"
                className="w-full"
                onClick={() => {
                  // This would typically redirect to app store
                  window.open('https://apps.apple.com/app/coria', '_blank');
                }}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}