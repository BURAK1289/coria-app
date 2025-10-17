'use client';

import { useTranslations } from 'next-intl';
import { Container } from '@/components/ui/container';
import { Typography } from '@/components/ui/typography';
import { Card } from '@/components/ui/card';
import { 
  XMarkIcon, 
  ArrowPathIcon, 
  ShieldCheckIcon, 
  ArrowUpIcon 
} from '@/components/icons';

export function TrustIndicators() {
  const t = useTranslations('pricing');

  const benefits = [
    {
      title: t('trust.benefits.0.title'),
      description: t('trust.benefits.0.description'),
      icon: XMarkIcon,
    },
    {
      title: t('trust.benefits.1.title'),
      description: t('trust.benefits.1.description'),
      icon: ArrowPathIcon,
    },
    {
      title: t('trust.benefits.2.title'),
      description: t('trust.benefits.2.description'),
      icon: ShieldCheckIcon,
    },
    {
      title: t('trust.benefits.3.title'),
      description: t('trust.benefits.3.description'),
      icon: ArrowUpIcon,
    },
  ];

  return (
    <section className="py-16 lg:py-24">
      <Container>
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            {t('trust.title')}
          </Typography>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={index} className="p-6 text-center bg-[var(--foam)]/60 backdrop-blur-sm border-[var(--foam)]/50">
                <div className="w-12 h-12 bg-coria-green/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="w-6 h-6 text-coria-green" />
                </div>
                <Typography variant="h4" className="mb-3">
                  {benefit.title}
                </Typography>
                <Typography variant="large" className="text-text-secondary">
                  {benefit.description}
                </Typography>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}