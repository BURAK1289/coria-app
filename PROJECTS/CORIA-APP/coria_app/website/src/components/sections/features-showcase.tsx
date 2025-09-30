'use client';

import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  AIAssistantSvgIcon,
  SmartPantrySvgIcon,
  ESGScoreSvgIcon,
  CommunitySvgIcon,
  VeganAllergenSvgIcon,
  CarbonWaterSvgIcon
} from '@/components/icons/svg-icons';

import { Container, Heading, Text } from '@/components/ui';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }
  }
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, index }) => {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ delay: index * 0.1 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group relative overflow-hidden rounded-[28px] bg-white/60 backdrop-blur-md border border-white/30 p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
      role="article"
      aria-label={`${title} özelliği`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div
          className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-[#1B5E3F]/10 text-[#1B5E3F] group-hover:bg-[#1B5E3F]/20 transition-colors duration-300"
          aria-hidden="true"
        >
          {icon}
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-[#1B5E3F] mb-3 group-hover:text-[#0D3B2F] transition-colors duration-300">
          {title}
        </h3>

        <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B5E3F] to-[#7FB069] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-[28px]" />
    </motion.div>
  );
};

export function FeaturesShowcase() {
  const locale = useLocale();

  // Yeni tasarım dokümanındaki 6 özellik
  const features = [
    {
      icon: <VeganAllergenSvgIcon className="w-7 h-7" />,
      title: "Vegan & Alerjen Analizi",
      description: "Ürünlerin vegan uygunluğunu ve alerjen içeriğini anında analiz edin. Kişisel beslenme tercihlerinize uygun seçimler yapın."
    },
    {
      icon: <AIAssistantSvgIcon className="w-7 h-7" />,
      title: "AI Asistan",
      description: "Yapay zeka destekli kişisel asistanınız ile beslenme önerilerinden sürdürülebilir yaşam ipuçlarına kadar her konuda destek alın."
    },
    {
      icon: <SmartPantrySvgIcon className="w-7 h-7" />,
      title: "Akıllı Kiler",
      description: "Kilerdeki ürünleri takip edin, son kullanma tarihlerini izleyin ve israfı önlemek için akıllı öneriler alın."
    },
    {
      icon: <ESGScoreSvgIcon className="w-7 h-7" />,
      title: "ESG Skorları",
      description: "Ürün ve markaların çevresel, sosyal ve yönetişim performanslarını ESG skorları ile değerlendirin."
    },
    {
      icon: <CarbonWaterSvgIcon className="w-7 h-7" />,
      title: "Karbon/Su Takibi",
      description: "Tüketim alışkanlıklarınızın karbon ayak izini ve su kullanımını takip ederek çevresel etkilerinizi azaltın."
    },
    {
      icon: <CommunitySvgIcon className="w-7 h-7" />,
      title: "Topluluk Önerileri",
      description: "Sürdürülebilir yaşam topluluğundan öneriler alın, deneyimlerinizi paylaşın ve birlikte öğrenin."
    }
  ];

  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      {/* Modern Soft Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/98 to-[#F8F9FA]" />

        {/* Floating Background Elements */}
        <motion.div
          animate={{
            y: [-15, 15, -15],
            scale: [1, 1.05, 1],
            rotate: [0, 2, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gradient-to-br from-[#7FB069]/8 via-[#C5D86D]/6 to-transparent blur-3xl"
          aria-hidden
        />
        <motion.div
          animate={{
            y: [15, -15, 15],
            scale: [1, 1.08, 1],
            rotate: [0, -2, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-0 right-10 h-96 w-96 rounded-full bg-gradient-to-tr from-[#87CEEB]/8 via-[#1B5E3F]/6 to-transparent blur-3xl"
          aria-hidden
        />
      </div>

      <Container size="xl" padding="lg" className="relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-4xl text-center mb-16"
        >
          <Heading as="h2" size="3xl" weight="bold" className="text-4xl lg:text-5xl text-balance text-[#1B5E3F] mb-6">
            Vegan yaşam için 360° platform
          </Heading>
          <Text size="xl" className="text-xl text-gray-600 leading-relaxed">
            CORIA, ürün analizinden Foundation bağışlarına kadar uzanan tam kapsamlı bir bilinçli tüketim ekosistemi sunar.
          </Text>
        </motion.div>

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

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12 sm:mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#1B5E3F] to-[#0D3B2F] text-white font-semibold rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-300 touch-target"
            aria-label="CORIA'nın tüm özelliklerini keşfetmek için uygulamayı indirin"
          >
            Tüm Özellikleri Keşfet
          </motion.button>
        </motion.div>
      </Container>
    </section>
  );
}
