import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://coria.app';

const languages = ['tr', 'en', 'de', 'fr'];
const pages = [
  '',
  '/features',
  '/pricing', 
  '/about',
  '/contact',
  '/blog',
  '/privacy',
  '/terms'
];

export async function GET() {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  ${languages.map(lang => 
    pages.map(page => {
      const url = `${SITE_URL}/${lang}${page}`;
      const alternates = languages.map(altLang => 
        `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${SITE_URL}/${altLang}${page}" />`
      ).join('\n');
      
      return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
${alternates}
  </url>`;
    }).join('\n')
  ).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600'
    }
  });
}