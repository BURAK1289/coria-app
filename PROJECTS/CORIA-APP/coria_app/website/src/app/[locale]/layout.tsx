import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/components/providers';
import PreviewBanner from '@/components/cms/preview-banner';
import { SEOHead } from '@/components/seo/seo-head';
import { WebVitals } from '@/components/performance/web-vitals';
import { AnalyticsProvider } from '@/components/analytics/analytics-provider';
import { ConsentBanner } from '@/components/analytics/consent-banner';
import { InstallPrompt } from '@/components/pwa/install-prompt';
import { UpdateNotification } from '@/components/pwa/update-notification';
import { NotificationPermission } from '@/components/pwa/notification-permission';
import { Locale } from '@/types/localization';
import '../globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
});

import { LocalizedPageProps } from '@/types/global';

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

    // Icons
    icons: {
      icon: [
        { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
        { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      ],
      apple: [
        { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      ],
      other: [
        { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#1B5E3F' },
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
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <SEOHead 
          locale={locale as Locale} 
          includeOrganization={true}
          includeProduct={true}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider defaultTheme="system" storageKey="coria-theme">
            <AnalyticsProvider>
              <WebVitals debug={process.env.NODE_ENV === 'development'} />
              <PreviewBanner />
              {children}
              <ConsentBanner />
              <InstallPrompt />
              <UpdateNotification />
              <NotificationPermission />
            </AnalyticsProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}