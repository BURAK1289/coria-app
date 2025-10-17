import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { FeatureComparison } from '@/components/pricing/feature-comparison';
import { RegionalPricing } from '@/components/pricing/regional-pricing';
import { PaywallShowcase } from '@/components/pricing/paywall-showcase';
import { TrustIndicators } from '@/components/pricing/trust-indicators';
import { PricingFAQ } from '@/components/pricing/pricing-faq';
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
    <main className="relative overflow-hidden min-h-screen text-text-primary pt-32">
      <RegionalPricing />
      <PaywallShowcase />
      <FeatureComparison />
      <TrustIndicators />
      <PricingFAQ />
    </main>
  );
}
