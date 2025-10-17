'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { PAYWALL_TRIGGERS } from '@/data/pricing';

export function PaywallShowcase() {
  const t = useTranslations('pricing.paywallTriggers');

  const triggers = [
    {
      key: 'alternatives',
      icon: '🔄',
      color: 'from-green-500 to-emerald-600',
    },
    {
      key: 'recipes',
      icon: '🍳',
      color: 'from-orange-500 to-amber-600',
    },
    {
      key: 'aiLimit',
      icon: '🤖',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      key: 'pantryLimit',
      icon: '📦',
      color: 'from-purple-500 to-violet-600',
    },
    {
      key: 'mealPlanner',
      icon: '📅',
      color: 'from-pink-500 to-rose-600',
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            {t('title')}
          </Typography>
          <Typography variant="large" className="text-text-secondary max-w-2xl mx-auto">
            {t('description')}
          </Typography>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {triggers.map((trigger) => (
            <Card
              key={trigger.key}
              className="p-6 bg-[var(--foam)]/60 backdrop-blur-sm border border-[var(--foam)]/50 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Icon with Gradient Background */}
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${trigger.color} flex items-center justify-center text-3xl mb-4 shadow-lg`}
              >
                {trigger.icon}
              </div>

              {/* Title */}
              <Typography variant="h4" className="mb-3">
                {t(`${trigger.key}.title`)}
              </Typography>

              {/* Description */}
              <Typography variant="base" className="text-text-secondary mb-4 leading-relaxed">
                {t(`${trigger.key}.description`)}
              </Typography>

              {/* CTA Button */}
              <Button
                variant="secondary"
                size="sm"
                className="w-full group"
                onClick={() => {
                  // Scroll to pricing plans or navigate to upgrade
                  document.getElementById('pricing-plans')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="group-hover:scale-105 transition-transform inline-block">
                  {t(`${trigger.key}.cta`)}
                </span>
              </Button>

              {/* Feature Highlight */}
              <div className="mt-4 pt-4 border-t border-[var(--foam)]">
                <Typography variant="small" className="text-text-secondary flex items-center gap-2">
                  <span className="text-coria-green">✓</span>
                  {t(`${trigger.key}.featureHighlight`)}
                </Typography>
              </div>
            </Card>
          ))}
        </div>

        {/* Trust Signal */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-[var(--foam)]/60 backdrop-blur-sm border border-[var(--foam)]/50 px-6 py-3 rounded-full shadow-lg">
            <span className="text-2xl">⭐</span>
            <Typography variant="base" className="text-text-primary font-medium">
              {t('trustSignal')}
            </Typography>
          </div>
        </div>
      </Container>
    </section>
  );
}
