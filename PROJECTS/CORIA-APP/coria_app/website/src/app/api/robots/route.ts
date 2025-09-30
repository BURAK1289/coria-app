import { NextResponse } from 'next/server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://coria.app';

export async function GET() {
  const robots = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /private/

# Allow specific API endpoints
Allow: /api/sitemap
Allow: /api/robots

# Block common bot traps
Disallow: /trap/
Disallow: /honeypot/

# Social media optimization
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}