import { Metadata } from 'next';
import { AnalyticsDashboardLazy } from '@/components/analytics/analytics-dashboard-lazy';

export const metadata: Metadata = {
  title: 'Analytics Dashboard - CORIA Admin',
  description: 'Monitor website performance, user behavior, and conversion metrics.',
  robots: {
    index: false,
    follow: false,
  },
};

// Disable SSR and caching for real-time analytics dashboard
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function AnalyticsPage() {
  return <AnalyticsDashboardLazy />;
}