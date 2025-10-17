'use client';

import { useLocale, useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Heart,
  Leaf,
  Award,
  Lock,
  Coins,
  Globe
} from 'lucide-react';
import {
  CoriaFoundationIcon,
  TokenEconomyIcon,
  TransparencyIcon,
  ImpactFocusIcon,
  CommunityIcon,
  GreenEnergyIcon,
  SustainabilityIcon
} from '@/components/icons/coria-icons';

import { Container, Heading, Text, Card, CardContent, Button, Grid } from '@/components/ui';

// CORIA Foundation özel ikonları ve veriler - tasarım dokümanından alındı
const FoundationIcon = () => (
  <CoriaFoundationIcon className="h-8 w-8" />
);

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

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

  supportedProjects: [
    {
      icon: <Leaf className="h-6 w-6" />,
      title: "Ekolojik Tarım Projesi",
      impact: "5000 hektar organik tarım alanı oluşturuldu",
      category: "Veganlık"
    },
    {
      icon: <GreenEnergyIcon className="h-6 w-6" />,
      title: "Güneş Enerjisi Kooperatifi",
      impact: "250 aileye temiz enerji erişimi sağlandı",
      category: "Yeşil Enerji"
    },
    {
      icon: <SustainabilityIcon className="h-6 w-6" />,
      title: "Sıfır Atık İnisiyatifi",
      impact: "12 şehirde plastik kullanımı %60 azaltıldı",
      category: "Sürdürülebilirlik"
    }
  ],

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
    year: '2023',
    icon: <Award className="h-5 w-5" />,
    items: ['Foundation konsepti tasarlandı', 'Believe platformu ortaklığı kuruldu']
  },
  {
    year: '2024',
    icon: <Coins className="h-5 w-5" />,
    items: ['Solana tabanlı CORIA Token lansmanı', 'İlk topluluk oylaması ile 3 proje fonlandı']
  },
  {
    year: '2025',
    icon: <Globe className="h-5 w-5" />,
    items: ['Global genişleme', 'Yerel kooperatif iş birlikleri', 'On-chain etki raporları']
  }
];

