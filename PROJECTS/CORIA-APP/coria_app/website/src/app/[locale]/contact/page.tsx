import { useTranslations } from 'next-intl';
import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Navigation, Footer } from '@/components/layout';
import {
  Button,
  Container,
  Heading,
  Text,
} from '@/components/ui';
import { generateLocalizedMetadata } from '@/lib/metadata';
import { LocalizedPageProps } from '@/types/global';
import { Locale } from '@/types/localization';
import {
  ContactFormLazy,
  ContactMethodsLazy,
  ContactFAQLazy,
  SupportTicketingLazy,
} from '@/components/contact/contact-sections-lazy';

interface ContactPageProps extends LocalizedPageProps {}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact.meta' });

  return generateLocalizedMetadata({
    locale: locale as Locale,
    path: '/contact',
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
        tr: ['CORIA', 'iletişim', 'destek', 'yardım', 'müşteri hizmetleri'],
        en: ['CORIA', 'contact', 'support', 'help', 'customer service'],
        de: ['CORIA', 'Kontakt', 'Support', 'Hilfe', 'Kundendienst'],
        fr: ['CORIA', 'contact', 'support', 'aide', 'service client'],
      },
    },
  });
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Navigation />

      <main>
        <ContactHeroSection />

        <section className="relative overflow-hidden py-24 sm:py-28">
          <Container size="xl" padding="lg" className="relative z-10">
            <ContactMethodsLazy />
          </Container>
        </section>

        <section className="relative overflow-hidden py-24 sm:py-28">
          <Container size="xl" padding="lg" className="relative z-10">
            <ContactFormLazy />
          </Container>
        </section>

        <section className="relative overflow-hidden py-24 sm:py-28">
          <Container size="xl" padding="lg" className="relative z-10">
            <SupportTicketingLazy />
          </Container>
        </section>

        <section className="relative overflow-hidden pb-24 sm:pb-28">
          <Container size="xl" padding="lg" className="relative z-10">
            <ContactFAQLazy />
          </Container>
        </section>

        <ContactCTASection />
      </main>

      <Footer className="mt-12" />
    </div>
  );
}

function ContactHeroSection() {
  const t = useTranslations('contact.hero');

  const primaryLabel = t('primaryActionLabel');
  const secondaryLabel = t('secondaryActionLabel');

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-24 bg-gradient-to-br from-white via-foam/50 to-acik-gri/30">

      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <Heading as="h1" size="4xl" weight="bold" className="text-balance text-coria-primary">
            {t('title')}
          </Heading>
          <Text size="xl" className="text-gray-600">
            {t('subtitle')}
          </Text>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg">
              <a href="mailto:support@coria.app">{primaryLabel}</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://help.coria.app" target="_blank" rel="noopener noreferrer">
                {secondaryLabel}
              </a>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

function ContactCTASection() {
  const t = useTranslations('contact.cta');

  return (
    <section className="relative overflow-hidden py-24 sm:py-28 bg-white">

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
              <a href="mailto:partners@coria.app">{t('primaryLabel')}</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="https://cal.com/coria" target="_blank" rel="noopener noreferrer">
                {t('secondaryLabel')}
              </a>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
