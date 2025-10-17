'use client';

/**
 * Overview Metrics Dashboard Component
 * Displays key website metrics and KPIs
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  OverviewMetrics, 
  generateMockDashboardData, 
  trackDashboardView,
  trackDashboardInteraction 
} from '@/lib/analytics/dashboard-data';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  format?: 'number' | 'percentage' | 'duration' | 'currency';
  icon?: React.ReactNode;
}

function MetricCard({ title, value, change, format = 'number', icon }: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'percentage':
        return `${(val * 100).toFixed(1)}%`;
      case 'duration':
        return `${Math.floor(val / 60)}m ${val % 60}s`;
      case 'currency':
        return `₺${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const changeColor = change && change > 0 ? 'text-green-600' : change && change < 0 ? 'text-red-600' : 'text-gray-500';
  const changeIcon = change && change > 0 ? '↗' : change && change < 0 ? '↘' : '';

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
          {change !== undefined && (
            <p className={`text-sm ${changeColor} flex items-center mt-1`}>
              <span className="mr-1">{changeIcon}</span>
              {Math.abs(change * 100).toFixed(1)}% vs last period
            </p>
          )}
        </div>
        {icon && (
          <div className="text-gray-400">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

interface TopPagesTableProps {
  pages: OverviewMetrics['topPages'];
}

function TopPagesTable({ pages }: TopPagesTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Pages</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 font-medium text-gray-600">Page</th>
              <th className="text-right py-2 font-medium text-gray-600">Views</th>
              <th className="text-right py-2 font-medium text-gray-600">Unique</th>
              <th className="text-right py-2 font-medium text-gray-600">Avg Time</th>
              <th className="text-right py-2 font-medium text-gray-600">Bounce Rate</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-3">
                  <div>
                    <div className="font-medium text-gray-900">{page.title}</div>
                    <div className="text-gray-500 text-xs">{page.path}</div>
                  </div>
                </td>
                <td className="text-right py-3 text-gray-900">{page.views.toLocaleString()}</td>
                <td className="text-right py-3 text-gray-600">{page.uniqueViews.toLocaleString()}</td>
                <td className="text-right py-3 text-gray-600">
                  {Math.floor(page.averageTime / 60)}m {page.averageTime % 60}s
                </td>
                <td className="text-right py-3 text-gray-600">{(page.bounceRate * 100).toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface DeviceBreakdownProps {
  devices: OverviewMetrics['deviceBreakdown'];
}

function DeviceBreakdown({ devices }: DeviceBreakdownProps) {
  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'mobile':
        return '📱';
      case 'desktop':
        return '💻';
      case 'tablet':
        return '📱';
      default:
        return '📱';
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
      <div className="space-y-4">
        {devices.map((device, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getDeviceIcon(device.category)}</span>
              <div>
                <div className="font-medium text-gray-900 capitalize">{device.category}</div>
                <div className="text-sm text-gray-500">
                  Avg session: {Math.floor(device.averageSessionDuration / 60)}m {device.averageSessionDuration % 60}s
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">{device.visitors.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{(device.percentage * 100).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface CountryBreakdownProps {
  countries: OverviewMetrics['topCountries'];
}

function CountryBreakdown({ countries }: CountryBreakdownProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
      <div className="space-y-4">
        {countries.map((country, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{country.countryCode === 'TR' ? '🇹🇷' : country.countryCode === 'DE' ? '🇩🇪' : country.countryCode === 'US' ? '🇺🇸' : '🌍'}</span>
              <div className="font-medium text-gray-900">{country.country}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">{country.visitors.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{(country.percentage * 100).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function OverviewMetricsDashboard() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackDashboardView('overview');
    
    // In a real implementation, this would fetch from your analytics API
    const data = generateMockDashboardData();
    setMetrics(data.overview);
    setLoading(false);
  }, []);

  const handleRefresh = () => {
    trackDashboardInteraction('refresh', 'overview');
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const data = generateMockDashboardData();
      setMetrics(data.overview);
      setLoading(false);
    }, 1000);
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Overview Metrics</h2>
          <div className="animate-pulse bg-gray-200 h-10 w-24 rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Overview Metrics</h2>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-coria-green text-white rounded-md hover:bg-coria-green/90 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Visitors"
          value={metrics.totalVisitors}
          change={0.12}
          icon={<span className="text-2xl">👥</span>}
        />
        <MetricCard
          title="Page Views"
          value={metrics.totalPageViews}
          change={0.08}
          icon={<span className="text-2xl">📄</span>}
        />
        <MetricCard
          title="Avg Session Duration"
          value={metrics.averageSessionDuration}
          format="duration"
          change={0.05}
          icon={<span className="text-2xl">⏱️</span>}
        />
        <MetricCard
          title="Conversion Rate"
          value={metrics.conversionRate}
          format="percentage"
          change={0.15}
          icon={<span className="text-2xl">🎯</span>}
        />
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPagesTable pages={metrics.topPages} />
        <DeviceBreakdown devices={metrics.deviceBreakdown} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CountryBreakdown countries={metrics.topCountries} />
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Bounce Rate</span>
              <span className="font-medium">{(metrics.bounceRate * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pages per Session</span>
              <span className="font-medium">{(metrics.totalPageViews / metrics.totalVisitors).toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New vs Returning</span>
              <span className="font-medium">68% / 32%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}