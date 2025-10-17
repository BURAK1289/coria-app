import { Locale } from '@/types/localization';

interface StructuredDataProps {
  locale: Locale;
  type?: 'website' | 'article' | 'organization' | 'product';
  data: Record<string, unknown>;
}

export function StructuredData({ locale, type = 'website', data }: StructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': getSchemaType(type),
    ...data,
    inLanguage: locale,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData, null, 2),
      }}
      suppressHydrationWarning
    />
  );
}

function getSchemaType(type: string): string {
  switch (type) {
    case 'website':
      return 'WebSite';
    case 'article':
      return 'Article';
    case 'organization':
      return 'Organization';
    case 'product':
      return 'SoftwareApplication';
    default:
      return 'WebSite';
  }
}

// Predefined structured data generators
export function generateWebsiteStructuredData(locale: Locale) {
  const baseUrl = 'https://coria.app';
  
  const names = {
    tr: 'CORIA - Sürdürülebilir Yaşam Uygulaması',
    en: 'CORIA - Sustainable Living App',
    de: 'CORIA - Nachhaltige Lebens-App',
    fr: 'CORIA - Application de Vie Durable',
  };

  const descriptions = {
    tr: 'Bilinçli tüketim kararları alın, çevresel etkilerinizi takip edin ve sürdürülebilir alternatifleri keşfedin.',
    en: 'Make conscious consumption decisions, track your environmental impact, and discover sustainable alternatives.',
    de: 'Treffen Sie bewusste Konsumentscheidungen, verfolgen Sie Ihre Umweltauswirkungen und entdecken Sie nachhaltige Alternativen.',
    fr: 'Prenez des décisions de consommation conscientes, suivez votre impact environnemental et découvrez des alternatives durables.',
  };

  return {
    name: names[locale],
    description: descriptions[locale],
    url: `${baseUrl}/${locale}`,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/${locale}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'CORIA',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
        width: 512,
        height: 512,
      },
    },
  };
}

export function generateOrganizationStructuredData(locale: Locale) {
  const baseUrl = 'https://coria.app';
  
  const descriptions = {
    tr: 'Sürdürülebilir yaşam için mobil uygulama geliştiren teknoloji şirketi.',
    en: 'Technology company developing mobile applications for sustainable living.',
    de: 'Technologieunternehmen, das mobile Anwendungen für nachhaltiges Leben entwickelt.',
    fr: 'Entreprise technologique développant des applications mobiles pour un mode de vie durable.',
  };

  return {
    name: 'CORIA',
    description: descriptions[locale],
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/logo.png`,
      width: 512,
      height: 512,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@coria.app',
      availableLanguage: ['Turkish', 'English', 'German', 'French'],
    },
    sameAs: [
      'https://twitter.com/coria_app',
      'https://instagram.com/coria_app',
      'https://linkedin.com/company/coria-app',
    ],
    foundingDate: '2024',
    founders: [
      {
        '@type': 'Person',
        name: 'CORIA Team',
      },
    ],
    industry: 'Technology',
    numberOfEmployees: '1-10',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'TR',
      addressLocality: 'Istanbul',
    },
  };
}

export function generateProductStructuredData(locale: Locale) {
  const baseUrl = 'https://coria.app';
  
  const names = {
    tr: 'CORIA Mobil Uygulaması',
    en: 'CORIA Mobile App',
    de: 'CORIA Mobile App',
    fr: 'Application Mobile CORIA',
  };

  const descriptions = {
    tr: 'Sürdürülebilir yaşam için barkod tarama, çevresel etki takibi ve bilinçli tüketim önerileri sunan mobil uygulama.',
    en: 'Mobile app offering barcode scanning, environmental impact tracking, and conscious consumption recommendations for sustainable living.',
    de: 'Mobile App mit Barcode-Scanning, Umweltauswirkungsverfolgung und bewussten Konsumempfehlungen für nachhaltiges Leben.',
    fr: 'Application mobile offrant la numérisation de codes-barres, le suivi de l\'impact environnemental et des recommandations de consommation consciente pour un mode de vie durable.',
  };

  return {
    name: names[locale],
    description: descriptions[locale],
    applicationCategory: 'LifestyleApplication',
    operatingSystem: ['iOS', 'Android'],
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TRY',
        category: 'Free',
      },
      {
        '@type': 'Offer',
        price: '29.99',
        priceCurrency: 'TRY',
        category: 'Premium',
        priceSpecification: {
          '@type': 'RecurringCharge',
          price: '29.99',
          priceCurrency: 'TRY',
          billingDuration: 'P1M',
        },
      },
    ],
    downloadUrl: [
      'https://apps.apple.com/app/coria',
      'https://play.google.com/store/apps/details?id=com.coria.app',
    ],
    screenshot: [
      `${baseUrl}/screenshots/home.png`,
      `${baseUrl}/screenshots/scan.png`,
      `${baseUrl}/screenshots/impact.png`,
    ],
    featureList: [
      'Barcode Scanning',
      'Sustainability Scoring',
      'Environmental Impact Tracking',
      'Alternative Recommendations',
      'Smart Pantry Management',
    ],
    author: {
      '@type': 'Organization',
      name: 'CORIA',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'CORIA',
      url: baseUrl,
    },
  };
}

export function generateBreadcrumbStructuredData(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  };
}