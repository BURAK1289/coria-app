'use client';

import dynamic from 'next/dynamic';

// Lazy-load non-critical components for better performance
export const ConsentBanner = dynamic(
  () => import('@/components/analytics/consent-banner').then(mod => ({ default: mod.ConsentBanner })),
  { ssr: false }
);

export const InstallPrompt = dynamic(
  () => import('@/components/pwa/install-prompt').then(mod => ({ default: mod.InstallPrompt })),
  { ssr: false }
);

export const UpdateNotification = dynamic(
  () => import('@/components/pwa/update-notification').then(mod => ({ default: mod.UpdateNotification })),
  { ssr: false }
);

export const NotificationPermission = dynamic(
  () => import('@/components/pwa/notification-permission').then(mod => ({ default: mod.NotificationPermission })),
  { ssr: false }
);
