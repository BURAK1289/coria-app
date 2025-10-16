'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { AppleIcon, GooglePlayIcon } from '@/components/icons';
import { FOOTER_DATA } from '@/data/footer';
import type { Locale } from '@/types/localization';

// Simple SVG icon component
const SocialIcon = ({ name, ...props }: { name: string } & React.SVGProps<SVGSVGElement>) => {
  const icons: Record<string, JSX.Element> = {
    twitter: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    ),
    linkedin: (
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    ),
    instagram: (
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    ),
    medium: (
      <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
    ),
    youtube: (
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    ),
  };

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      {icons[name] || null}
    </svg>
  );
};

export interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const t = useTranslations('footer');
  const locale = useLocale() as Locale;
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="coria-footer"
      data-footer="true"
      role="contentinfo"
      className={`relative border-t border-white/30 ${className}`}
    >
      <Container size="xl" className="py-12">
        {/* Logo and Newsletter Section */}
        <div className="flex flex-col lg:flex-row gap-12 justify-between items-center lg:items-start mb-12 pb-8 border-b border-white/30">
          {/* Logo - Sol taraf */}
          <div className="flex-shrink-0 w-full lg:w-auto flex justify-center lg:justify-start lg:ml-[100px]">
            <Link href={`/${locale}`} className="inline-block group">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                  <Image
                    src="/coria-app-logo.webp"
                    alt="CORIA Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8 object-cover group-hover:scale-110 transition-transform"
                    priority
                  />
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <span className="text-2xl font-bold text-[var(--coria-primary)]">CORIA</span>
                  <Typography variant="small" className="text-gray-700 max-w-[200px] leading-relaxed font-medium">
                    {t('description')}
                  </Typography>
                </div>
              </div>
            </Link>
          </div>

          {/* Newsletter - Sağ taraf */}
          <div className="w-full lg:w-auto lg:min-w-[380px] lg:max-w-[420px] flex justify-center lg:justify-end lg:mr-[100px]">
            <div className="w-full">
            <Typography variant="h6" className="mb-2 text-[var(--coria-primary)] font-bold">
              {t('newsletter.title')}
            </Typography>
            <Typography variant="small" className="text-gray-700 mb-4 font-medium">
              {t('newsletter.description')}
            </Typography>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                console.log('Newsletter subscription submitted');
              }}
            >
              <input
                type="email"
                placeholder={t('newsletter.placeholder')}
                className="flex-1 px-4 py-2 border border-gray-400 rounded-lg bg-transparent backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-coria-green focus:border-transparent shadow-sm"
                required
                aria-label={t('newsletter.placeholder')}
              />
              <Button type="submit" variant="primary" size="md">
                {t('newsletter.button')}
              </Button>
            </form>
            </div>
          </div>
        </div>

        {/* Link Groups - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {FOOTER_DATA.linkGroups.map((group) => (
            <nav key={group.id} aria-labelledby={`${group.id}-heading`}>
              <Typography
                id={`${group.id}-heading`}
                variant="h6"
                className="mb-4 text-[var(--coria-primary)] uppercase text-xs font-bold tracking-wider"
              >
                {t(group.titleKey)}
              </Typography>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.key}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target={link.newTab ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="text-gray-700 hover:text-coria-green transition-colors text-sm inline-flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-coria-green focus:ring-offset-2 rounded font-medium"
                      >
                        {t(link.key)}
                      </a>
                    ) : (
                      <Link
                        href={`/${locale}${link.href}`}
                        className="text-gray-700 hover:text-coria-green transition-colors text-sm inline-block focus:outline-none focus:ring-2 focus:ring-coria-green focus:ring-offset-2 rounded font-medium"
                      >
                        {t(link.key)}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom Section - Social Links, App Store, Copyright */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center pt-8 border-t border-white/30">
          {/* Social Links */}
          <div className="flex gap-4">
            {FOOTER_DATA.socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border border-gray-400 bg-transparent backdrop-blur-sm flex items-center justify-center text-gray-700 hover:text-white hover:bg-coria-green hover:border-coria-green transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coria-green focus:ring-offset-2 shadow-sm"
                aria-label={t(social.ariaLabel)}
              >
                <SocialIcon name={social.iconName} className="w-6 h-6" />
                <span className="sr-only">{t(social.ariaLabel)}</span>
              </a>
            ))}
          </div>

          {/* App Store Links */}
          <div className="flex gap-4">
            <a
              href="https://apps.apple.com/app/coria"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-400 bg-transparent backdrop-blur-sm rounded-lg hover:border-coria-green hover:bg-coria-green/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coria-green focus:ring-offset-2 shadow-sm"
              aria-label="Download on App Store"
            >
              <AppleIcon className="w-6 h-6" />
              <div className="text-left">
                <Typography variant="caption" className="text-gray-600 text-[10px]">
                  Download on
                </Typography>
                <Typography variant="small" className="text-[var(--coria-primary)] font-bold -mt-1">
                  App Store
                </Typography>
              </div>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.coria"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-400 bg-transparent backdrop-blur-sm rounded-lg hover:border-coria-green hover:bg-coria-green/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coria-green focus:ring-offset-2 shadow-sm"
              aria-label="Get it on Google Play"
            >
              <GooglePlayIcon className="w-6 h-6" />
              <div className="text-left">
                <Typography variant="caption" className="text-gray-600 text-[10px]">
                  Get it on
                </Typography>
                <Typography variant="small" className="text-[var(--coria-primary)] font-bold -mt-1">
                  Google Play
                </Typography>
              </div>
            </a>
          </div>

          {/* Copyright */}
          <Typography variant="small" className="text-gray-700 font-medium">
            {t('copyright.text', { year: currentYear })}
          </Typography>
        </div>
      </Container>
    </footer>
  );
}
