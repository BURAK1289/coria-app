'use client';

import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import dynamic from 'next/dynamic';

import { Container, Heading, Text, Button } from '@/components/ui';
import { AppleIcon, GooglePlayIcon } from '@/components/icons';
import { getHomeContent } from '@/content/home';

const APP_SCREENSHOT_SRC = '/ekran-goruntusu.jpeg';

// Lazy-load Framer Motion animations for performance
const AnimatedBackground = dynamic(
  () => import('./hero-section-animated').then(mod => ({ default: mod.AnimatedBackground })),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 -z-10">
        {/* Transparent - Let BrandBackground show through */}
        <div className="absolute inset-0 bg-transparent" />
      </div>
    )
  }
);

const AnimatedContent = dynamic(
  () => import('./hero-section-animated').then(mod => ({ default: mod.AnimatedContent })),
  { ssr: true }
);

const AnimatedPhoneMockup = dynamic(
  () => import('./hero-section-animated').then(mod => ({ default: mod.AnimatedPhoneMockup })),
  { ssr: true }
);

const AnimatedScanOverlays = dynamic(
  () => import('./hero-section-animated').then(mod => ({ default: mod.AnimatedScanOverlays })),
  { ssr: false }
);

const AnimatedFloatingElements = dynamic(
  () => import('./hero-section-animated').then(mod => ({ default: mod.AnimatedFloatingElements })),
  { ssr: false }
);

export function HeroSection() {
  const locale = useLocale();
  const t = useTranslations('hero');
  const tCommon = useTranslations('common');

  const heroContent = {
    eyebrow: t('badge.veganYaşamAsistanı'),
    title: t('title.kalbinleSeçEtkiyleYaşa'),
    subtitle: t('title.taradığınHerÜrününVeganlıkAlerjenSağlıkVeSü'),
    primaryCta: {
      label: t('cta.iosIçinİndir'),
      href: "https://apps.apple.com/app/coria"
    },
    secondaryCta: {
      label: t('cta.androidIçinİndir'),
      href: "https://play.google.com/store/apps/details?id=com.coria"
    }
  };

  const socialProofMetrics = [
    { value: "2.5+", label: t('stats.milyarÜrünVerisi') },
    { value: "10M+", label: t('stats.etiketVeİçerik') },
    { value: "500K+", label: t('stats.aktifKullanıcı') },
    { value: "1M+", label: "CO₂ Tasarrufu" }
  ];

  return (
    <section id="hero" className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-32 min-h-[90vh] flex items-center">
      {/* Modern Soft Background - Lazy-loaded animations */}
      <AnimatedBackground className="absolute inset-0 -z-10" />

      <Container size="xl" padding="lg" className="relative z-10">
        <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="flex flex-col gap-8 text-center lg:text-left">
            {/* Eyebrow Badge - Modern Glassmorphism */}
            <AnimatedContent>
              <span className="inline-flex items-center gap-3 self-center lg:self-start rounded-[28px] bg-[var(--foam)]/85 backdrop-blur-sm border border-coria-primary/20 px-6 py-3 text-sm font-medium text-coria-primary shadow-sm">
                <span className="w-2 h-2 bg-leaf rounded-full animate-pulse"></span>
                {heroContent.eyebrow}
              </span>
            </AnimatedContent>

            {/* Main Heading - Bold & Prominent */}
            <AnimatedContent>
              <Heading
                as="h1"
                size="4xl"
                weight="bold"
                className="text-5xl lg:text-6xl xl:text-7xl leading-tight text-balance mb-6"
              >
                <span className="bg-gradient-to-r from-coria-primary via-coria-primary-dark to-coria-primary bg-clip-text text-transparent">
                  {heroContent.title}
                </span>
              </Heading>
            </AnimatedContent>

            {/* Subtitle - Clear & Readable */}
            <AnimatedContent>
              <Text
                size="xl"
                className="max-w-2xl text-xl lg:text-2xl text-gray-600 leading-loose mx-auto lg:mx-0 font-medium"
              >
                {heroContent.subtitle}
              </Text>
            </AnimatedContent>

            {/* CTA Buttons - Modern & Soft */}
            <AnimatedContent className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                variant="primary"
                size="xl"
                rounded="organic"
                className="group border-0 touch-target"
                onClick={() => window.open(heroContent.primaryCta.href, '_blank')}
                aria-label={`${heroContent.primaryCta.label} - Apple App Store${tCommon('aria.daCoriaUygulamasınıIndirin')}`}
              >
                <AppleIcon className="h-6 w-6 transition-transform group-hover:scale-110" aria-hidden="true" />
                <span className="text-lg font-semibold">{heroContent.primaryCta.label}</span>
              </Button>

              <Button
                variant="glass"
                size="xl"
                rounded="organic"
                className="group touch-target"
                onClick={() => window.open(heroContent.secondaryCta.href, '_blank')}
                aria-label={`${heroContent.secondaryCta.label} - Google Play Store${tCommon('aria.daCoriaUygulamasınıIndirin')}`}
              >
                <GooglePlayIcon className="h-6 w-6 transition-transform group-hover:scale-110" aria-hidden="true" />
                <span className="text-lg font-semibold">{heroContent.secondaryCta.label}</span>
              </Button>
            </AnimatedContent>

            {/* Social Proof Metrics - Modern Cards */}
            <div
              className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6"
              role="region"
              aria-label={tCommon('aria.coriaIstatistikleriVeEtkiGöstergeleri')}
            >
              {socialProofMetrics.map((metric, index) => (
                <AnimatedContent
                  key={metric.label}
                  className="relative group"
                >
                  <div
                    className="rounded-[28px] border border-[var(--foam)] bg-[var(--foam)]/85 backdrop-blur-sm px-4 py-5 text-center shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:bg-[var(--foam)]/90 group-hover:-translate-y-1"
                    role="article"
                    aria-label={`${metric.value} ${metric.label} - ${tCommon('aria.coriaEtkiGöstergesi')}`}
                  >
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-coria-primary mb-1">
                      {metric.value}
                    </div>
                    <div className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
                      {metric.label}
                    </div>
                  </div>
                </AnimatedContent>
              ))}
            </div>
          </div>

          {/* Elegant Phone Mockup with Barcode Scanning Animation */}
          <AnimatedPhoneMockup className="relative flex justify-center lg:justify-end">
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

                      {/* Lazy-loaded scanning animations */}
                      <AnimatedScanOverlays />
                    </div>
                  </div>

                  {/* Phone Buttons */}
                  <div className="absolute left-[-2px] top-20 w-1 h-8 bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute left-[-2px] top-32 w-1 h-12 bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute left-[-2px] top-48 w-1 h-12 bg-gray-700 rounded-l-sm"></div>
                  <div className="absolute right-[-2px] top-24 w-1 h-16 bg-gray-700 rounded-r-sm"></div>
                </div>

                {/* Lazy-loaded floating elements and glow effects */}
                <AnimatedFloatingElements />
              </div>
          </AnimatedPhoneMockup>
        </div>
      </Container>
    </section>
  );
}