export default function FoundationPage() {
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-white/98 to-[#F8F9FA]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Modern Background */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{
              y: [-20, 20, -20],
              scale: [1, 1.1, 1],
              rotate: [0, 3, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-32 right-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#1B5E3F]/8 via-[#7FB069]/6 to-transparent blur-3xl"
            aria-hidden
          />
          <motion.div
            animate={{
              y: [20, -20, 20],
              scale: [1, 1.05, 1],
              rotate: [0, -2, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute -bottom-24 left-16 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#87CEEB]/8 via-[#C5D86D]/6 to-transparent blur-3xl"
            aria-hidden
          />
        </div>

        <Container size="xl" padding="lg" className="relative z-10">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mx-auto max-w-4xl text-center"
          >
            {/* Foundation Logo */}
            <motion.div
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="mb-8 flex justify-center"
            >
              <div className="flex items-center justify-center w-20 h-20 rounded-[24px] bg-gradient-to-br from-[#1B5E3F]/10 to-[#7FB069]/10 backdrop-blur-sm border border-[#1B5E3F]/10">
                <FoundationIcon />
              </div>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ delay: 0.2 }}>
              <Heading as="h1" size="4xl" weight="bold" className="text-5xl lg:text-6xl text-balance text-[#1B5E3F] mb-6">
                {foundationData.title}
              </Heading>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ delay: 0.3 }}>
              <Text size="xl" className="text-2xl text-gray-600 mb-6 font-medium">
                {foundationData.subtitle}
              </Text>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ delay: 0.4 }}>
              <Text size="lg" className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-10">
                {foundationData.description}
              </Text>
            </motion.div>

            <motion.div variants={fadeUp} transition={{ delay: 0.5 }}>
              <Button
                variant="primary"
                size="lg"
                className="h-14 px-8 bg-gradient-to-r from-[#1B5E3F] to-[#0D3B2F] text-white rounded-[28px] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Projenizi Fonlayalım
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Token Economy Section */}
      <section className="py-20 lg:py-32">
        <Container size="xl" padding="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Heading as="h2" size="3xl" weight="bold" className="text-4xl lg:text-5xl text-[#1B5E3F] mb-6">
              {foundationData.tokenEconomy.title}
            </Heading>
            <Text size="xl" className="text-xl text-gray-600 max-w-3xl mx-auto">
              {foundationData.tokenEconomy.description}
            </Text>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {foundationData.tokenEconomy.features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 }
                }}
                className="group relative rounded-[28px] bg-white/60 backdrop-blur-md border border-white/30 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[28px]" />

                <div className="relative z-10">
                  <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-[#1B5E3F]/10 text-[#1B5E3F] group-hover:bg-[#1B5E3F]/20 transition-colors duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-[#1B5E3F] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Foundation Principles */}
      <section className="py-20 lg:py-32 bg-gradient-to-b from-white/50 to-[#F8F9FA]">
        <Container size="xl" padding="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Heading as="h2" size="3xl" weight="bold" className="text-4xl lg:text-5xl text-[#1B5E3F] mb-6">
              Şeffaflık İlkelerimiz
            </Heading>
            <Text size="xl" className="text-xl text-gray-600 max-w-3xl mx-auto">
              CORIA Foundation, blockchain tabanlı şeffaf yönetim ile her adımı toplulukla paylaşır
            </Text>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {foundationData.principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative rounded-[28px] bg-white/60 backdrop-blur-md border border-white/30 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-[#1B5E3F]/10 text-[#1B5E3F] group-hover:bg-[#1B5E3F]/20 transition-colors duration-300">
                  {principle.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#1B5E3F] mb-3">
                  {principle.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {principle.description}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Supported Projects */}
      <section className="py-20 lg:py-32">
        <Container size="xl" padding="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Heading as="h2" size="3xl" weight="bold" className="text-4xl lg:text-5xl text-[#1B5E3F] mb-6">
              Desteklenen Projeler
            </Heading>
            <Text size="xl" className="text-xl text-gray-600 max-w-3xl mx-auto">
              CORIA Foundation tarafından fonlanan başarı hikayeleri ve etki metrikleri
            </Text>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {foundationData.supportedProjects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="group relative rounded-[28px] bg-white/80 backdrop-blur-md border border-white/40 p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-xs font-medium bg-[#1B5E3F]/10 text-[#1B5E3F] rounded-full border border-[#1B5E3F]/20">
                    {project.category}
                  </span>
                </div>

                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-[20px] bg-[#1B5E3F]/10 text-[#1B5E3F] group-hover:bg-[#1B5E3F]/20 transition-colors duration-300">
                  {project.icon}
                </div>

                <h3 className="text-xl font-semibold text-[#1B5E3F] mb-3">
                  {project.title}
                </h3>

                <p className="text-gray-600 leading-relaxed mb-4">
                  {project.impact}
                </p>

                <div className="pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-500">Etki Değerlendirmesi</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-semibold text-[#1B5E3F]">Başarılı</span>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-[#1B5E3F] rounded-full"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 lg:py-32 bg-gradient-to-b from-[#F8F9FA] to-white">
        <Container size="xl" padding="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <Heading as="h2" size="3xl" weight="bold" className="text-4xl lg:text-5xl text-[#1B5E3F] mb-6">
              Başvuru Süreci
            </Heading>
            <Text size="xl" className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Veganlık, sürdürülebilirlik ve yeşil enerji odağındaki projeleri aşağıdaki aşamalı form ile değerlendirmeye alıyoruz.
            </Text>
          </motion.div>

          {/* Timeline */}
          <div className="mb-16">
            <div className="grid gap-8 md:grid-cols-3">
              {phases.map((phase, index) => (
                <motion.div
                  key={phase.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="relative"
                >
                  <div className="rounded-[28px] bg-white/80 backdrop-blur-md border border-white/40 p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-[#1B5E3F]/10 text-[#1B5E3F]">
                        {phase.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-[#1B5E3F]">
                        {phase.year}
                      </h3>
                    </div>

                    <ul className="space-y-2">
                      {phase.items.map((item, itemIndex) => (
                        <li key={item} className="text-sm text-gray-600 bg-white/60 rounded-[16px] border border-white/40 px-4 py-2">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="rounded-[32px] bg-white/80 backdrop-blur-md border border-white/40 p-8 lg:p-12 shadow-xl">
              <form className="grid gap-8 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Proje Adı
                  </label>
                  <input
                    className="w-full rounded-[20px] border border-gray-200 bg-white/80 px-6 py-4 focus:border-[#1B5E3F] focus:outline-none focus:ring-2 focus:ring-[#1B5E3F]/20 transition-all duration-200"
                    placeholder="Projenizi tanımlayan başlık"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Kategori
                  </label>
                  <select className="w-full rounded-[20px] border border-gray-200 bg-white/80 px-6 py-4 focus:border-[#1B5E3F] focus:outline-none focus:ring-2 focus:ring-[#1B5E3F]/20 transition-all duration-200">
                    <option>Veganlık</option>
                    <option>Sürdürülebilirlik</option>
                    <option>Yeşil Enerji</option>
                  </select>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    İletişim E-postası
                  </label>
                  <input
                    type="email"
                    className="w-full rounded-[20px] border border-gray-200 bg-white/80 px-6 py-4 focus:border-[#1B5E3F] focus:outline-none focus:ring-2 focus:ring-[#1B5E3F]/20 transition-all duration-200"
                    placeholder="name@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Kısa Açıklama
                  </label>
                  <textarea
                    className="w-full rounded-[20px] border border-gray-200 bg-white/80 px-6 py-4 focus:border-[#1B5E3F] focus:outline-none focus:ring-2 focus:ring-[#1B5E3F]/20 transition-all duration-200"
                    rows={3}
                    placeholder="Projenizi 280 karakterde özetleyin"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-semibold text-gray-700">
                    Detaylı Tanıtım
                  </label>
                  <textarea
                    className="w-full rounded-[20px] border border-gray-200 bg-white/80 px-6 py-4 focus:border-[#1B5E3F] focus:outline-none focus:ring-2 focus:ring-[#1B5E3F]/20 transition-all duration-200"
                    rows={6}
                    placeholder="Hedef kitleniz, etki potansiyeli ve mevcut durumunuz"
                  />
                </div>

                <div className="md:col-span-2 text-center">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    className="h-14 px-12 bg-gradient-to-r from-[#1B5E3F] to-[#0D3B2F] text-white rounded-[28px] shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    Başvuru Formunu Gönder
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </Container>
      </section>
    </div>
  );
}
