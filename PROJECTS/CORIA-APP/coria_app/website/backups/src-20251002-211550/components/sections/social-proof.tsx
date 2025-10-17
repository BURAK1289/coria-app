'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';

import { Container, Heading, Text } from '@/components/ui';
import { getHomeContent } from '@/content/home';

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export function SocialProof() {
  const locale = useLocale();
  const { socialProof } = getHomeContent(locale);

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[var(--foam)] to-white" />
      <div className="absolute -left-24 top-12 -z-10 h-60 w-60 rounded-full bg-[rgba(102,187,106,0.18)] blur-3xl" />
      <div className="absolute -right-28 top-1/2 -z-10 h-72 w-72 rounded-full bg-[rgba(38,166,154,0.18)] blur-3xl" />

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
            <motion.div
              key={item.title}
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              transition={{ delay: index * 0.08 }}
              className="flex h-full flex-col gap-4 rounded-[28px] border border-[rgba(27,94,63,0.12)] bg-white/95 p-6 text-left shadow-[0_30px_70px_-50px_rgba(27,94,63,0.25)] backdrop-blur"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--coria-primary)]/10 text-xl text-[var(--coria-primary)]">
                {item.icon}
              </span>
              <Text size="md" weight="semibold" className="text-[var(--coria-primary)]">
                {item.title}
              </Text>
              <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                {item.description}
              </Text>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
