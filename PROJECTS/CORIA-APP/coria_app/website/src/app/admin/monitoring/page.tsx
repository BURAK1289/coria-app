import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icons/Icon';

export const metadata: Metadata = {
  title: 'Monitoring Dashboard - CORIA Admin',
  description: 'Real-time monitoring and performance metrics for CORIA website',
};

// Disable SSR for real-time monitoring dashboard
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// This would typically fetch real data from your monitoring APIs
async function getMonitoringData() {
  // Mock data - replace with actual API calls
  return {
    status: 'healthy' as const,
    uptime: 99.98,
    responseTime: 245,
    lastCheck: new Date().toISOString(),
    metrics: {
      availability: { value: 99.98, trend: 'up' },
      performance: { value: 245, trend: 'stable' },
      errors: { value: 0.02, trend: 'down' },
      traffic: { value: 1250, trend: 'up' },
    },
    alerts: [
      {
        id: '1',
        type: 'warning' as 'warning' | 'critical',
        message: 'Response time increased by 15% in the last hour',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        resolved: false,
      },
    ],
    services: [
      { name: 'Website', status: 'healthy', responseTime: 245 },
      { name: 'CMS (Contentful)', status: 'healthy', responseTime: 180 },
      { name: 'Analytics', status: 'healthy', responseTime: 95 },
      { name: 'CDN', status: 'healthy', responseTime: 45 },
    ],
    recentIncidents: [
      {
        id: '1',
        title: 'Brief CDN slowdown',
        status: 'resolved',
        startTime: new Date(Date.now() - 86400000).toISOString(),
        endTime: new Date(Date.now() - 86400000 + 1800000).toISOString(),
        impact: 'minor',
      },
    ],
  };
}

export default async function MonitoringPage() {
  const data = await getMonitoringData();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoring Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Real-time monitoring and performance metrics for CORIA website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
            data.status === 'healthy'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {data.status === 'healthy' ? (
              <Icon name="check" size={16} aria-hidden="true" />
            ) : (
              <Icon name="alert-triangle" size={16} aria-hidden="true" />
            )}
            {data.status === 'healthy' ? 'All Systems Operational' : 'Issues Detected'}
          </div>
          <Button variant="outline" size="sm">
            <Icon name="activity" size={16} className="mr-2" aria-hidden="true" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uptime</p>
              <p className="text-2xl font-bold text-green-600">{data.uptime}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Icon name="check" size={24} className="text-green-600" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <Icon name="trending-up" size={16} className="mr-1" aria-hidden="true" />
            +0.02% from last month
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Time</p>
              <p className="text-2xl font-bold">{data.responseTime}ms</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Icon name="zap" size={24} className="text-blue-600" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Icon name="clock" size={16} className="mr-1" aria-hidden="true" />
            Average last 24h
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Error Rate</p>
              <p className="text-2xl font-bold text-green-600">0.02%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Icon name="shield" size={24} className="text-green-600" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <Icon name="trending-up" size={16} className="mr-1 rotate-180" aria-hidden="true" />
            -0.01% from yesterday
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold">1,250</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Icon name="globe" size={24} className="text-purple-600" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-600">
            <Icon name="trending-up" size={16} className="mr-1" aria-hidden="true" />
            +12% from last hour
          </div>
        </Card>
      </div>

      {/* Active Alerts */}
      {data.alerts.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Icon name="alert-triangle" size={20} className="mr-2 text-yellow-500" aria-hidden="true" />
            Active Alerts
          </h2>
          <div className="space-y-3">
            {data.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.type === 'critical'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Acknowledge
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Service Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Icon name="server" size={20} className="mr-2" aria-hidden="true" />
            Service Status
          </h2>
          <div className="space-y-4">
            {data.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">{service.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-600">{service.responseTime}ms</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Incidents</h2>
          {data.recentIncidents.length > 0 ? (
            <div className="space-y-4">
              {data.recentIncidents.map((incident) => (
                <div key={incident.id} className="border-l-4 border-gray-300 pl-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{incident.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      incident.status === 'resolved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(incident.startTime).toLocaleString()} - {' '}
                    {incident.endTime ? new Date(incident.endTime).toLocaleString() : 'Ongoing'}
                  </p>
                  <p className="text-sm text-gray-500 capitalize">
                    Impact: {incident.impact}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No recent incidents</p>
          )}
        </Card>
      </div>

      {/* Performance Charts Placeholder */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Trends</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Icon name="activity" size={48} className="mx-auto mb-2" aria-hidden="true" />
            <p>Performance charts would be displayed here</p>
            <p className="text-sm">Integration with monitoring service required</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline">
            <Icon name="activity" size={16} className="mr-2" aria-hidden="true" />
            Run Health Check
          </Button>
          <Button variant="outline">
            <Icon name="zap" size={16} className="mr-2" aria-hidden="true" />
            Performance Test
          </Button>
          <Button variant="outline">
            <Icon name="shield" size={16} className="mr-2" aria-hidden="true" />
            Security Scan
          </Button>
          <Button variant="outline">
            <Icon name="globe" size={16} className="mr-2" aria-hidden="true" />
            DNS Check
          </Button>
        </div>
      </Card>
    </div>
  );
}