import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';

import { Navigation, Footer } from '@/components/layout';
import { FeaturesSidebar } from '@/components/features/features-sidebar';
import { FeatureContent } from '@/components/features/feature-content';
import {
  Button,
  Container,
  Heading,
  Text,
} from '@/components/ui';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; feature?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'features' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function FeaturesPage({ params, searchParams }: Props) {
  const { locale: _locale } = await params;
  void _locale;
  const { category, feature } = await searchParams;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navigation />

      <main>
        <FeaturesHero />

        <section className="relative overflow-hidden pb-24">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-foam to-white" aria-hidden />
          <div className="absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-coria-primary/10 to-transparent" aria-hidden />
          <div className="absolute -right-28 top-20 -z-10 h-64 w-64 rounded-full bg-coria-sky/20 blur-3xl" aria-hidden />
          <div className="absolute -left-24 bottom-10 -z-10 h-64 w-64 rounded-full bg-coria-mint/20 blur-3xl" aria-hidden />

          <Container size="xl" padding="lg" className="pt-10">
            <div className="grid gap-8 lg:grid-cols-[320px,minmax(0,1fr)]">
              <div className="rounded-[28px] border border-white/70 bg-white/95 p-6 shadow-[0_35px_80px_-55px_rgba(27,94,63,0.45)] backdrop-blur">
                <FeaturesSidebar activeCategory={category} activeFeature={feature} />
              </div>

              <div className="rounded-[32px] border border-white/70 bg-white/95 p-8 shadow-[0_35px_80px_-55px_rgba(27,94,63,0.35)] backdrop-blur">
                <FeatureContent category={category} feature={feature} />
              </div>
            </div>
          </Container>
        </section>

        <FeaturesCTA />
      </main>

      <Footer className="mt-12" />
    </div>
  );
}

function FeaturesHero() {
  const t = useTranslations('features.overview');

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-coria-primary via-leaf to-water" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)]" aria-hidden />

      <Container size="xl" padding="lg" className="relative z-10 text-white">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <Heading as="h1" size="4xl" weight="bold" className="text-balance">
            {t('title')}
          </Heading>
          <Text size="xl" className="text-white/80">
            {t('subtitle')}
          </Text>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg" className="bg-white text-coria-primary hover:bg-white/90">
              <a href="https://apps.apple.com/app/coria" target="_blank" rel="noopener noreferrer">
                {t('cta.downloadIos')}
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg" className="border border-white/60 text-white hover:bg-white/10">
              <a href="https://play.google.com/store/apps/details?id=com.coria.app" target="_blank" rel="noopener noreferrer">
                {t('cta.downloadAndroid')}
              </a>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function FeaturesCTA() {
  const t = useTranslations('features.overview.cta');

  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-coria-primary via-coria-secondary to-water" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-black/10" aria-hidden />

      <Container size="xl" padding="lg" className="relative z-10 text-white">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <Heading as="h2" size="3xl" weight="bold" className="text-balance">
            {t('title')}
          </Heading>
          <Text size="lg" className="text-white/80">
            {t('description')}
          </Text>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="ghost" size="lg" className="flex items-center gap-3 rounded-full border border-white/60 bg-white/15 px-6 text-white hover:bg-white/25">
              <a href="https://apps.apple.com/app/coria" target="_blank" rel="noopener noreferrer">
                {t('downloadIos')}
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg" className="flex items-center gap-3 rounded-full border border-white/50 bg-transparent px-6 text-white hover:bg-white/20">
              <a href="https://play.google.com/store/apps/details?id=com.coria.app" target="_blank" rel="noopener noreferrer">
                {t('downloadAndroid')}
              </a>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
