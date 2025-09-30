'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Typography } from '@/components/ui/typography';

export function PricingHero() {
  const t = useTranslations('pricing');

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-coria-green/5 to-leaf/5">
      <Container>
        <div className="text-center max-w-3xl mx-auto">
          <Typography variant="h1" className="mb-6">
            {t('title')}
          </Typography>
          <Typography variant="large" className="text-text-secondary">
            {t('subtitle')}
          </Typography>
        </div>
      </Container>
    </section>
  );
}