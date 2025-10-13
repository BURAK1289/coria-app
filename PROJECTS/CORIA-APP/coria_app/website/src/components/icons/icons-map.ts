/**
 * CORIA Icon Registry
 *
 * Central mapping of icon names to their components for the Icon component.
 * This enables tree-shaking and type-safe icon usage.
 *
 * @example
 * import { Icon } from './Icon';
 * <Icon name="search" /> // Type-safe, auto-complete enabled
 */

import { SVGProps } from 'react';

// Import existing custom icons
import {
  AppleIcon,
  GooglePlayIcon,
  PlayIcon,
  ChevronDownIcon,
  CheckIcon,
  StarIcon,
  XIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ArrowUpIcon,
} from './index';

import {
  CoriaFoundationIcon,
  VeganAnalysisIcon,
  AIAssistantIcon,
  SmartPantryIcon,
  ESGScoreIcon,
  CarbonWaterTrackingIcon,
  CommunityIcon,
  TokenEconomyIcon,
  TransparencyIcon,
  ImpactFocusIcon,
  GreenEnergyIcon,
  SustainabilityIcon,
  LeafIcon,
  CarbonIcon,
  WaterIcon,
  HeartIcon,
  CycleIcon,
} from './coria-icons';

import {
  AIAssistantSvgIcon,
  SmartPantrySvgIcon,
  CommunitySvgIcon,
  SustainabilitySvgIcon,
  HealthSvgIcon,
  ESGScoreSvgIcon,
  CarbonWaterSvgIcon,
  VeganAllergenSvgIcon,
  VeganUserSvgIcon,
  ParentsSvgIcon,
  TestimonialAnalyticsSvgIcon,
  TestimonialChatSvgIcon,
  TestimonialFoundationSvgIcon,
} from './svg-icons';

import {
  TwitterIcon,
  LinkedInIcon,
  InstagramIcon,
  YouTubeIcon,
  FacebookIcon,
} from './social-icons';

// Import new core icons
import {
  HomeIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
  SettingsIcon,
  FilterIcon,
  BellIcon,
  DownloadIcon,
  UploadIcon,
  ShareIcon,
  PlusIcon,
  MinusIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SortIcon,
  CartIcon,
  ExternalLinkIcon,
  GlobeIcon,
  LanguageIcon,
  WalletIcon,
  // Phase 3.2 - New core icons
  AlertTriangleIcon,
  BugIcon,
  InfoIcon,
  BarChartIcon,
  TrendingUpIcon,
  FileTextIcon,
  FlaskIcon,
  SmartphoneIcon,
  BookOpenIcon,
} from './svg/core';

/**
 * Icon component type
 */
type IconComponent = React.FC<SVGProps<SVGSVGElement> & { size?: number }>;

/**
 * Icon map - Maps icon names to their components
 *
 * Naming convention:
 * - Use kebab-case for multi-word names
 * - Use semantic names (close, not x)
 * - Match visual appearance, not implementation
 */
