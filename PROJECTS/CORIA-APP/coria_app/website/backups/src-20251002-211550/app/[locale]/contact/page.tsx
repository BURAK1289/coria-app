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
import { ContactForm } from '@/components/contact/contact-form';
import { ContactMethods } from '@/components/contact/contact-methods';
import { ContactFAQ } from '@/components/contact/contact-faq';
import { SupportTicketing } from '@/components/contact/support-ticketing';
import { generateLocalizedMetadata } from '@/lib/metadata';
import { LocalizedPageProps } from '@/types/global';
import { Locale } from '@/types/localization';

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
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-foam to-white" aria-hidden />
          <Container size="xl" padding="lg" className="relative z-10">
            <ContactMethods />
          </Container>
        </section>

        <section className="relative overflow-hidden py-24 sm:py-28">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white to-foam" aria-hidden />
          <div className="absolute -right-20 top-12 -z-10 h-64 w-64 rounded-full bg-coria-mint/20 blur-3xl" aria-hidden />
          <Container size="xl" padding="lg" className="relative z-10">
            <ContactForm />
          </Container>
        </section>

        <section className="relative overflow-hidden py-24 sm:py-28">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-foam to-white" aria-hidden />
          <div className="absolute left-16 top-10 -z-10 h-56 w-56 rounded-full bg-coria-sky/20 blur-3xl" aria-hidden />
          <Container size="xl" padding="lg" className="relative z-10">
            <SupportTicketing />
          </Container>
        </section>

        <section className="relative overflow-hidden pb-24 sm:pb-28">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-white to-foam" aria-hidden />
          <Container size="xl" padding="lg" className="relative z-10">
            <ContactFAQ />
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
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-coria-primary via-leaf to-water" aria-hidden />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_60%)]" aria-hidden />

      <Container size="xl" padding="lg" className="relative z-10 text-white">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <Heading as="h1" size="4xl" weight="bold" className="text-balance">
            {t('title')}
          </Heading>
          <Text size="xl" className="text-white/80">
            {t('subtitle')}
          </Text>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="primary" size="lg" className="bg-white text-coria-primary hover:bg-white/90">
              <a href="mailto:support@coria.app">{primaryLabel}</a>
            </Button>
            <Button asChild variant="ghost" size="lg" className="border border-white/60 text-white hover:bg-white/10">
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
              <a href="mailto:partners@coria.app">{t('primaryLabel')}</a>
            </Button>
            <Button asChild variant="ghost" size="lg" className="flex items-center gap-3 rounded-full border border-white/50 bg-transparent px-6 text-white hover:bg-white/20">
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
