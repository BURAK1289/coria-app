'use client';

import { useLocale } from 'next-intl';

import { Container, Heading, Text, Card, CardContent, Button, Grid } from '@/components/ui';
import { getHomeContent } from '@/content/home';

export function FoundationShowcase() {
  const locale = useLocale();
  const foundation = getHomeContent(locale).foundation;

  return (
    <section className="relative overflow-hidden py-24">

      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--coria-primary)] shadow-lg">
            {foundation.eyebrow}
          </span>
          <Heading as="h2" size="3xl" weight="bold" className="mt-6 mb-4 text-[var(--coria-primary)]">
            {foundation.title}
          </Heading>
          <Text size="lg" color="secondary" className="text-gray-600">
            {foundation.subtitle}
          </Text>
        </div>

        <Grid cols={3} gap="lg" className="mt-14">
          {foundation.pillars.map((pillar) => (
            <Card
              key={pillar.title}
              padding="lg"
              className="rounded-[28px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm shadow-lg"
            >
              <CardContent className="space-y-3 text-left">
                <Heading as="h3" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                  {pillar.title}
                </Heading>
                <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                  {pillar.description}
                </Text>
              </CardContent>
            </Card>
          ))}
        </Grid>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {foundation.projects.map((project) => (
            <div
              key={project.title}
              className="rounded-[24px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm p-5 text-left shadow-lg"
            >
              <div className="text-sm font-semibold text-[var(--coria-primary)]">{project.title}</div>
              <div className="mt-2 text-sm text-gray-600">{project.impact}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            className="px-8"
            onClick={() => window.open(foundation.cta.href, '_self')}
          >
            {foundation.cta.label}
          </Button>
        </div>
      </Container>
    </section>
  );
}
