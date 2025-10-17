'use client';

import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';

import { Container, Heading, Text } from '@/components/ui';
import { getHomeContent } from '@/content/home';

const AnimatedProofCard = dynamic(
  () => import('./social-proof-animated').then(mod => ({ default: mod.AnimatedProofCard })),
  { ssr: true }
);

export function SocialProof() {
  const locale = useLocale();
  const { socialProof } = getHomeContent(locale);

  return (
    <section className="relative overflow-hidden py-24">

      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <Heading as="h2" size="2xl" weight="bold" className="mb-4 text-[var(--coria-primary)]">
            {socialProof.title}
          </Heading>
          <Text size="lg" color="secondary" className="text-gray-600">
            {socialProof.subtitle}
          </Text>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {socialProof.items.map((item, index) => (
            <AnimatedProofCard key={item.title} index={index}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--coria-primary)]/10 text-xl text-[var(--coria-primary)]">
                {item.icon}
              </span>
              <Text size="md" weight="semibold" className="text-[var(--coria-primary)]">
                {item.title}
              </Text>
              <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                {item.description}
              </Text>
            </AnimatedProofCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
