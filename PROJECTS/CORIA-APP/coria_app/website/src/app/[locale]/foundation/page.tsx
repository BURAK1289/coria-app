'use client';

import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Icon } from '@/components/icons/Icon';
import {
  CoriaFoundationIcon,
  TokenEconomyIcon,
  TransparencyIcon,
  ImpactFocusIcon,
  CommunityIcon
} from '@/components/icons/coria-icons';

import { Container, Heading, Text, Card, CardContent, Button, Grid } from '@/components/ui';

// Lazy-load Framer Motion animations
const AnimatedBackground = dynamic(
  () => import('./foundation-page-animated').then(mod => ({ default: mod.AnimatedBackground })),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 -z-10" />
  }
);

const AnimatedHeroContent = dynamic(
  () => import('./foundation-page-animated').then(mod => ({ default: mod.AnimatedHeroContent })),
  { ssr: true }
);

const AnimatedHeroItem = dynamic(
  () => import('./foundation-page-animated').then(mod => ({ default: mod.AnimatedHeroItem })),
  { ssr: true }
);

const AnimatedSectionHeader = dynamic(
  () => import('./foundation-page-animated').then(mod => ({ default: mod.AnimatedSectionHeader })),
  { ssr: true }
);

const AnimatedCard = dynamic(
  () => import('./foundation-page-animated').then(mod => ({ default: mod.AnimatedCard })),
  { ssr: true }
);

const AnimatedTimelinePhase = dynamic(
  () => import('./foundation-page-animated').then(mod => ({ default: mod.AnimatedTimelinePhase })),
  { ssr: true }
);

// CORIA Foundation özel ikonları ve veriler - tasarım dokümanından alındı
const FoundationIcon = () => (
  <CoriaFoundationIcon className="h-8 w-8" />
);

// Tasarım dokümanındaki Foundation bilgileri
const foundationData = {
  title: "CORIA Foundation",
  subtitle: "Birlikte Daha Büyük Etki Yaratıyoruz",
  description: "CORIA, uygulama gelirlerinin bir kısmını sürdürülebilirlik projelerine yatırım yapmak için CORIA Foundation'ı kuruyor. Believe platformu üzerinden çıkarılacak özel Solana token ile blockchain ekosisteminde yer alarak, token fee gelirlerini de yeşil enerji, veganlık ve sürdürülebilirlik projelerinin fonlanmasında kullanacak.",

  tokenEconomy: {
    title: "CORIA Token Ekonomisi",
    description: "Believe Platform entegrasyonu ile Solana tabanlı token kullanım alanları",
    features: [
      {
        icon: <TokenEconomyIcon className="h-6 w-6" />,
        title: "CORIA Token",
        description: "Believe Platform üzerinden çıkarılacak özel Solana token"
      },
      {
        icon: <ImpactFocusIcon className="h-6 w-6" />,
        title: "Fee Dağılım Modeli",
        description: "Token işlem ücretleri direkt olarak sürdürülebilirlik projelerine aktarılır"
      },
      {
        icon: <TransparencyIcon className="h-6 w-6" />,
        title: "Şeffaf Fonlama",
        description: "Blockchain tabanlı şeffaf fon dağıtımı ve etki takibi"
      }
    ]
  },

  principles: [
    {
      icon: <TransparencyIcon className="h-6 w-6" />,
      title: "Şeffaflık",
      description: "Tüm fonlama kararları ve etki raporları halka açık blockchain üzerinde"
    },
    {
      icon: <CommunityIcon className="h-6 w-6" />,
      title: "Topluluk Yönetimi",
      description: "CORIA token sahipleri proje seçiminde oy kullanma hakkına sahip"
    },
    {
      icon: <ImpactFocusIcon className="h-6 w-6" />,
      title: "Etki Odaklılık",
      description: "Her projenin ölçülebilir çevresel ve sosyal etkisi raporlanır"
    }
  ]
};

const phases = [
  {
    year: '2025 Q3',
    icon: <Icon name="star" size={20} aria-hidden="true" />,
    items: ['Heaven ICM partnership']
  },
  {
    year: '2025 Q4',
    icon: <Icon name="trending-up" size={20} aria-hidden="true" />,
    items: ['Token launch', 'RWA projects']
  }
];

