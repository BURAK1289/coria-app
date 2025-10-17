import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import type { Metadata } from 'next';
import {
  Button,
  Container,
  Heading,
  Text,
} from '@/components/ui';
import {
  FeaturesSidebarLazy,
  FeatureContentLazy,
} from '@/components/features/features-lazy';

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
    <main className="min-h-screen text-text-primary">
      <FeaturesHero />

      <section className="relative overflow-hidden pb-24">
        <Container size="xl" padding="lg" className="pt-10">
          <div className="grid gap-8 lg:grid-cols-[1fr,2fr]">
            <div>
              <FeaturesSidebarLazy activeCategory={category} activeFeature={feature} />
            </div>

            <div>
              <FeatureContentLazy category={category} feature={feature} />
            </div>
          </div>
        </Container>
      </section>

      <FeaturesCTA />
    </main>
  );
}

function FeaturesHero() {
  const t = useTranslations('features.overview');

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-24">

      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <Heading as="h1" size="4xl" weight="bold" className="text-balance text-coria-primary">
            {t('title')}
          </Heading>
          <Text size="xl" className="text-gray-600">
            {t('subtitle')}
          </Text>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg">
              <a href="https://apps.apple.com/app/coria" target="_blank" rel="noopener noreferrer">
                {t('cta.downloadIos')}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
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

      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <Heading as="h2" size="3xl" weight="bold" className="text-balance text-coria-primary">
            {t('title')}
          </Heading>
          <Text size="lg" className="text-gray-600">
            {t('description')}
          </Text>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg">
              <a href="https://apps.apple.com/app/coria" target="_blank" rel="noopener noreferrer">
                {t('downloadIos')}
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
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
