import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Navigation, Footer } from '@/components/layout';
import { PricingHero } from '@/components/pricing/pricing-hero';
import { PricingPlans } from '@/components/pricing/pricing-plans';
import { FeatureComparison } from '@/components/pricing/feature-comparison';
import { TrustIndicators } from '@/components/pricing/trust-indicators';
import { PricingFAQ } from '@/components/pricing/pricing-faq';
import { PremiumTestimonials } from '@/components/pricing/premium-testimonials';
import { CustomerSupport } from '@/components/pricing/customer-support';
import { PricingCTA } from '@/components/pricing/pricing-cta';
import { generateLocalizedMetadata } from '@/lib/metadata';
import { LocalizedPageProps } from '@/types/global';
import { Locale } from '@/types/localization';

interface PricingPageProps extends LocalizedPageProps {}

export async function generateMetadata({ params }: PricingPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'pricing.meta' });

  return generateLocalizedMetadata({
    locale: locale as Locale,
    path: '/pricing',
    seo: {
      title: {
        tr: t('title'),
        en: t('title'),
        de: t('title'),
        fr: t('title'),
      },
      description: {
        tr: t('description'),
        en: t('description'),
        de: t('description'),
        fr: t('description'),
      },
      keywords: {
        tr: ['fiyatlandırma', 'premium', 'abonelik'],
        en: ['pricing', 'premium', 'subscription'],
        de: ['preise', 'premium', 'abonnement'],
        fr: ['tarifs', 'premium', 'abonnement'],
      },
    },
  });
}

export default async function PricingPage({ params }: PricingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navigation />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-foam to-white" aria-hidden />
        <div className="absolute inset-x-0 top-0 -z-10 h-32 bg-gradient-to-b from-coria-primary/10 via-transparent to-transparent" aria-hidden />

        <PricingHero />
        <PricingPlans />
        <FeatureComparison />
        <TrustIndicators />
        <PremiumTestimonials />
        <PricingFAQ />
        <CustomerSupport />
        <PricingCTA />
      </main>

      <Footer className="mt-12" />
    </div>
  );
}
