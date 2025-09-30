import { Locale } from '@/types/localization';
import { 
  StructuredData, 
  generateWebsiteStructuredData, 
  generateOrganizationStructuredData,
  generateProductStructuredData,
  generateBreadcrumbStructuredData 
} from './structured-data';

interface SEOHeadProps {
  locale: Locale;
  breadcrumbs?: Array<{ name: string; url: string }>;
  includeOrganization?: boolean;
  includeProduct?: boolean;
  customStructuredData?: Record<string, unknown>;
}

export function SEOHead({ 
  locale, 
  breadcrumbs = [],
  includeOrganization = true,
  includeProduct = false,
  customStructuredData 
}: SEOHeadProps) {
  return (
    <>
      {/* Website structured data */}
      <StructuredData
        locale={locale}
        type="website"
        data={generateWebsiteStructuredData(locale)}
      />

      {/* Organization structured data */}
      {includeOrganization && (
        <StructuredData
          locale={locale}
          type="organization"
          data={generateOrganizationStructuredData(locale)}
        />
      )}

      {/* Product structured data */}
      {includeProduct && (
        <StructuredData
          locale={locale}
          type="product"
          data={generateProductStructuredData(locale)}
        />
      )}

      {/* Breadcrumb structured data */}
      {breadcrumbs.length > 0 && (
        <StructuredData
          locale={locale}
          type="website"
          data={generateBreadcrumbStructuredData(breadcrumbs)}
        />
      )}

      {/* Custom structured data */}
      {customStructuredData && (
        <StructuredData
          locale={locale}
          type="website"
          data={customStructuredData}
        />
      )}

      {/* Additional meta tags for enhanced SEO */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="theme-color" content="#1B5E3F" />
      <meta name="msapplication-TileColor" content="#1B5E3F" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://images.ctfassets.net" />
      
      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </>
  );
}