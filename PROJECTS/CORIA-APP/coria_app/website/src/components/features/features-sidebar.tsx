'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import {
  ScanIcon,
  BrainIcon,
  TrendingUpIcon,
  ShieldCheckIcon,
  BarChart3Icon,
} from 'lucide-react';

import {
  SmartPantrySvgIcon,
  SustainabilitySvgIcon,
  CommunitySvgIcon,
  ESGScoreSvgIcon,
} from '@/components/icons/svg-icons';

interface FeaturesSidebarProps {
  activeCategory?: string;
  activeFeature?: string;
}

const featureCategories = [
  {
    id: 'scanning',
    icon: ScanIcon,
    features: ['barcode-scan', 'product-info', 'offline-mode'],
  },
  {
    id: 'ai-recommendations',
    icon: BrainIcon,
    features: ['personalized-suggestions', 'alternative-products', 'smart-matching'],
  },
  {
    id: 'impact-tracking',
    icon: TrendingUpIcon,
    features: ['carbon-footprint', 'water-consumption', 'environmental-metrics'],
  },
  {
    id: 'smart-pantry',
    icon: SmartPantrySvgIcon,
    features: ['inventory-management', 'expiry-tracking', 'shopping-lists'],
  },
  {
    id: 'sustainability-scoring',
    icon: SustainabilitySvgIcon,
    features: ['environmental-score', 'social-impact', 'health-rating', 'ethical-production'],
  },
  {
    id: 'community',
    icon: CommunitySvgIcon,
    features: ['user-reviews', 'community-ratings', 'shared-experiences'],
  },
  {
    id: 'premium-features',
    icon: ShieldCheckIcon,
    features: ['unlimited-scans', 'detailed-reports', 'advanced-analytics', 'ad-free'],
  },
  {
    id: 'data-insights',
    icon: BarChart3Icon,
    features: ['consumption-patterns', 'impact-visualization', 'progress-tracking'],
  },
] as const;

const categoryStyles: Record<string, { gradient: string; iconBg: string; iconText: string }> = {
  scanning: {
    gradient: 'from-coria-primary/12 via-white to-white',
    iconBg: 'bg-coria-primary/12',
    iconText: 'text-coria-primary',
  },
  'ai-recommendations': {
    gradient: 'from-coria-accent/12 via-white to-white',
    iconBg: 'bg-coria-accent/12',
    iconText: 'text-coria-accent',
  },
  'impact-tracking': {
    gradient: 'from-leaf/12 via-white to-white',
    iconBg: 'bg-leaf/12',
    iconText: 'text-leaf-700',
  },
  'smart-pantry': {
    gradient: 'from-water/12 via-white to-white',
    iconBg: 'bg-water/12',
    iconText: 'text-water',
  },
  'sustainability-scoring': {
    gradient: 'from-coria-primary-light/12 via-white to-white',
    iconBg: 'bg-coria-primary-light/12',
    iconText: 'text-coria-primary-dark',
  },
  community: {
    gradient: 'from-coria-sand/40 via-white to-white',
    iconBg: 'bg-coria-sand/80',
    iconText: 'text-coria-primary',
  },
  'premium-features': {
    gradient: 'from-coria-accent-light/30 via-white to-white',
    iconBg: 'bg-coria-accent-light/60',
    iconText: 'text-coria-accent',
  },
  'data-insights': {
    gradient: 'from-water/15 via-white to-white',
    iconBg: 'bg-water/15',
    iconText: 'text-water',
  },
};

export function FeaturesSidebar({ activeCategory, activeFeature }: FeaturesSidebarProps) {
  const t = useTranslations('features');

  return (
    <aside className="space-y-6">
      <div className="sticky top-28 space-y-5">
        <div className="space-y-2 text-sm">
          <span className="inline-flex rounded-full border border-coria-primary/20 bg-white/80 px-3 py-1 font-medium text-coria-primary shadow-sm">
            {t('sidebar.title')}
          </span>
          <p className="text-xs text-muted-foreground">
            {t('overview.subtitle')}
          </p>
        </div>

        <nav className="space-y-3">
          {featureCategories.map(({ id, icon: Icon, features }) => {
            const isActiveCategory = activeCategory === id;
            const styles = categoryStyles[id] ?? categoryStyles.scanning;

            return (
              <div key={id} className="space-y-2">
                <Link
                  href={{ pathname: '/features/[category]', params: { category: id } }}
                  aria-current={isActiveCategory ? 'page' : undefined}
                  className={cn(
                    'group block rounded-3xl border bg-gradient-to-br px-4 py-3 shadow-sm transition-all',
                    styles.gradient,
                    isActiveCategory
                      ? 'border-coria-primary/40 text-coria-primary shadow-[0_20px_40px_-30px_rgba(27,94,63,0.65)]'
                      : 'border-white/70 text-muted-foreground hover:border-coria-primary/30 hover:text-coria-primary'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl text-sm font-semibold transition-colors',
                        styles.iconBg,
                        styles.iconText
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {t(`categories.${id}.title`)}
                      </p>
                      <p className="text-xs text-muted-foreground group-hover:text-coria-primary/80">
                        {t(`categories.${id}.description`)}
                      </p>
                    </div>
                  </div>
                </Link>

                {isActiveCategory && (
                  <div className="ml-3 space-y-1.5 border-l border-coria-primary/20 pl-4">
                    {features.map((feature) => {
                      const isActiveFeature = activeFeature === feature;

                      return (
                        <Link
                          key={feature}
                          href={{
                            pathname: '/features/[category]/[feature]',
                            params: { category: id, feature },
                          }}
                          aria-current={isActiveFeature ? 'page' : undefined}
                          className={cn(
                            'group flex items-center justify-between rounded-2xl px-3 py-2 text-xs font-medium transition-all',
                            isActiveFeature
                              ? 'bg-coria-primary/10 text-coria-primary shadow-inner shadow-coria-primary/10'
                              : 'text-muted-foreground hover:bg-coria-primary/5 hover:text-coria-primary'
                          )}
                        >
                          <span>{t(`features.${feature}.title`)}</span>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-[11px] font-semibold text-coria-primary transition-colors group-hover:bg-coria-primary/90 group-hover:text-white">
                            →
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
