/**
 * Footer Data Model
 *
 * Centralized footer structure with link groups for clean information architecture.
 * Supports responsive grid layout and i18n integration.
 */

export interface FooterLink {
  key: string;           // i18n key for link text
  href: string;          // Link destination
  external?: boolean;    // External link flag
  newTab?: boolean;      // Open in new tab
}

export interface FooterGroup {
  id: string;            // Group identifier for aria-labelledby
  titleKey: string;      // i18n key for group title
  links: FooterLink[];
}

export interface SocialLink {
  name: string;
  href: string;
  iconName: string;      // Icon System v1.0 compatible name
  ariaLabel: string;     // Accessibility label
}

export interface AppStoreLink {
  platform: 'ios' | 'android';
  href: string;
  iconName: string;
}

export interface FooterData {
  linkGroups: FooterGroup[];
  socialLinks: SocialLink[];
  appStoreLinks: AppStoreLink[];
  newsletter: {
    titleKey: string;
    descriptionKey: string;
    placeholderKey: string;
    buttonKey: string;
  };
  copyright: {
    textKey: string;
    year: number;
  };
}

/**
 * Footer Link Groups
 */
export const FOOTER_LINK_GROUPS: FooterGroup[] = [
  {
    id: 'product',
    titleKey: 'product.title',
    links: [
      { key: 'product.features', href: '/features', external: false },
      { key: 'product.pricing', href: '/pricing', external: false },
      { key: 'product.foundation', href: '/foundation', external: false },
      { key: 'product.blog', href: 'https://medium.com/@coria.app.com', external: true, newTab: true },
    ],
  },
  {
    id: 'company',
    titleKey: 'company.title',
    links: [
      { key: 'company.about', href: '/about', external: false },
      { key: 'company.contact', href: '/contact', external: false },
      { key: 'company.careers', href: '/careers', external: false },
    ],
  },
  {
    id: 'resources',
    titleKey: 'resources.title',
    links: [
      { key: 'resources.faq', href: '/faq', external: false },
      { key: 'resources.foundationApply', href: '/foundation/apply', external: false },
    ],
  },
  {
    id: 'legal',
    titleKey: 'legal.title',
    links: [
      { key: 'legal.privacy', href: '/legal/privacy', external: false },
      { key: 'legal.terms', href: '/legal/terms', external: false },
      { key: 'legal.kvkk', href: '/legal/kvkk', external: false },
      { key: 'legal.cookies', href: '/legal/cookies', external: false },
    ],
  },
];

/**
 * Social Media Links
 */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    name: 'Twitter',
    href: 'https://x.com/corialabs',
    iconName: 'twitter',
    ariaLabel: 'social.twitter',
  },
  {
    name: 'LinkedIn',
    href: 'https://www.linkedin.com/company/corialabs',
    iconName: 'linkedin',
    ariaLabel: 'social.linkedin',
  },
  {
    name: 'Instagram',
    href: 'https://www.instagram.com/corialabs/',
    iconName: 'instagram',
    ariaLabel: 'social.instagram',
  },
  {
    name: 'Medium',
    href: 'https://medium.com/@coria.app.com',
    iconName: 'medium',
    ariaLabel: 'social.medium',
  },
  {
    name: 'YouTube',
    href: 'https://www.youtube.com/channel/UC_ctP4A9cuYVsoIhgpRAqQA',
    iconName: 'youtube',
    ariaLabel: 'social.youtube',
  },
];

/**
 * App Store Links
 */
export const APP_STORE_LINKS: AppStoreLink[] = [
  {
    platform: 'ios',
    href: 'https://apps.apple.com/app/coria',
    iconName: 'apple',
  },
  {
    platform: 'android',
    href: 'https://play.google.com/store/apps/details?id=com.coria',
    iconName: 'google-play',
  },
];

/**
 * Complete Footer Data Export
 */
export const FOOTER_DATA: FooterData = {
  linkGroups: FOOTER_LINK_GROUPS,
  socialLinks: SOCIAL_LINKS,
  appStoreLinks: APP_STORE_LINKS,
  newsletter: {
    titleKey: 'newsletter.title',
    descriptionKey: 'newsletter.description',
    placeholderKey: 'newsletter.placeholder',
    buttonKey: 'newsletter.button',
  },
  copyright: {
    textKey: 'copyright.text',
    year: new Date().getFullYear(),
  },
};
