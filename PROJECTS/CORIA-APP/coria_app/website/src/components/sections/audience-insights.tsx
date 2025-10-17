'use client';

import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

import { Container, Heading, Text, Card, CardContent } from '@/components/ui';
import { getHomeContent } from '@/content/home';

const AnimatedPersonaCard = dynamic(
  () => import('./audience-insights-animated').then(mod => ({ default: mod.AnimatedPersonaCard })),
  { ssr: true }
);

export function AudienceInsights() {
  const locale = useLocale();
  const t = useTranslations('home.audience');
  const { personas } = getHomeContent(locale);

  return (
    <section className="relative overflow-hidden py-24">

      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <Heading as="h2" size="3xl" weight="bold" className="text-balance text-[var(--coria-primary)]">
            {t('title')}
          </Heading>
          <Text size="lg" color="secondary" className="mt-4 text-gray-600">
            {t('description')}
          </Text>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {personas.map((persona, index) => (
            <AnimatedPersonaCard key={persona.title} index={index}>
              <Card
                padding="lg"
                className="h-full rounded-[28px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm shadow-lg"
              >
                <CardContent className="flex h-full flex-col gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--coria-primary)]/10 text-xl text-[var(--coria-primary)]">
                    {persona.icon}
                  </span>
                  <Heading as="h3" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                    {persona.title}
                  </Heading>
                  <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                    {persona.description}
                  </Text>
                  <ul className="mt-auto space-y-2 text-sm text-gray-600">
                    {persona.highlights.map((highlight) => (
                      <li key={highlight} className="rounded-2xl border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm px-4 py-2">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedPersonaCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
