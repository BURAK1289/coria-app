'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';

import { Container, Heading, Text, Button, Card, CardContent } from '@/components/ui';
import { PlayIcon } from '@/components/icons';
import { getHomeContent } from '@/content/home';

const DEMO_POSTER = '/ekran-goruntusu.jpeg';

export function DemoShowcase() {
  const locale = useLocale();
  const demo = getHomeContent(locale).demo;

  return (
    <section id="demo" className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[var(--foam)] to-white" />
      <Container size="xl" padding="lg" className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-[0.9fr,1.1fr]">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
          >
            <Heading as="h2" size="3xl" weight="bold" className="mb-4 text-[var(--coria-primary)]">
              {demo.title}
            </Heading>
            <Text size="lg" color="secondary" className="mb-6 text-gray-600">
              {demo.subtitle}
            </Text>
            <ul className="space-y-4 text-gray-600">
              {demo.steps.map((step) => (
                <li key={step.title} className="rounded-2xl border border-[rgba(27,94,63,0.12)] bg-white/95 px-4 py-3 shadow-sm">
                  <div className="text-sm font-semibold text-[var(--coria-primary)]">{step.title}</div>
                  <div className="text-sm text-gray-600">{step.description}</div>
                </li>
              ))}
            </ul>
            <Text size="sm" color="secondary" className="mt-6 text-gray-500">
              {demo.note}
            </Text>
            <Button
              variant="ghost"
              size="lg"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--coria-primary)]/20 px-6 py-3 text-[var(--coria-primary)]"
              onClick={() => {
                const demoSection = document.querySelector('#demo-video');
                if (demoSection) {
                  demoSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
            >
              <PlayIcon className="h-4 w-4" />
              {demo.cta.label}
            </Button>
          </motion.div>

          <motion.div
            id="demo-video"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card padding="none" className="overflow-hidden rounded-[32px] border border-[rgba(27,94,63,0.12)] bg-white/90 shadow-[0_40px_90px_-40px_rgba(27,94,63,0.25)]">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={DEMO_POSTER}
                    alt={demo.posterAlt}
                    width={960}
                    height={1280}
                    className="h-auto w-full object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-[var(--coria-primary)] shadow">
                    <PlayIcon className="h-4 w-4" />
                    {demo.cta.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