export default function FoundationPage() {
  const locale = useLocale();
  const t = useTranslations('foundation');

  return (
    <div className="min-h-screen pt-32">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Modern Background - Lazy-loaded */}
        <AnimatedBackground className="absolute inset-0 -z-10" />

        <Container size="xl" padding="lg" className="relative z-10">
          <AnimatedHeroContent>
            {/* Foundation Logo */}
            <AnimatedHeroItem delay={0.1}>
              <div className="mb-8 flex justify-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-[24px] bg-gradient-to-br from-coria-primary/10 to-leaf/10 backdrop-blur-sm border border-coria-primary/10">
                  <FoundationIcon />
                </div>
              </div>
            </AnimatedHeroItem>

            <AnimatedHeroItem delay={0.2}>
              <Heading as="h1" size="4xl" weight="bold" className="text-5xl lg:text-6xl text-balance text-coria-primary mb-6">
                {t('hero.title')}
              </Heading>
            </AnimatedHeroItem>

            <AnimatedHeroItem delay={0.3}>
              <Text size="xl" className="text-2xl text-gray-600 mb-6 font-medium">
                {t('hero.subtitle')}
              </Text>
            </AnimatedHeroItem>

            <AnimatedHeroItem delay={0.4}>
              <Text size="lg" className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-10">
                {t('hero.description')}
              </Text>
            </AnimatedHeroItem>

            <AnimatedHeroItem delay={0.5}>
              <Link href={`/${locale}/foundation/apply`}>
                <Button
                  variant="primary"
                  size="xl"
                  rounded="organic"
                >
                  {t('hero.cta')}
                </Button>
              </Link>
            </AnimatedHeroItem>
          </AnimatedHeroContent>
        </Container>
      </section>

      {/* Token Economy Section */}
      <section className="py-20 lg:py-32">
        <Container size="xl" padding="lg">
          <AnimatedSectionHeader className="text-center mb-16">
            <Heading as="h2" size="3xl" weight="bold" className="text-4xl lg:text-5xl text-coria-primary mb-6">
              {t('tokenEconomy.title')}
            </Heading>
            <Text size="xl" className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('tokenEconomy.description')}
            </Text>
          </AnimatedSectionHeader>

          <div className="grid gap-8 md:grid-cols-3">
            {foundationData.tokenEconomy.features.map((feature, index) => (
              <AnimatedCard
                key={feature.title}
                index={index}
              >
                <Card
                  variant="glass"
                  rounded="organic"
                  hover={true}
                  padding="lg"
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[28px] pointer-events-none" />

                  <div className="relative z-10">
                    <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-coria-primary/10 text-coria-primary group-hover:bg-coria-primary/20 transition-colors duration-300">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-coria-primary mb-3">
                      {t(`tokenEconomy.features.${index}.title`)}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {t(`tokenEconomy.features.${index}.description`)}
                    </p>
                  </div>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </Container>
      </section>

      {/* Foundation Principles */}
      <section className="py-20 lg:py-32">
        <Container size="xl" padding="lg">
          <AnimatedSectionHeader className="text-center mb-16">
            <Heading as="h2" size="3xl" weight="bold" className="text-4xl lg:text-5xl text-coria-primary mb-6">
              {t('principles.title')}
            </Heading>
            <Text size="xl" className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('principles.description')}
            </Text>
          </AnimatedSectionHeader>

          <div className="grid gap-8 md:grid-cols-3">
            {foundationData.principles.map((principle, index) => (
              <AnimatedCard
                key={principle.title}
                index={index}
              >
                <Card
                  variant="glass"
                  rounded="organic"
                  hover={true}
                  padding="lg"
                  className="group relative"
                >
                  <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-coria-primary/10 text-coria-primary group-hover:bg-coria-primary/20 transition-colors duration-300">
                    {principle.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-coria-primary mb-3">
                    {t(`principles.items.${index}.title`)}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {t(`principles.items.${index}.description`)}
                  </p>
                </Card>
              </AnimatedCard>
            ))}
          </div>
        </Container>
      </section>

      {/* Supported Projects - Coming Soon */}
      <section className="py-20 lg:py-32">
        <Container size="xl" padding="lg">
          <AnimatedSectionHeader className="text-center mb-16">
            <Heading as="h2" size="3xl" weight="bold" className="text-4xl lg:text-5xl text-coria-primary mb-6">
              {t('projects.title')}
            </Heading>
            <Text size="xl" className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('projects.description')}
            </Text>
          </AnimatedSectionHeader>

          {/* Coming Soon Card */}
          <AnimatedCard index={0}>
            <Card
              variant="glass"
              rounded="organic"
              padding="xl"
              className="max-w-4xl mx-auto text-center"
            >
              <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-[28px] bg-gradient-to-br from-coria-primary/10 to-leaf/10 backdrop-blur-sm border border-coria-primary/10">
                <Icon name="info" size={48} className="text-coria-primary" aria-hidden="true" />
              </div>

              <Heading as="h3" size="2xl" weight="bold" className="text-3xl text-coria-primary mb-6">
                {t('projects.comingSoon.title')}
              </Heading>

              <Text size="lg" className="text-lg text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
                {t('projects.comingSoon.description')}
              </Text>

              <div className="inline-flex items-center gap-2 px-6 py-3 bg-coria-primary/5 text-coria-primary rounded-full border border-coria-primary/20">
                <Icon name="bell" size={20} aria-hidden="true" />
                <Text size="sm" weight="medium">
                  {t('projects.comingSoon.cta')}
                </Text>
              </div>
            </Card>
          </AnimatedCard>
        </Container>
      </section>

      {/* Apply CTA Section */}
      <section id="apply" className="py-20 lg:py-32">
        <Container size="xl" padding="lg">
          <AnimatedSectionHeader className="text-center mb-16">
            <Heading as="h2" size="3xl" weight="bold" className="text-4xl lg:text-5xl text-coria-primary mb-6">
              {t('form.title')}
            </Heading>
            <Text size="xl" className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              {t('form.description')}
            </Text>
          </AnimatedSectionHeader>

          {/* Timeline */}
          <div className="mb-16">
            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto items-stretch">
              {phases.map((phase, index) => (
                <AnimatedTimelinePhase
                  key={phase.year}
                  index={index}
                >
                  <Card variant="glass" rounded="organic" padding="md" className="shadow-lg h-full flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-coria-primary/10 text-coria-primary">
                        {phase.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-coria-primary">
                        {t(`form.timeline.${index}.year`)}
                      </h3>
                    </div>

                    <ul className="space-y-2 flex-1">
                      {phase.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm text-gray-600 bg-white/60 rounded-[16px] border border-white/40 px-4 py-2">
                          {t(`form.timeline.${index}.items.${itemIndex}`)}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </AnimatedTimelinePhase>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <AnimatedCard index={0}>
            <Card
              variant="glass"
              rounded="organic-lg"
              padding="xl"
              className="max-w-4xl mx-auto text-center shadow-xl"
            >
              <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-[28px] bg-gradient-to-br from-coria-primary/10 to-leaf/10 backdrop-blur-sm border border-coria-primary/10">
                <Icon name="file-text" size={48} className="text-coria-primary" aria-hidden="true" />
              </div>

              <Heading as="h3" size="2xl" weight="bold" className="text-3xl text-coria-primary mb-6">
                {t('apply.cta.title')}
              </Heading>

              <Text size="lg" className="text-lg text-gray-600 leading-relaxed mb-10 max-w-2xl mx-auto">
                {t('apply.cta.description')}
              </Text>

              <Link href={`/${locale}/foundation/apply`}>
                <Button
                  variant="primary"
                  size="xl"
                  rounded="organic"
                  className="h-16 px-12 bg-gradient-to-r from-coria-primary to-coria-primary-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {t('apply.cta.button')}
                </Button>
              </Link>
            </Card>
          </AnimatedCard>
        </Container>
      </section>
    </div>
  );
}
