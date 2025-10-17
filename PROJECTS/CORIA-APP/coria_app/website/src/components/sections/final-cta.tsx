'use client';

import { useLocale } from 'next-intl';

import { Container, Heading, Text, Button } from '@/components/ui';
import { getHomeContent } from '@/content/home';

export function FinalCTA() {
  const locale = useLocale();
  const finalCta = getHomeContent(locale).finalCta;

  return (
    <section className="relative overflow-hidden py-24">
      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-3xl rounded-[36px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm px-10 py-14 text-center shadow-lg">
          <Heading as="h2" size="3xl" weight="bold" className="text-coria-primary">
            {finalCta.title}
          </Heading>
          <Text size="lg" className="mt-4 text-gray-600">
            {finalCta.subtitle}
          </Text>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              variant="primary"
              size="lg"
              className="flex items-center gap-3 rounded-full px-7 py-3"
              onClick={() => window.open(finalCta.primary.href, '_self')}
            >
              {finalCta.primary.label}
            </Button>
            {finalCta.secondary ? (
              <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-3 rounded-full px-7 py-3"
                onClick={() => window.open(finalCta.secondary!.href, '_self')}
              >
                {finalCta.secondary.label}
              </Button>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
