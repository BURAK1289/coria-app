'use client';

import dynamic from 'next/dynamic';

// Lazy load feature components to reduce bundle size
export const FeaturesSidebarLazy = dynamic(
  () => import('./features-sidebar').then((mod) => ({ default: mod.FeaturesSidebar })),
  {
    loading: () => <div className="min-h-[400px] animate-pulse bg-[var(--foam)]/50 rounded-[28px]" />,
  }
);

export const FeatureContentLazy = dynamic(
  () => import('./feature-content').then((mod) => ({ default: mod.FeatureContent })),
  {
    loading: () => <div className="min-h-[600px] animate-pulse bg-[var(--foam)]/50 rounded-[32px]" />,
  }
);
