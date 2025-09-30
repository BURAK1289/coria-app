import { Container, Heading, Text, Card, CardContent, Grid } from '@/components/ui';

const timeline = [
  { year: '2023', detail: 'Fikrin doğuşu ve ilk veri toplama prototipi' },
  { year: '2024 Q1', detail: 'MVP geliştirme ve kapalı beta' },
  { year: '2024 Q2', detail: 'Beta lansmanı ve ilk 50K kullanıcı' },
  { year: '2024 Q3', detail: 'Resmi lansman ve Foundation duyurusu' },
  { year: '2024 Q4', detail: '100K kullanıcı, ilk Foundation bağış raporu' },
  { year: '2025', detail: 'CORIA Token lansmanı ve Solana entegrasyonu' }
];

const partners = [
  { name: 'Believe Platform', description: 'Solana tabanlı token altyapısı ve etki raporlama.' },
  { name: 'Yeşil Enerji Kooperatifleri', description: 'Topluluk fonlu güneş enerjisi kurulumları.' },
  { name: 'Vegan Dernekleri', description: 'Vegan restoran dönüşümü ve eğitim programları.' }
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[var(--foam)] to-white" />
        <Container size="lg" padding="md" className="relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <Heading as="h1" size="4xl" weight="bold" className="text-[var(--coria-primary)]">
              CORIA hakkında
            </Heading>
            <Text size="lg" color="secondary" className="mt-4 text-gray-600">
              Misyonumuz: Bireylerin günlük seçimlerini vegan yaşam, sağlık ve sürdürülebilirlik ekseninde kolaylaştırmak.
            </Text>
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container size="lg" padding="md">
          <Grid cols={3} gap="lg">
            <Card padding="lg" className="rounded-[24px] border border-[rgba(27,94,63,0.12)] bg-white shadow-sm">
              <CardContent className="space-y-3 text-left">
                <Heading as="h2" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                  Vizyon
                </Heading>
                <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                  Veganlık ve bilinçli tüketimde dünyanın en güvenilir, en akıllı ve en sevilen kişisel asistanı olmak.
                </Text>
              </CardContent>
            </Card>
            <Card padding="lg" className="rounded-[24px] border border-[rgba(27,94,63,0.12)] bg-white shadow-sm">
              <CardContent className="space-y-3 text-left">
                <Heading as="h2" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                  Değerlerimiz
                </Heading>
                <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                  Doğruluk, açıklık, kapsayıcılık, veri gizliliği, bilimsel yaklaşım, çevresel ve etik sorumluluk.
                </Text>
              </CardContent>
            </Card>
            <Card padding="lg" className="rounded-[24px] border border-[rgba(27,94,63,0.12)] bg-white shadow-sm">
              <CardContent className="space-y-3 text-left">
                <Heading as="h2" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                  Konumlandırma
                </Heading>
                <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                  CORIA, çok kaynaklı ürün verisi, ESG skorları, AI önerileri ve Foundation desteğiyle 360° sürdürülebilir yaşam platformudur.
                </Text>
              </CardContent>
            </Card>
          </Grid>
        </Container>
      </section>

      <section className="bg-[var(--foam)] py-20">
        <Container size="lg" padding="md">
          <Heading as="h2" size="2xl" weight="bold" className="mb-8 text-[var(--coria-primary)]">
            Yol haritamız
          </Heading>
          <div className="space-y-4">
            {timeline.map((item) => (
              <div key={item.year} className="rounded-2xl border border-[rgba(27,94,63,0.12)] bg-white px-5 py-4 shadow-sm">
                <div className="text-sm font-semibold text-[var(--coria-primary)]">{item.year}</div>
                <div className="text-sm text-gray-600">{item.detail}</div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-20">
        <Container size="lg" padding="md">
          <Heading as="h2" size="2xl" weight="bold" className="mb-8 text-[var(--coria-primary)]">
            Partnerlikler
          </Heading>
          <div className="grid gap-6 md:grid-cols-3">
            {partners.map((partner) => (
              <Card key={partner.name} padding="lg" className="rounded-[24px] border border-[rgba(27,94,63,0.12)] bg-white shadow-sm">
                <CardContent className="space-y-3 text-left">
                  <Heading as="h3" size="lg" weight="semibold" className="text-[var(--coria-primary)]">
                    {partner.name}
                  </Heading>
                  <Text size="sm" color="secondary" className="text-gray-600 leading-relaxed">
                    {partner.description}
                  </Text>
                </CardContent>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    </div>
  );
}
