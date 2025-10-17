'use client';

import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';
import {
  AIAssistantSvgIcon,
  SmartPantrySvgIcon,
  ESGScoreSvgIcon,
  CommunitySvgIcon,
  VeganAllergenSvgIcon,
  CarbonWaterSvgIcon
} from '@/components/icons/svg-icons';

import { Container, Heading, Text, Card } from '@/components/ui';

// Lazy-load Framer Motion animations
const AnimatedFeatureCard = dynamic(
  () => import('./features-showcase-animated').then(mod => ({ default: mod.AnimatedFeatureCard })),
  { ssr: true }
);

const AnimatedBackground = dynamic(
  () => import('./features-showcase-animated').then(mod => ({ default: mod.AnimatedBackground })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 -z-10">
      </div>
    )
  }
);

const AnimatedHeader = dynamic(
  () => import('./features-showcase-animated').then(mod => ({ default: mod.AnimatedHeader })),
  { ssr: true }
);

const AnimatedCTA = dynamic(
  () => import('./features-showcase-animated').then(mod => ({ default: mod.AnimatedCTA })),
  { ssr: true }
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => {
  return (
    <AnimatedFeatureCard index={index}>
      <Card
        variant="glass"
        rounded="organic"
        hover={true}
        padding="lg"
        className="group relative overflow-hidden"
        role="article"
        aria-label={`${title} özelliği`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10">
          <div
            className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-coria-primary/10 text-coria-primary group-hover:bg-coria-primary/20 transition-colors duration-300"
            aria-hidden="true"
          >
            {icon}
          </div>

          <h3 className="text-lg sm:text-xl font-semibold text-coria-primary mb-3 group-hover:text-coria-primary-dark transition-colors duration-300">
            {title}
          </h3>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-coria-primary to-leaf transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-[28px]" />
      </Card>
    </AnimatedFeatureCard>
  );
};

export function FeaturesShowcase() {
  const locale = useLocale();
  const t = useTranslations('home.features');

  // Yeni tasarım dokümanındaki 6 özellik
  const features = [
    {
      icon: <VeganAllergenSvgIcon className="w-7 h-7" />,
      title: t('veganAllergen.title'),
      description: t('veganAllergen.description')
    },
    {
      icon: <AIAssistantSvgIcon className="w-7 h-7" />,
      title: t('aiAssistant.title'),
      description: t('aiAssistant.description')
    },
    {
      icon: <SmartPantrySvgIcon className="w-7 h-7" />,
      title: t('smartPantry.title'),
      description: t('smartPantry.description')
    },
    {
      icon: <ESGScoreSvgIcon className="w-7 h-7" />,
      title: t('esgScores.title'),
      description: t('esgScores.description')
    },
    {
      icon: <CarbonWaterSvgIcon className="w-7 h-7" />,
      title: t('carbonWater.title'),
      description: t('carbonWater.description')
    },
    {
      icon: <CommunitySvgIcon className="w-7 h-7" />,
      title: t('community.title'),
      description: t('community.description')
    }
  ];

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Modern Soft Background - Lazy-loaded */}
      <AnimatedBackground className="absolute inset-0 -z-10" />

      <Container size="xl" padding="lg" className="relative z-10">
        {/* Section Header - Lazy-loaded */}
        <AnimatedHeader className="mx-auto max-w-4xl text-center mb-16">
          <Heading as="h2" size="3xl" weight="bold" className="text-4xl lg:text-5xl text-balance text-coria-primary mb-6">
            {t('title')}
          </Heading>
          <Text size="xl" className="text-xl text-gray-600 leading-relaxed">
            {t('subtitle')}
          </Text>
        </AnimatedHeader>

        {/* Features Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          role="region"
          aria-label="CORIA platform özellikleri"
        >
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

        {/* Call to Action - Lazy-loaded */}
        <AnimatedCTA className="text-center mt-12 sm:mt-16">
          {t('cta')}
        </AnimatedCTA>
      </Container>
    </section>
  );
}