export const iconMap: Record<string, IconComponent> = {
  // ========== CORE UTILITY ICONS ==========

  // Platform
  'apple': AppleIcon,
  'google-play': GooglePlayIcon,
  'play': PlayIcon,

  // Status & Feedback
  'check': CheckIcon,
  'close': XIcon,
  'x': XMarkIcon,
  'refresh': ArrowPathIcon,
  'shield-check': ShieldCheckIcon,

  // Navigation
  'arrow-up': ArrowUpIcon,
  'chevron-down': ChevronDownIcon,

  // Communication
  'envelope': EnvelopeIcon,
  'chat': ChatBubbleLeftRightIcon,
  'question': QuestionMarkCircleIcon,

  // Rating
  'star': StarIcon,

  // ========== CORIA BRAND ICONS ==========

  // Foundation
  'coria-foundation': CoriaFoundationIcon,
  'heart': HeartIcon,
  'leaf': LeafIcon,

  // Features
  'vegan-analysis': VeganAnalysisIcon,
  'ai-assistant': AIAssistantIcon,
  'smart-pantry': SmartPantryIcon,
  'community': CommunityIcon,

  // Environmental
  'esg-score': ESGScoreIcon,
  'carbon-water': CarbonWaterTrackingIcon,
  'carbon': CarbonIcon,
  'water': WaterIcon,
  'sustainability': SustainabilityIcon,
  'green-energy': GreenEnergyIcon,
  'cycle': CycleIcon,

  // Values
  'token-economy': TokenEconomyIcon,
  'transparency': TransparencyIcon,
  'impact-focus': ImpactFocusIcon,

  // ========== SVG FEATURE ICONS ==========

  'ai-assistant-svg': AIAssistantSvgIcon,
  'smart-pantry-svg': SmartPantrySvgIcon,
  'community-svg': CommunitySvgIcon,
  'sustainability-svg': SustainabilitySvgIcon,
  'health': HealthSvgIcon,
  'esg-score-svg': ESGScoreSvgIcon,
  'carbon-water-svg': CarbonWaterSvgIcon,
  'vegan-allergen': VeganAllergenSvgIcon,
  'vegan-user': VeganUserSvgIcon,
  'parents': ParentsSvgIcon,
  'testimonial-analytics': TestimonialAnalyticsSvgIcon,
  'testimonial-chat': TestimonialChatSvgIcon,
  'testimonial-foundation': TestimonialFoundationSvgIcon,

  // ========== SOCIAL MEDIA ICONS ==========

  'twitter': TwitterIcon,
  'linkedin': LinkedInIcon,
  'instagram': InstagramIcon,
  'youtube': YouTubeIcon,
  'facebook': FacebookIcon,

  // ========== NEW CORE ICONS ==========

  // Primary Navigation
  'home': HomeIcon,
  'menu': MenuIcon,
  'search': SearchIcon,
  'user': UserIcon,
  'settings': SettingsIcon,
  'filter': FilterIcon,

  // Notifications & Actions
  'bell': BellIcon,
  'download': DownloadIcon,
  'upload': UploadIcon,
  'share': ShareIcon,
  'plus': PlusIcon,
  'minus': MinusIcon,

  // Directional Arrows
  'arrow-down': ArrowDownIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,

  // Chevrons
  'chevron-left': ChevronLeftIcon,
  'chevron-right': ChevronRightIcon,

  // Utility Icons
  'sort': SortIcon,
  'cart': CartIcon,
  'external-link': ExternalLinkIcon,
  'globe': GlobeIcon,
  'language': LanguageIcon,
  'wallet': WalletIcon,

  // ========== PHASE 3.2 - NEW CORE ICONS ==========

  // Status & Feedback
  'alert-triangle': AlertTriangleIcon,
  'bug': BugIcon,
  'info': InfoIcon,

  // Data & Analytics
  'bar-chart': BarChartIcon,
  'trending-up': TrendingUpIcon,

  // Documents & Content
  'file-text': FileTextIcon,
  'flask': FlaskIcon,
  'smartphone': SmartphoneIcon,
  'book-open': BookOpenIcon,
};

/**
 * Icon name type - All available icon names
 * This provides autocomplete in IDEs and type safety
 */
export type IconName = keyof typeof iconMap;

/**
 * Helper function to check if an icon name is valid
 */
export function isValidIconName(name: string): name is IconName {
  return name in iconMap;
}

/**
 * Helper function to get all available icon names
 */
export function getAvailableIcons(): IconName[] {
  return Object.keys(iconMap) as IconName[];
}

/**
 * Helper function to search icons by keyword
 */
export function searchIcons(query: string): IconName[] {
  const lowerQuery = query.toLowerCase();
  return getAvailableIcons().filter(name =>
    name.toLowerCase().includes(lowerQuery)
  );
}
