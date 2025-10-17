'use client';

import { useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

import {
  Container,
  Heading,
  Text,
  Button
} from '@/components/ui';
import { AppleIcon, GooglePlayIcon } from '@/components/icons';

const AnimatedCTACard = dynamic(
  () => import('./download-cta-animated').then(mod => ({ default: mod.AnimatedCTACard })),
  { ssr: true }
);

export function DownloadCTA() {
  const t = useTranslations('home.cta');

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(120%_120%_at_10%_10%,rgba(205,234,221,0.5),transparent_60%),radial-gradient(120%_120%_at_90%_15%,rgba(210,240,243,0.5),transparent_65%),linear-gradient(180deg,var(--coria-primary-light)_0%,var(--leaf)_60%,var(--coria-primary)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-black/5" aria-hidden />

      <Container size="xl" padding="lg" className="relative z-10">
        <AnimatedCTACard className="mx-auto max-w-4xl rounded-[40px] border border-[var(--foam)] bg-[var(--foam)]/85 p-10 text-center shadow-[0_45px_80px_-35px_rgba(12,53,32,0.55)] backdrop-blur-sm">

          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--foam)] bg-[var(--foam)]/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-coria-primary">
            {t('badge')}
          </span>

          <Heading as="h2" size="3xl" weight="bold" className="mt-6 mb-4 text-coria-primary text-balance">
            {t('title')}
          </Heading>

          <Text size="lg" className="mx-auto mb-10 max-w-2xl text-gray-700">
            {t('subtitle')}
          </Text>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              variant="ghost"
              size="lg"
              className="flex items-center gap-3 rounded-full border border-[var(--foam)] bg-[var(--foam)]/90 px-7 py-3 text-coria-primary shadow-lg shadow-black/10 transition-all hover:border-[var(--foam)] hover:bg-[var(--foam)]/95"
              onClick={() => window.open('https://apps.apple.com/app/coria', '_blank')}
            >
              <AppleIcon className="h-5 w-5" />
              {t('downloadIos')}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="flex items-center gap-3 rounded-full border border-[var(--foam)] bg-[var(--foam)]/85 px-7 py-3 text-coria-primary transition-all hover:border-[var(--foam)] hover:bg-[var(--foam)]/90"
              onClick={() => window.open('https://play.google.com/store/apps/details?id=com.coria.app', '_blank')}
            >
              <GooglePlayIcon className="h-5 w-5" />
              {t('downloadAndroid')}
            </Button>
          </div>

          <Text size="sm" className="mt-8 text-gray-600">
            {t('footnote')}
          </Text>
        </AnimatedCTACard>
      </Container>
    </section>
  );
}
