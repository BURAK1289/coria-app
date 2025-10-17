'use client';

/**
 * Conversion Funnel Dashboard Component
 * Visualizes user journey and conversion optimization
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  ConversionMetrics, 
  generateMockDashboardData, 
  trackDashboardView,
  trackDashboardInteraction 
} from '@/lib/analytics/dashboard-data';

interface FunnelStepProps {
  step: ConversionMetrics['funnelSteps'][0];
  index: number;
  isLast: boolean;
}

function FunnelStep({ step, index, isLast }: FunnelStepProps) {
  const width = Math.max(step.conversionRate * 100, 10); // Minimum 10% width for visibility
  
  return (
    <div className="relative">
      <div className="flex items-center space-x-4 mb-2">
        <div className="flex-shrink-0 w-8 h-8 bg-coria-green text-white rounded-full flex items-center justify-center text-sm font-medium">
          {index + 1}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{step.step}</h4>
          <p className="text-sm text-gray-500">
            {step.visitors.toLocaleString()} visitors • {(step.conversionRate * 100).toFixed(1)}% conversion
          </p>
        </div>
        <div className="text-right">
          <div className="font-medium text-gray-900">{step.visitors.toLocaleString()}</div>
          {step.dropoffRate > 0 && (
            <div className="text-sm text-red-600">-{(step.dropoffRate * 100).toFixed(1)}% dropoff</div>
          )}
        </div>
      </div>
      
      {/* Visual funnel representation */}
      <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-coria-green to-coria-green/80 transition-all duration-500"
          style={{ width: `${width}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium text-white mix-blend-difference">
            {(step.conversionRate * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      
      {/* Connector arrow */}
      {!isLast && (
        <div className="flex justify-center mb-4">
          <div className="w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-gray-300"></div>
        </div>
      )}
    </div>
  );
}

interface DownloadMetricsProps {
  downloads: ConversionMetrics['downloadClicks'];
}

function DownloadMetrics({ downloads }: DownloadMetricsProps) {
  const totalClicks = downloads.reduce((sum, d) => sum + d.clicks, 0);
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">App Download Performance</h3>
      <div className="space-y-4">
        {downloads.map((download, index) => (
          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {download.platform === 'ios' ? '🍎' : '🤖'}
              </span>
              <div>
                <div className="font-medium text-gray-900 capitalize">
                  {download.platform === 'ios' ? 'App Store' : 'Google Play'}
                </div>
                <div className="text-sm text-gray-500">
                  From {download.source}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-gray-900">{download.clicks.toLocaleString()} clicks</div>
              <div className="text-sm text-gray-500">
                {(download.conversionRate * 100).toFixed(1)}% conversion
              </div>
              <div className="text-xs text-gray-400">
                {((download.clicks / totalClicks) * 100).toFixed(1)}% of total
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface EngagementEventsProps {
  events: ConversionMetrics['engagementEvents'];
}

function EngagementEvents({ events }: EngagementEventsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement Events</h3>
      <div className="space-y-3">
        {events.map((event, index) => {
          const engagementRate = event.uniqueUsers > 0 ? event.count / event.uniqueUsers : 0;
          
          return (
            <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <div className="font-medium text-gray-900">
                  {event.event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div className="text-sm text-gray-500">
                  {event.uniqueUsers.toLocaleString()} unique users
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{event.count.toLocaleString()}</div>
                <div className="text-sm text-gray-500">
                  {engagementRate.toFixed(1)} per user
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

interface GoalCompletionsProps {
  goals: ConversionMetrics['goalCompletions'];
}

function GoalCompletions({ goals }: GoalCompletionsProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Completions</h3>
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div key={index} className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">
                {goal.goal.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h4>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-700">{goal.completions.toLocaleString()}</div>
                <div className="text-sm text-green-600">completions</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-700">
                  {(goal.conversionRate * 100).toFixed(2)}%
                </div>
                <div className="text-sm text-green-600">conversion rate</div>
              </div>
            </div>
            {goal.value && (
              <div className="mt-2 pt-2 border-t border-green-200">
                <div className="text-sm text-green-600">
                  Total value: ₺{goal.value.toLocaleString()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ConversionFunnelDashboard() {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackDashboardView('conversion_funnel');
    
    // In a real implementation, this would fetch from your analytics API
    const data = generateMockDashboardData();
    setMetrics(data.conversions);
    setLoading(false);
  }, []);

  const handleOptimizationSuggestion = (step: string) => {
    trackDashboardInteraction('optimization_suggestion', 'conversion_funnel', step);
    // In a real implementation, this would show optimization suggestions
    alert(`Optimization suggestions for: ${step}`);
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const overallConversionRate = metrics.funnelSteps.length > 0 
    ? metrics.funnelSteps[metrics.funnelSteps.length - 1].conversionRate 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Conversion Funnel</h2>
          <p className="text-gray-600">
            Overall conversion rate: <span className="font-semibold text-coria-green">
              {(overallConversionRate * 100).toFixed(2)}%
            </span>
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => trackDashboardInteraction('export', 'conversion_funnel')}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Export Data
          </button>
          <button
            onClick={() => handleOptimizationSuggestion('overall')}
            className="px-4 py-2 bg-coria-green text-white rounded-md hover:bg-coria-green/90 transition-colors"
          >
            Get Suggestions
          </button>
        </div>
      </div>

      {/* Conversion Funnel Visualization */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">User Journey Funnel</h3>
        <div className="space-y-4">
          {metrics.funnelSteps.map((step, index) => (
            <FunnelStep
              key={index}
              step={step}
              index={index}
              isLast={index === metrics.funnelSteps.length - 1}
            />
          ))}
        </div>
      </Card>

      {/* Additional Conversion Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DownloadMetrics downloads={metrics.downloadClicks} />
        <EngagementEvents events={metrics.engagementEvents} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GoalCompletions goals={metrics.goalCompletions} />
        
        {/* Form Performance */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Form Performance</h3>
          <div className="space-y-4">
            {metrics.formSubmissions.map((form, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 capitalize">
                    {form.formType.replace(/_/g, ' ')} Form
                  </h4>
                  <span className="text-sm text-gray-500">
                    Avg time: {Math.floor(form.averageTime / 60)}m {form.averageTime % 60}s
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {form.submissions.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">submissions</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-coria-green">
                      {(form.completionRate * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">completion rate</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}