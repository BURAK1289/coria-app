'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { Button, Text, Container } from '@/components/ui';
import { AppleIcon, GooglePlayIcon } from '@/components/icons';

interface FooterProps {
  className?: string;
}

const productLinks = [
  { key: 'features', href: '/features' },
  { key: 'pricing', href: '/pricing' },
  { key: 'blog', href: '/blog' },
  { label: 'Foundation', href: '/foundation' }
];

const companyLinks = [
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
  { label: 'Basın & Yatırımcı', href: '/about#press' }
];

const supportLinks = [
  { label: 'Yardım Merkezi', href: '/contact#support' },
  { label: 'SSS', href: '/contact#faq' },
  { label: 'Fon Başvurusu', href: '/foundation#apply' }
];

const legalLinks = [
  { label: 'Gizlilik Politikası', href: '/legal/privacy' },
  { label: 'Kullanım Koşulları', href: '/legal/terms' },
  { label: 'KVKK Aydınlatması', href: '/legal/kvkk' },
  { label: 'Çerez Politikası', href: '/legal/cookies' }
];

const applicationLinks = [
  {
    label: 'App Store',
    href: 'https://apps.apple.com/app/coria',
    icon: AppleIcon,
  },
  {
    label: 'Google Play',
    href: 'https://play.google.com/store/apps/details?id=com.coria.app',
    icon: GooglePlayIcon,
  }
];

const socialLinks = [
  { name: 'Twitter', href: 'https://twitter.com/coria_app' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/coria-app' },
  { name: 'Instagram', href: 'https://instagram.com/coria_app' },
  { name: 'YouTube', href: 'https://youtube.com/@coria_app' },
];

export function Footer({ className = '' }: FooterProps) {
  const t = useTranslations();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsSubscribed(true);
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className={`relative overflow-hidden border-t border-white/40 bg-gradient-to-b from-white via-foam to-coria-sand ${className}`}>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(205,234,221,0.5),transparent_55%)]" />
      <Container size="xl" padding="lg" className="relative z-10">
        <div className="grid grid-cols-1 gap-12 py-14 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="group flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--foam)] shadow-sm">
                <Image src="/coria-app-logo.svg" alt="Coria logo" width={40} height={40} className="h-10 w-10 object-contain" />
              </span>
              <span className="flex flex-col leading-tight text-left">
                <span className="text-xl font-bold text-coria-primary">CORIA</span>
                <span className="text-[11px] uppercase tracking-[0.35em] text-coria-gray-500">Sustainable Living</span>
              </span>
            </Link>
            <Text size="sm" color="secondary" className="max-w-sm text-gray-600">
              {t('footer.description')}
            </Text>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`CORIA ${social.name} hesabını ziyaret et`}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-coria-primary/10 bg-white/70 text-gray-500 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-coria-primary/30 hover:text-coria-primary focus:outline-none focus:ring-2 focus:ring-coria-primary focus:ring-offset-2"
                >
                  <span className="text-sm font-semibold" aria-hidden="true">{social.name[0]}</span>
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-coria-primary">
              {t('footer.newsletter.title')}
            </h3>
            {isSubscribed ? (
              <div className="flex items-center rounded-2xl border border-coria-secondary/30 bg-coria-secondary/10 px-5 py-4 text-coria-primary shadow-inner">
                <Text size="sm" className="text-coria-primary">
                  Başarıyla abone oldun!
                </Text>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <div className="relative">
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('footer.newsletter.placeholder')}
                    className="w-full rounded-full border border-coria-primary/10 bg-white/80 px-5 py-3 text-sm text-gray-700 shadow-inner backdrop-blur placeholder:text-gray-400 focus:border-coria-primary focus:outline-none focus:ring-2 focus:ring-coria-primary/30"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? t('common.loading') : t('footer.newsletter.subscribe')}
                </Button>
              </form>
            )}
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-coria-primary">Ürün</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 transition-colors hover:text-coria-primary">
                    {'key' in link ? t(`navigation.${link.key}`) : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-coria-primary">Şirket</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 transition-colors hover:text-coria-primary">
                    {'key' in link ? t(`navigation.${link.key}`) : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-coria-primary">Destek</h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 transition-colors hover:text-coria-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-coria-primary">Yasal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-gray-600 transition-colors hover:text-coria-primary">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-coria-primary">Uygulama</h3>
            <ul className="space-y-3">
              {applicationLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 rounded-full border border-coria-primary/15 bg-white/90 px-4 py-2 text-sm font-medium text-coria-primary shadow-sm transition-colors hover:bg-coria-primary/10"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/60 py-6 text-center text-sm text-gray-600 md:flex-row">
          <Text size="sm" color="secondary" className="text-gray-600">
            {t('footer.copyright')}
          </Text>
          <div className="flex gap-3 text-xs text-gray-500">
            <span>© {new Date().getFullYear()} CORIA Foundation</span>
            <span>•</span>
            <span>Impact-driven by community</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
