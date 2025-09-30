'use client';

import Image from 'next/image';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';

import { Container, Heading, Text, Button } from '@/components/ui';
import { AppleIcon, GooglePlayIcon } from '@/components/icons';
import { getHomeContent } from '@/content/home';

const APP_SCREENSHOT_SRC = '/ekran-goruntusu.jpeg';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }
  }
};

export function HeroSection() {
  const locale = useLocale();

  // Yeni tasarım metinleri - tasarım dokümanından alındı
  const heroContent = {
    eyebrow: "Vegan Yaşam Asistanı",
    title: "Kalbinle Seç. Etkiyle Yaşa.",
    subtitle: "Taradığın her ürünün veganlık, alerjen, sağlık ve sürdürülebilirlik skorlarını tek bakışta gör.",
    primaryCta: {
      label: "iOS için İndir",
      href: "https://apps.apple.com/app/coria"
    },
    secondaryCta: {
      label: "Android için İndir",
      href: "https://play.google.com/store/apps/details?id=com.coria"
    }
  };

  const socialProofMetrics = [
    { value: "2.5+", label: "Milyar Ürün Verisi" },
    { value: "10M+", label: "Etiket ve İçerik" },
    { value: "500K+", label: "Aktif Kullanıcı" },
    { value: "1M+", label: "CO₂ Tasarrufu" }
  ];

  return (
    <section id="hero" className="relative overflow-hidden py-20 lg:py-32 min-h-[90vh] flex items-center">
      {/* Modern Soft Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/98 to-[#F8F9FA]" />

        {/* Floating Organic Shapes - Modern & Soft */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
            scale: [1, 1.05, 1],
            rotate: [0, 2, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 right-20 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-[#1B5E3F]/6 via-[#7FB069]/4 to-transparent blur-3xl"
          aria-hidden
        />
        <motion.div
          animate={{
            y: [10, -10, 10],
            scale: [1, 1.08, 1],
            rotate: [0, -3, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-24 left-16 h-[360px] w-[360px] rounded-full bg-gradient-to-tr from-[#87CEEB]/6 via-[#C5D86D]/4 to-transparent blur-3xl"
          aria-hidden
        />
        <motion.div
          animate={{
            y: [-5, 5, -5],
            scale: [1, 1.03, 1],
            rotate: [0, 1, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/3 h-[280px] w-[280px] rounded-full bg-gradient-to-bl from-[#FFD93D]/5 via-[#1B5E3F]/3 to-transparent blur-3xl"
          aria-hidden
        />
      </div>

      <Container size="xl" padding="lg" className="relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-8 text-center lg:text-left"
          >
            {/* Eyebrow Badge - Modern Glassmorphism */}
            <motion.span
              variants={fadeUp}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-3 self-center lg:self-start rounded-[28px] bg-white/70 backdrop-blur-md border border-[#1B5E3F]/8 px-6 py-3 text-sm font-medium text-[#1B5E3F] shadow-sm"
            >
              <span className="w-2 h-2 bg-[#7FB069] rounded-full animate-pulse"></span>
              {heroContent.eyebrow}
            </motion.span>

            {/* Main Heading - Bold & Prominent */}
            <motion.div variants={fadeUp} transition={{ delay: 0.2 }}>
              <Heading
                as="h1"
                size="4xl"
                weight="bold"
                className="text-5xl lg:text-6xl xl:text-7xl leading-tight text-balance mb-6"
              >
                <span className="bg-gradient-to-r from-[#1B5E3F] via-[#0D3B2F] to-[#1B5E3F] bg-clip-text text-transparent">
                  {heroContent.title}
                </span>
              </Heading>
            </motion.div>

            {/* Subtitle - Clear & Readable */}
            <motion.div variants={fadeUp} transition={{ delay: 0.3 }}>
              <Text
                size="xl"
                className="max-w-2xl text-xl lg:text-2xl text-gray-600 leading-loose mx-auto lg:mx-0 font-medium"
              >
                {heroContent.subtitle}
              </Text>
            </motion.div>

            {/* CTA Buttons - Modern & Soft */}
            <motion.div
              variants={fadeUp}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Button
                variant="primary"
                size="lg"
                className="group h-14 px-8 bg-gradient-to-r from-[#1B5E3F] to-[#0D3B2F] text-white rounded-[28px] shadow-lg shadow-[#1B5E3F]/20 hover:shadow-xl hover:shadow-[#1B5E3F]/30 transition-all duration-300 hover:-translate-y-1 border-0 touch-target"
                onClick={() => window.open(heroContent.primaryCta.href, '_blank')}
                aria-label={`${heroContent.primaryCta.label} - Apple App Store'da CORIA uygulamasını indirin`}
              >
                <AppleIcon className="h-6 w-6 transition-transform group-hover:scale-110" aria-hidden="true" />
                <span className="text-lg font-semibold">{heroContent.primaryCta.label}</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="group h-14 px-8 border-2 border-[#1B5E3F]/15 text-[#1B5E3F] bg-white/70 backdrop-blur-md rounded-[28px] hover:border-[#1B5E3F]/25 hover:bg-white/90 transition-all duration-300 hover:-translate-y-1 touch-target"
                onClick={() => window.open(heroContent.secondaryCta.href, '_blank')}
                aria-label={`${heroContent.secondaryCta.label} - Google Play Store'da CORIA uygulamasını indirin`}
              >
                <GooglePlayIcon className="h-6 w-6 transition-transform group-hover:scale-110" aria-hidden="true" />
                <span className="text-lg font-semibold">{heroContent.secondaryCta.label}</span>
              </Button>
            </motion.div>

            {/* Social Proof Metrics - Modern Cards */}
            <motion.div
              variants={fadeUp}
              transition={{ delay: 0.5 }}
              className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6"
              role="region"
              aria-label="CORIA istatistikleri ve etki göstergeleri"
            >
              {socialProofMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="relative group"
                >
                  <div
                    className="rounded-[28px] border border-white/40 bg-white/60 backdrop-blur-md px-4 py-5 text-center shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:bg-white/80 group-hover:-translate-y-1"
                    role="article"
                    aria-label={`${metric.value} ${metric.label} - CORIA etki göstergesi`}
                  >
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1B5E3F] mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
                      {metric.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Elegant Phone Mockup with Barcode Scanning Animation */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3, duration: 0.8 }}
            className="relative flex justify-center lg:justify-end"
          >
            <motion.div
              animate={{
                y: [-6, 6, -6],
                rotate: [0, 0.5, 0]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="relative w-full max-w-[320px] lg:max-w-[360px]"
            >
              {/* Modern Phone Container - Sleeker Design */}
              <div className="relative">
                {/* Phone Shadow */}
                <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-black/20 to-black/40 blur-2xl transform translate-y-8 translate-x-2"></div>

                {/* Phone Body */}
                <div className="relative rounded-[40px] bg-gradient-to-br from-gray-900 via-gray-800 to-black p-2 shadow-2xl">
                  {/* Screen Container */}
                  <div className="relative overflow-hidden rounded-[32px] bg-black">
                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-10"></div>

                    {/* App Screenshot */}
                    <div className="relative">
                      <Image
                        src={APP_SCREENSHOT_SRC}
                        alt={heroContent.title}
                        width={640}
                        height={1386}
                        className="h-auto w-full object-cover"
                        priority
                      />

                      {/* Scanning Animation Overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1B5E3F]/20 to-transparent"
                        animate={{
                          y: ["-100%", "100%", "-100%"]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 2
                        }}
                      />

                      {/* Barcode Detection Frame */}
                      <motion.div
                        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-48 h-32 border-2 border-[#1B5E3F] rounded-lg"
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 1
                        }}
                      >
                        {/* Corner indicators */}
                        <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-[#1B5E3F]"></div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-[#1B5E3F]"></div>
                        <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-[#1B5E3F]"></div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-[#1B5E3F]"></div>
                      </motion.div>

                      {/* Success Pulse Animation */}
                      <motion.div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#1B5E3F]/30 rounded-full"
                        animate={{
                          scale: [0, 1.5, 0],
                          opacity: [0, 0.8, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeOut",
                          delay: 4
                        }}
                      />
                    </div>
                  </div>

                  {/* Phone Buttons */}
                  <div className="absolute left-[-2px] top-20 w-1 h-8 bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute left-[-2px] top-32 w-1 h-12 bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute left-[-2px] top-48 w-1 h-12 bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute right-[-2px] top-24 w-1 h-16 bg-gray-700 rounded-r-sm"></div>
                </div>

                {/* Floating Elements - More Subtle */}
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-[#1B5E3F]/40 to-[#7FB069]/40 rounded-full opacity-60 blur-sm"
                  aria-hidden
                />
                <motion.div
                  animate={{
                    rotate: [360, 0],
                    y: [0, -10, 0]
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-br from-[#C5D86D]/40 to-[#87CEEB]/40 rounded-full opacity-50 blur-sm"
                  aria-hidden
                />

                {/* Glow Effect */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-[#1B5E3F]/20 via-transparent to-[#7FB069]/20 blur-xl"
                  aria-hidden
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
