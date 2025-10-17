'use client';

import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';

import { Container, Heading, Text, Card, CardContent } from '@/components/ui';
import { getHomeContent } from '@/content/home';

const AnimatedMetricCard = dynamic(
  () => import('./impact-overview-animated').then(mod => ({ default: mod.AnimatedMetricCard })),
  { ssr: true }
);

export function ImpactOverview() {
  const locale = useLocale();
  const impact = getHomeContent(locale).impact;

  return (
    <section className="relative overflow-hidden py-24">
      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <Heading as="h2" size="3xl" weight="bold" className="text-[var(--coria-primary)]">
            {impact.title}
          </Heading>
          <Text size="lg" color="secondary" className="mt-4 text-gray-600">
            {impact.subtitle}
          </Text>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {impact.metrics.map((metric, index) => (
            <AnimatedMetricCard key={metric.label} index={index}>
              <div className="text-3xl font-bold text-[var(--coria-primary)]">
                {metric.value}
              </div>
              <div className="mt-2 text-sm font-semibold text-[var(--coria-primary)]/80">
                {metric.label}
              </div>
              <div className="mt-3 text-sm text-gray-600">
                {metric.description}
              </div>
            </AnimatedMetricCard>
          ))}
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {impact.insights.map((insight) => (
            <Card
              key={insight.title}
              padding="lg"
              className="rounded-[28px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm shadow-lg"
            >
              <CardContent className="space-y-3 text-left">
                <Heading as="h3" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                  {insight.title}
                </Heading>
                <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                  {insight.description}
                </Text>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
