'use client';

import dynamic from 'next/dynamic';

// Lazy load analytics dashboard to reduce bundle size
export const AnalyticsDashboardLazy = dynamic(
  () => import('./dashboard/analytics-dashboard').then((mod) => ({ default: mod.AnalyticsDashboard })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading analytics dashboard...</div>
      </div>
    ),
    ssr: false,
  }
);
