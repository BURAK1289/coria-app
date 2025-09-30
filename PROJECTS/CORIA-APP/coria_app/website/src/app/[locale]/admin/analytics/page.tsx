import { Metadata } from 'next';
import { AnalyticsDashboard } from '@/components/analytics/dashboard/analytics-dashboard';

export const metadata: Metadata = {
  title: 'Analytics Dashboard - CORIA Admin',
  description: 'Monitor website performance, user behavior, and conversion metrics.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}