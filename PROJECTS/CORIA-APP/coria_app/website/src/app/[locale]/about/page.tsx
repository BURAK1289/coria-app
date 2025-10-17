import { useTranslations } from 'next-intl';
import { Container, Heading, Text, Card, CardContent, Grid } from '@/components/ui';
import { AboutFAQ } from '@/components/about/about-faq';

const timeline = [
  { year: '2025 Q3', detail: 'İlk MVP aşaması' },
  { year: '2025 Q4', detail: 'Yayınlama ve token çıkarma süreci' }
];

const partners = [
  { name: 'Heaven ICM', description: 'Stratejik ortağımız' }
];

export default function AboutPage() {
  const t = useTranslations('about');

  return (
    <div className="pt-32">
      <section className="relative overflow-hidden py-24">
        <Container size="lg" padding="md" className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Heading as="h1" size="4xl" weight="bold" className="text-[var(--coria-primary)]">
              {t('hero.title')}
            </Heading>
            <Text size="lg" color="secondary" className="mt-4 text-gray-600">
              {t('hero.description')}
            </Text>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container size="lg" padding="md">
          <Grid cols={3} gap="lg">
            <Card padding="lg" className="rounded-[24px] border border-white/30 bg-white/10 backdrop-blur shadow-sm">
              <CardContent className="space-y-3 text-left">
                <Heading as="h2" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                  {t('vision.title')}
                </Heading>
                <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                  {t('vision.description')}
                </Text>
              </CardContent>
            </Card>
            <Card padding="lg" className="rounded-[24px] border border-white/30 bg-white/10 backdrop-blur shadow-sm">
              <CardContent className="space-y-3 text-left">
                <Heading as="h2" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                  {t('values.title')}
                </Heading>
                <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                  {t('values.subtitle')}
                </Text>
              </CardContent>
            </Card>
            <Card padding="lg" className="rounded-[24px] border border-white/30 bg-white/10 backdrop-blur shadow-sm">
              <CardContent className="space-y-3 text-left">
                <Heading as="h2" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                  {t('positioning.title')}
                </Heading>
                <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                  {t('positioning.description')}
                </Text>
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </section>

      <section className="py-20">
        <Container size="lg" padding="md">
          <Heading as="h2" size="2xl" weight="bold" className="mb-8 text-[var(--coria-primary)]">
            {t('roadmap.title')}
          </Heading>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={item.year} className="rounded-2xl border border-white/30 bg-white/10 backdrop-blur px-5 py-4 shadow-sm">
                <div className="text-sm font-semibold text-[var(--coria-primary)]">{t(`roadmap.timeline.${index}.year`)}</div>
                <div className="text-sm text-gray-600">{t(`roadmap.timeline.${index}.detail`)}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container size="lg" padding="md">
          <Heading as="h2" size="2xl" weight="bold" className="mb-8 text-[var(--coria-primary)]">
            {t('partnerships.title')}
          </Heading>
          <div className="flex justify-center">
            {partners.map((partner, index) => (
              <Card key={partner.name} padding="lg" className="rounded-[24px] border border-white/30 bg-white/10 backdrop-blur shadow-sm max-w-md w-full">
                <CardContent className="space-y-3 text-center">
                  <Heading as="h3" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                    {t(`partnerships.items.${index}.name`)}
                  </Heading>
                  <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                    {t(`partnerships.items.${index}.description`)}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ Section - Temporarily disabled due to translation issues */}
      {/* <section className="py-20">
        <Container size="lg" padding="md">
          <AboutFAQ />
        </Container>
      </section> */}
    </div>
  );
}
