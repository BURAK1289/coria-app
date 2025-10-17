'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useTranslations, useMessages } from 'next-intl';
import { motion } from 'framer-motion';

import {
  Container,
  Heading,
  Text,
  Button,
  Card,
  CardContent
} from '@/components/ui';
import { PlayIcon, AppleIcon, GooglePlayIcon } from '@/components/icons';
import { isNonEmptyString } from '@/lib/type-guards';

interface DemoStepMessage {
  title?: unknown;
  description?: unknown;
  emphasis?: unknown;
}

interface DemoStep {
  title: string;
  description: string;
  emphasis?: string;
}

function toDemoStep(value: DemoStepMessage): DemoStep | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const title = isNonEmptyString(value.title) ? value.title : '';
  const description = isNonEmptyString(value.description) ? value.description : '';

  if (!title || !description) {
    return null;
  }

  const emphasis = isNonEmptyString(value.emphasis) ? value.emphasis : undefined;

  return { title, description, emphasis };
}

export function DemoExperience() {
  const t = useTranslations('home.demo');
  const messages = useMessages();

  const steps = useMemo(() => {
    const demoMessages =
      messages && typeof messages === 'object' && messages !== null
        ? (messages as Record<string, unknown>).home
        : null;

    const demoContent =
      demoMessages && typeof demoMessages === 'object' && demoMessages !== null
        ? (demoMessages as Record<string, unknown>).demo
        : null;

    const rawSteps =
      demoContent && typeof demoContent === 'object' && demoContent !== null
        ? (demoContent as Record<string, unknown>).steps
        : null;

    if (!Array.isArray(rawSteps)) {
      return [] as DemoStep[];
    }

    return rawSteps
      .map((item) => toDemoStep(item as DemoStepMessage))
      .filter((step): step is DemoStep => step !== null)
      .slice(0, 4);
  }, [messages]);

  return (
    <section className="relative overflow-hidden py-24 sm:py-28">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-foam to-mist" />
        <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-coria-mint/25 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 right-1/4 h-72 w-72 rounded-full bg-coria-sky/20 blur-3xl" aria-hidden />
      </div>

      <Container size="xl" padding="lg" className="relative z-10">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr,0.95fr] xl:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <Card
              padding="none"
              className="relative overflow-hidden rounded-[32px] border-coria-primary/15 bg-white/95 shadow-[0_40px_90px_-45px_rgba(27,94,63,0.35)] backdrop-blur"
            >
              <CardContent className="p-0">
                <div className="flex flex-col gap-6 p-8">
                  <div className="overflow-hidden rounded-[28px] border border-white/60 bg-black/90 p-4 shadow-inner">
                    <div className="overflow-hidden rounded-[22px] border border-black/20">
                      <Image
                        src="/ekran-goruntusu.jpeg"
                        alt={t('video.title')}
                        width={640}
                        height={1386}
                        className="h-auto w-full object-cover"
                        priority
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-coria-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-coria-primary">
                      {t('video.badge')}
                    </span>
                    <Text size="sm" color="secondary" className="text-gray-500">
                      {t('video.length')}
                    </Text>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-coria-primary/10 bg-coria-primary/5 p-5 shadow-inner">
                    <div className="flex items-start justify-between">
                      <div>
                        <Text size="sm" className="font-semibold text-gray-800">
                          {t('video.title')}
                        </Text>
                        <Text size="xs" color="secondary" className="text-gray-500">
                          {t('video.description')}
                        </Text>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-4 text-coria-primary shadow"
                      >
                        <PlayIcon className="h-4 w-4" />
                        {t('video.cta')}
                      </Button>
                    </div>
                    <Text size="xs" color="secondary" className="text-gray-500">
                      {t('video.caption')}
                    </Text>
                  </div>

                  <div className="grid gap-4 rounded-2xl border border-coria-primary/10 bg-white/95 p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <Text size="sm" className="font-semibold text-gray-800">
                          {t('download.title')}
                        </Text>
                        <Text size="xs" color="secondary" className="text-gray-500">
                          {t('download.badge')}
                        </Text>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2 rounded-full border border-coria-primary/20 px-4 text-coria-primary"
                          onClick={() => window.open('https://apps.apple.com/app/coria', '_blank')}
                        >
                          <AppleIcon className="h-4 w-4" />
                          {t('download.ios')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 rounded-full border border-coria-primary/20 px-4 text-coria-primary"
                          onClick={() => window.open('https://play.google.com/store/apps/details?id=com.coria.app', '_blank')}
                        >
                          <GooglePlayIcon className="h-4 w-4" />
                          {t('download.android')}
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-2 text-xs text-gray-600">
                      {steps.slice(0, 2).map((step, idx) => (
                        <div
                          key={`demo-highlight-${idx}-${step.title}`}
                          className="flex items-center justify-between rounded-2xl bg-coria-primary/5 px-4 py-2 text-coria-primary"
                        >
                          <span className="font-semibold">{step.title}</span>
                          <span className="text-right text-coria-primary/80">{step.emphasis ?? step.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="order-2 space-y-8 lg:order-1"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-coria-primary/15 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-coria-primary shadow-sm">
              {t('badge')}
            </span>
            <Heading as="h2" size="3xl" weight="bold" className="text-balance">
              <span className="bg-gradient-to-r from-coria-primary via-leaf to-water bg-clip-text text-transparent">
                {t('title')}
              </span>
            </Heading>
            <Text size="lg" color="secondary" className="max-w-xl text-gray-600">
              {t('subtitle')}
            </Text>

            <div className="space-y-5">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 rounded-2xl border border-coria-primary/10 bg-white/95 p-5 shadow-sm"
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-coria-primary/10 text-sm font-semibold text-coria-primary">
                    {index + 1}
                  </span>
                  <div className="space-y-1">
                    <Heading as="h3" size="lg" weight="semibold" className="text-coria-primary">
                      {step.title}
                    </Heading>
                    <Text size="sm" color="secondary" className="text-gray-600">
                      {step.description}
                    </Text>
                    {step.emphasis ? (
                      <Text size="sm" className="text-coria-primary font-semibold">
                        {step.emphasis}
                      </Text>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-start gap-4 sm:flex-row">
              <Button
                variant="primary"
                size="lg"
                className="flex items-center gap-3 shadow-lg shadow-coria-primary/20"
                onClick={() => window.open('https://apps.apple.com/app/coria', '_blank')}
              >
                <AppleIcon className="h-5 w-5" />
                {t('cta.primary')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex items-center gap-3 border-coria-primary/25"
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.coria.app', '_blank')}
              >
                <GooglePlayIcon className="h-5 w-5" />
                {t('cta.secondary')}
              </Button>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
