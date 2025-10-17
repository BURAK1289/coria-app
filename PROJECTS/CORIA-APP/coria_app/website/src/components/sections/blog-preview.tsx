'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import dynamic from 'next/dynamic';

import { Container, Heading, Text, Card, CardContent } from '@/components/ui';
import { getHomeContent } from '@/content/home';

const AnimatedBlogCard = dynamic(
  () => import('./blog-preview-animated').then(mod => ({ default: mod.AnimatedBlogCard })),
  { ssr: true }
);

export function BlogPreview() {
  const locale = useLocale();
  const blog = getHomeContent(locale).blog;

  return (
    <section className="relative overflow-hidden py-24">
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
            <AnimatedBlogCard key={article.title}>
              <Card
                padding="lg"
                className="h-full rounded-[24px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm shadow-lg"
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
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[var(--coria-primary)] hover:underline"
                    >
                      {blog.cta.label}
                    </a>
                  </div>
                </CardContent>
              </Card>
            </AnimatedBlogCard>
          ))}
        </div>
      </Container>
    </section>
  );
}
