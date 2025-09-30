import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { generateSitemapEntry } from '@/lib/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://coria.app';
  const currentDate = new Date();

  // Static pages with their priorities and change frequencies
  const staticPages = [
    {
      path: '',
      priority: 1.0,
      changeFrequency: 'weekly' as const,
    },
    {
      path: '/features',
      priority: 0.9,
      changeFrequency: 'weekly' as const,
    },
    {
      path: '/pricing',
      priority: 0.8,
      changeFrequency: 'monthly' as const,
    },
    {
      path: '/about',
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    },
    {
      path: '/contact',
      priority: 0.6,
      changeFrequency: 'monthly' as const,
    },
    {
      path: '/blog',
      priority: 0.8,
      changeFrequency: 'daily' as const,
    },
  ];

  // Generate sitemap entries for all locales
  const sitemapEntries: MetadataRoute.Sitemap = [];

  staticPages.forEach(({ path, priority, changeFrequency }) => {
    routing.locales.forEach(locale => {
      const url = path === '' 
        ? `${baseUrl}/${locale}` 
        : `${baseUrl}/${locale}${path}`;

      // Create alternate language URLs
      const alternates: Record<string, string> = {};
      routing.locales.forEach(altLocale => {
        const altUrl = path === '' 
          ? `${baseUrl}/${altLocale}` 
          : `${baseUrl}/${altLocale}${path}`;
        alternates[altLocale] = altUrl;
      });

      sitemapEntries.push({
        url,
        lastModified: currentDate,
        changeFrequency,
        priority,
        alternates: {
          languages: alternates,
        },
      });
    });
  });

  // Add root redirect (optional)
  sitemapEntries.push({
    url: baseUrl,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 1.0,
  });

  return sitemapEntries;
}