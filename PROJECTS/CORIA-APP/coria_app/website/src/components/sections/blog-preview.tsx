'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';

import { Container, Heading, Text, Card, CardContent } from '@/components/ui';
import { getHomeContent } from '@/content/home';

export function BlogPreview() {
  const locale = useLocale();
  const blog = getHomeContent(locale).blog;

  return (
    <section className="relative overflow-hidden py-24">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[var(--foam)] to-white" />
      <Container size="xl" padding="lg" className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <Heading as="h2" size="3xl" weight="bold" className="text-[var(--coria-primary)]">
            {blog.title}
          </Heading>
          <Text size="lg" color="secondary" className="mt-4 text-gray-600">
            {blog.subtitle}
          </Text>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {blog.articles.map((article) => (
            <motion.div
              key={article.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
            >
              <Card
                padding="lg"
                className="h-full rounded-[24px] border border-[rgba(27,94,63,0.12)] bg-white/95 shadow-[0_24px_60px_-45px_rgba(27,94,63,0.25)]"
              >
                <CardContent className="flex h-full flex-col gap-4 text-left">
                  <Heading as="h3" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                    {article.title}
                  </Heading>
                  <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                    {article.excerpt}
                  </Text>
                  <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
                    <span>{article.readTime}</span>
                    <Link href={article.url} className="font-semibold text-[var(--coria-primary)] hover:underline">
                      {blog.cta.label}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
