'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Icon } from '@/components/icons/Icon';
import { PAYWALL_TRIGGERS } from '@/data/pricing';
import {
  navigateToUpgrade,
  trackPaywallEvent,
  type PaywallTrigger,
} from '@/lib/paywall';

interface PaywallCardProps {
  trigger: PaywallTrigger;
  variant?: 'inline' | 'modal';
  source?: string; // Component/screen name for analytics
  onDismiss?: () => void; // Callback for modal dismissal
}

export function PaywallCard({
  trigger,
  variant = 'inline',
  source = 'unknown',
  onDismiss,
}: PaywallCardProps) {
  const t = useTranslations('pricing.paywallTriggers');
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'tr';

  // Track paywall view event
  useEffect(() => {
    trackPaywallEvent({
      trigger,
      source,
      timestamp: Date.now(),
      userAction: 'view',
      metadata: { variant, pathname },
    });
  }, [trigger, source, variant, pathname]);

  const icons: Record<PaywallTrigger, string> = {
    alternatives: 'lightbulb',
    recipes: 'chef-hat',
    aiLimit: 'message-square',
    pantryLimit: 'package',
    mealPlanner: 'calendar',
  };

  const colors: Record<PaywallTrigger, string> = {
    alternatives: 'bg-blue-50 border-blue-200 text-blue-700',
    recipes: 'bg-green-50 border-green-200 text-green-700',
    aiLimit: 'bg-purple-50 border-purple-200 text-purple-700',
    pantryLimit: 'bg-amber-50 border-amber-200 text-amber-700',
    mealPlanner: 'bg-pink-50 border-pink-200 text-pink-700',
  };

  const iconColors: Record<PaywallTrigger, string> = {
    alternatives: 'text-blue-600',
    recipes: 'text-green-600',
    aiLimit: 'text-purple-600',
    pantryLimit: 'text-amber-600',
    mealPlanner: 'text-pink-600',
  };

  if (variant === 'inline') {
    return (
      <div
        className={`flex items-center gap-4 p-4 rounded-xl border-2 ${colors[trigger]}`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex-shrink-0">
          <Icon
            name={icons[trigger] as any}
            className={`w-6 h-6 ${iconColors[trigger]}`}
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <Typography variant="base" className="font-medium mb-1">
            {t(`${trigger}.title`)}
          </Typography>
          <Typography variant="small" className="text-text-secondary">
            {t(`${trigger}.description`)}
          </Typography>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="flex-shrink-0"
          onClick={() => {
            navigateToUpgrade(trigger, locale, router);
          }}
        >
          {t(`${trigger}.cta`)}
        </Button>
      </div>
    );
  }

  // Modal variant
  return (
    <div
      className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
      role="dialog"
      aria-labelledby="paywall-title"
      aria-describedby="paywall-description"
    >
      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${colors[trigger]} mb-6`}>
        <Icon
          name={icons[trigger] as any}
          className={`w-8 h-8 ${iconColors[trigger]}`}
          aria-hidden="true"
        />
      </div>

      <Typography variant="h3" id="paywall-title" className="mb-4">
        {t(`${trigger}.title`)}
      </Typography>

      <Typography variant="large" id="paywall-description" className="text-text-secondary mb-8">
        {t(`${trigger}.description`)}
      </Typography>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          onClick={() => {
            navigateToUpgrade(trigger, locale, router);
          }}
        >
          {t(`${trigger}.cta`)}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          className="w-full text-text-secondary"
          onClick={() => {
            // Track dismissal
            trackPaywallEvent({
              trigger,
              source,
              timestamp: Date.now(),
              userAction: 'dismiss',
            });
            onDismiss?.();
          }}
        >
          {t('dismissButton', { defaultValue: 'Daha sonra' })}
        </Button>
      </div>
    </div>
  );
}

/**
 * Paywall Trigger Showcase
 * Displays all paywall triggers for pricing page demonstration
 */
export function PaywallShowcase() {
  const t = useTranslations('pricing');

  const triggers: PaywallTrigger[] = ['alternatives', 'recipes', 'aiLimit', 'pantryLimit', 'mealPlanner'];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <Typography variant="h2" className="mb-4">
            Upgrade Anları
          </Typography>
          <Typography variant="large" className="text-text-secondary max-w-2xl mx-auto">
            Premium özelliklerine erişmek istediğinizde size yardımcı olacak akıllı uyarılar
          </Typography>
        </div>

        <div className="space-y-4">
          {triggers.map((trigger) => (
            <PaywallCard key={trigger} trigger={trigger} variant="inline" />
          ))}
        </div>
      </div>
    </section>
  );
}
