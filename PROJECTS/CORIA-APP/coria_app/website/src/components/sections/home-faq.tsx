'use client';

import { useLocale } from 'next-intl';

import { Container, Heading, Text, Card, CardContent } from '@/components/ui';
import { getHomeContent } from '@/content/home';

export function HomeFAQ() {
  const locale = useLocale();
  const faq = getHomeContent(locale).faq;

  if (!faq.items.length) {
    return null;
  }

  return (
    <section className="relative overflow-hidden py-24">
      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <Heading as="h2" size="3xl" weight="bold" className="text-[var(--coria-primary)]">
            {faq.title}
          </Heading>
          <Text size="lg" color="secondary" className="mt-4 text-gray-600">
            {faq.subtitle}
          </Text>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {faq.items.map((item) => (
            <Card
              key={item.question}
              padding="lg"
              className="rounded-[24px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm shadow-lg"
            >
              <CardContent className="space-y-3 text-left">
                <Heading as="h3" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                  {item.question}
                </Heading>
                <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                  {item.answer}
                </Text>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
