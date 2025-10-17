'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';

import { Container, Heading, Text, Card, CardContent } from '@/components/ui';
import { getHomeContent } from '@/content/home';

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export function AudienceInsights() {
  const locale = useLocale();
  const { personas } = getHomeContent(locale);

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[var(--foam)] to-white" />
      <div className="absolute left-6 top-8 -z-10 h-48 w-48 rounded-full bg-[rgba(255,107,107,0.18)] blur-3xl" />
      <div className="absolute -right-32 bottom-8 -z-10 h-56 w-56 rounded-full bg-[rgba(102,187,106,0.2)] blur-3xl" />

      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <Heading as="h2" size="3xl" weight="bold" className="text-balance text-[var(--coria-primary)]">
            Her persona için kişiselleştirilmiş deneyim
          </Heading>
          <Text size="lg" color="secondary" className="mt-4 text-gray-600">
            Vegan adaylarından sürdürülebilirlik savunucularına kadar herkes CORIA’da kendine uygun bir yolculuk bulur.
          </Text>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {personas.map((persona, index) => (
            <motion.div
              key={persona.title}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: index * 0.08 }}
            >
              <Card
                padding="lg"
                className="h-full rounded-[28px] border border-[rgba(27,94,63,0.12)] bg-white/95 shadow-[0_26px_66px_-50px_rgba(27,94,63,0.25)]"
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
                      <li key={highlight} className="rounded-2xl border border-[rgba(27,94,63,0.1)] bg-white/90 px-4 py-2">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
