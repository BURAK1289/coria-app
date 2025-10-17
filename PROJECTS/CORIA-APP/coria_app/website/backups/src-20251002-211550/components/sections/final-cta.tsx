'use client';

import { useLocale } from 'next-intl';

import { Container, Heading, Text, Button } from '@/components/ui';
import { getHomeContent } from '@/content/home';

export function FinalCTA() {
  const locale = useLocale();
  const finalCta = getHomeContent(locale).finalCta;

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[var(--coria-primary)] via-[var(--coria-secondary)] to-[var(--coria-primary-dark)]" />
      <div className="absolute inset-0 -z-10 bg-black/20" />

      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-3xl rounded-[36px] border border-white/30 bg-white/10 px-10 py-14 text-center shadow-[0_45px_90px_-40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <Heading as="h2" size="3xl" weight="bold" className="text-white">
            {finalCta.title}
          </Heading>
          <Text size="lg" className="mt-4 text-white/80">
            {finalCta.subtitle}
          </Text>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              variant="ghost"
              size="lg"
              className="flex items-center gap-3 rounded-full border border-white/60 bg-white/15 px-7 py-3 text-white transition-all hover:bg-white/25"
              onClick={() => window.open(finalCta.primary.href, '_self')}
            >
              {finalCta.primary.label}
            </Button>
            {finalCta.secondary ? (
              <Button
                variant="ghost"
                size="lg"
                className="flex items-center gap-3 rounded-full border border-white/40 bg-transparent px-7 py-3 text-white/80 transition-all hover:bg-white/15 hover:text-white"
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
