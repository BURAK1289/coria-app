import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { MotionProvider } from '@/components/providers/motion-provider';
import PreviewBanner from '@/components/cms/preview-banner';
import { SEOHead } from '@/components/seo/seo-head';
import { WebVitals } from '@/components/performance/web-vitals';
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
// Lazy-loaded client components (PWA, Analytics)
import {
  ConsentBanner,
  InstallPrompt,
  UpdateNotification,
  NotificationPermission,
} from '@/components/layout/client-components';
import { Navigation } from '@/components/layout/navigation';
import { Footer } from '@/components/layout/footer';
import { Locale } from '@/types/localization';
import '../globals.css';
import '@/styles/brand-background.css';
import '@/lib/suppress-extension-errors';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT (Flash of Invisible Text)
  preload: true,
});

import { LocalizedPageProps } from '@/types/global';
import { ClientBackground } from '@/components/layout/ClientBackground';

interface LocaleLayoutProps extends LocalizedPageProps {
  children: React.ReactNode;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: Omit<LocaleLayoutProps, 'children'>): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://coria.app';
  
  const titles = {
    tr: 'CORIA - Sürdürülebilir Yaşam Uygulaması',
    en: 'CORIA - Sustainable Living App',
    de: 'CORIA - Nachhaltige Lebens-App',
    fr: 'CORIA - Application de Vie Durable'
  };

  const descriptions = {
    tr: 'Bilinçli tüketim kararları alın, çevresel etkilerinizi takip edin ve sürdürülebilir alternatifleri keşfedin.',
    en: 'Make conscious consumption decisions, track your environmental impact, and discover sustainable alternatives.',
    de: 'Treffen Sie bewusste Konsumentscheidungen, verfolgen Sie Ihre Umweltauswirkungen und entdecken Sie nachhaltige Alternativen.',
    fr: 'Prenez des décisions de consommation conscientes, suivez votre impact environnemental et découvrez des alternatives durables.'
  };

  const keywords = {
    tr: ['sürdürülebilirlik', 'çevre', 'bilinçli tüketim', 'karbon ayak izi', 'yeşil yaşam', 'barkod tarama', 'çevresel etki'],
    en: ['sustainability', 'environment', 'conscious consumption', 'carbon footprint', 'green living', 'barcode scanning', 'environmental impact'],
    de: ['Nachhaltigkeit', 'Umwelt', 'bewusster Konsum', 'CO2-Fußabdruck', 'grünes Leben', 'Barcode-Scanning', 'Umweltauswirkungen'],
    fr: ['durabilité', 'environnement', 'consommation consciente', 'empreinte carbone', 'vie verte', 'scan code-barres', 'impact environnemental']
  };

  const title = titles[locale as keyof typeof titles] || titles.tr;
  const description = descriptions[locale as keyof typeof descriptions] || descriptions.tr;
  const keywordList = keywords[locale as keyof typeof keywords] || keywords.en;

  // Generate alternate language URLs
  const alternateUrls: Record<string, string> = {};
  routing.locales.forEach(altLocale => {
    alternateUrls[altLocale] = `${baseUrl}/${altLocale}`;
  });

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    keywords: keywordList,
    authors: [{ name: 'CORIA Team', url: baseUrl }],
    creator: 'CORIA Team',
    publisher: 'CORIA',
    applicationName: 'CORIA',
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    
    // Canonical and alternate URLs
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: alternateUrls,
    },

    // Open Graph
    openGraph: {
      type: 'website',
      locale: locale === 'tr' ? 'tr_TR' : locale === 'en' ? 'en_US' : locale === 'de' ? 'de_DE' : 'fr_FR',
      url: `${baseUrl}/${locale}`,
      siteName: 'CORIA',
      title,
      description,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@coria_app',
      site: '@coria_app',
      images: [`${baseUrl}/og-image.png`],
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Icons - CORIA logo
    icons: {
      icon: [
        { url: '/coria-logo.svg', type: 'image/svg+xml' },
      ],
      apple: [
        { url: '/coria-logo.svg', type: 'image/svg+xml' },
      ],
      other: [
        { rel: 'mask-icon', url: '/coria-logo.svg', color: '#1B5E3F' },
      ],
    },

    // Manifest
    manifest: '/site.webmanifest',

    // Additional metadata
    other: {
      'apple-mobile-web-app-title': 'CORIA',
      'application-name': 'CORIA',
      'msapplication-TileColor': '#1B5E3F',
      'theme-color': '#1B5E3F',
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: LocaleLayoutProps) {
  const { locale } = await params;
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  // CRITICAL: Pass locale parameter to prevent fallback to defaultLocale (tr)
  const messages = await getMessages({ locale });

  // Read environment variables server-side
  const bgEnabled = process.env.NEXT_PUBLIC_BG_EFFECT !== 'off';
  const bgIntensity = (process.env.NEXT_PUBLIC_BG_INTENSITY as 'low' | 'med' | 'high') || 'low';

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light" />
        <SEOHead
          locale={locale as Locale}
          includeOrganization={true}
          includeProduct={true}
        />
        {/* Critical CSS - Inline for immediate rendering (2.4KB) */}
        <style dangerouslySetInnerHTML={{ __html: `
/* Critical CSS for Above-the-Fold Content */
:root{--coria-green:#1B5E3F;--acik-yesil:#66BB6A;--coria-white:#FFF;--coria-gray-900:#2C3E34;--coria-gray-600:#5F6F64}*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid}html{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif}body{margin:0;line-height:inherit}.font-sans{font-family:var(--font-inter),ui-sans-serif,system-ui,sans-serif}.font-bold{font-weight:700}.text-4xl{font-size:2.25rem;line-height:2.5rem}.text-xl{font-size:1.25rem;line-height:1.75rem}.leading-tight{line-height:1.25}.leading-loose{line-height:2}.bg-coria-primary{background-color:var(--coria-green)}.text-white{color:var(--coria-white)}.text-gray-600{color:var(--coria-gray-600)}.text-coria-primary{color:var(--coria-green)}.container{width:100%;margin-left:auto;margin-right:auto;padding-left:1rem;padding-right:1rem}.grid{display:grid}.flex{display:flex}.items-center{align-items:center}.justify-center{justify-content:center}.px-6{padding-left:1.5rem;padding-right:1.5rem}.py-20{padding-top:5rem;padding-bottom:5rem}.mb-6{margin-bottom:1.5rem}.mb-8{margin-bottom:2rem}.mx-auto{margin-left:auto;margin-right:auto}@media (min-width:640px){.sm\\:text-5xl{font-size:3rem;line-height:1}.sm\\:text-2xl{font-size:1.5rem;line-height:2rem}}@media (min-width:768px){.md\\:text-6xl{font-size:3.75rem;line-height:1}.md\\:px-8{padding-left:2rem;padding-right:2rem}.container{max-width:768px}}@media (min-width:1024px){.lg\\:text-2xl{font-size:1.5rem;line-height:2rem}.container{max-width:1024px}}@media (min-width:1280px){.container{max-width:1280px}}.max-w-2xl{max-width:42rem}.antialiased{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
        ` }} />
        {/* CSS is automatically loaded by Next.js - no manual preload needed */}
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {/* Brand Background - Fixed positioned behind all content */}
        <ClientBackground
          enabled={bgEnabled}
          intensity={bgIntensity}
        />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <MotionProvider>
            <AnalyticsProvider>
              <WebVitals debug={process.env.NODE_ENV === 'development'} />
              <PreviewBanner />
              <Navigation />
              {children}
              <Footer />
              <ConsentBanner />
              <InstallPrompt />
              <UpdateNotification />
              <NotificationPermission />
            </AnalyticsProvider>
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}