'use client';

/**
 * A/B Test Results Dashboard Component
 * Displays test performance and statistical significance
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  ABTestMetrics, 
  generateMockDashboardData, 
  trackDashboardView,
  trackDashboardInteraction 
} from '@/lib/analytics/dashboard-data';

interface TestResultCardProps {
  test: ABTestMetrics['activeTests'][0];
  results: ABTestMetrics['testResults'];
  impact: ABTestMetrics['conversionImpact'][0];
  onViewDetails: (testId: string) => void;
  onStopTest: (testId: string) => void;
}

function TestResultCard({ test, results, impact, onViewDetails, onStopTest }: TestResultCardProps) {
  const testResults = results.filter(r => r.testId === test.testId);
  const controlResult = testResults.find(r => r.variantId === 'control');
  const variantResults = testResults.filter(r => r.variantId !== 'control');
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.95) return 'text-green-600';
    if (confidence >= 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{test.testName}</h3>
          <p className="text-sm text-gray-500">Test ID: {test.testId}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
            {test.status.charAt(0).toUpperCase() + test.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Test Overview */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{test.participants.toLocaleString()}</div>
          <div className="text-sm text-gray-600">Participants</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl font-bold ${getConfidenceColor(test.confidence)}`}>
            {(test.confidence * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-gray-600">Confidence</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-coria-green">
            {impact ? `+${(impact.estimatedImpact * 100).toFixed(1)}%` : 'N/A'}
          </div>
          <div className="text-sm text-gray-600">Est. Impact</div>
        </div>
      </div>

      {/* Variant Results */}
      <div className="space-y-3 mb-6">
        {testResults.map((result, index) => {
          const isWinning = result.variantId !== 'control' && result.improvement > 0;
          const isControl = result.variantId === 'control';
          
          return (
            <div 
              key={index} 
              className={`p-4 rounded-lg border-2 ${
                isWinning ? 'border-green-200 bg-green-50' : 
                isControl ? 'border-blue-200 bg-blue-50' : 
                'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-gray-900">{result.variantName}</h4>
                  {isControl && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Control</span>}
                  {isWinning && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Winner</span>}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {(result.conversionRate * 100).toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-500">conversion</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-600">
                    {result.conversions.toLocaleString()} / {result.participants.toLocaleString()}
                  </span>
                </div>
                {result.improvement !== 0 && (
                  <div className={`font-medium ${result.improvement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {result.improvement > 0 ? '+' : ''}{(result.improvement * 100).toFixed(1)}%
                  </div>
                )}
              </div>
              
              {/* Conversion Rate Bar */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      isWinning ? 'bg-green-500' : isControl ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.max(result.conversionRate * 1000, 2)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statistical Significance */}
      {controlResult && variantResults.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-yellow-600">📊</span>
            <h4 className="font-medium text-yellow-800">Statistical Analysis</h4>
          </div>
          <div className="text-sm text-yellow-700">
            {test.confidence >= 0.95 ? (
              <>✅ Results are statistically significant (95%+ confidence)</>
            ) : test.confidence >= 0.8 ? (
              <>⚠️ Results show promise but need more data ({(test.confidence * 100).toFixed(0)}% confidence)</>
            ) : (
              <>❌ Not enough data for reliable conclusions ({(test.confidence * 100).toFixed(0)}% confidence)</>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={() => onViewDetails(test.testId)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          View Details
        </button>
        {test.status === 'running' && (
          <button
            onClick={() => onStopTest(test.testId)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Stop Test
          </button>
        )}
      </div>
    </Card>
  );
}

interface TestImpactSummaryProps {
  impacts: ABTestMetrics['conversionImpact'];
}

function TestImpactSummary({ impacts }: TestImpactSummaryProps) {
  const totalEstimatedImpact = impacts.reduce((sum, impact) => sum + impact.estimatedImpact, 0);
  const totalUserImpact = impacts.reduce((sum, impact) => sum + impact.userImpact, 0);
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Test Impact</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-700">
            +{(totalEstimatedImpact * 100).toFixed(1)}%
          </div>
          <div className="text-sm text-green-600">Total Conversion Lift</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-700">
            {totalUserImpact.toLocaleString()}
          </div>
          <div className="text-sm text-blue-600">Additional Users Impacted</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-700">
            {impacts.length}
          </div>
          <div className="text-sm text-purple-600">Active Optimizations</div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Individual Test Impacts</h4>
        {impacts.map((impact, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">
                {impact.testId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </div>
              <div className="text-sm text-gray-500">
                {impact.userImpact.toLocaleString()} users affected
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-green-600">
                +{(impact.estimatedImpact * 100).toFixed(1)}%
              </div>
              {impact.revenueImpact && (
                <div className="text-sm text-gray-500">
                  ₺{impact.revenueImpact.toLocaleString()} revenue
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ABTestResultsDashboard() {
  const [metrics, setMetrics] = useState<ABTestMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackDashboardView('ab_test_results');
    
    // In a real implementation, this would fetch from your analytics API
    const data = generateMockDashboardData();
    setMetrics(data.abTests);
    setLoading(false);
  }, []);

  const handleViewDetails = (testId: string) => {
    trackDashboardInteraction('view_test_details', 'ab_test_results', testId);
    // In a real implementation, this would navigate to detailed test analytics
    console.log('View test details:', testId);
  };

  const handleStopTest = (testId: string) => {
    trackDashboardInteraction('stop_test', 'ab_test_results', testId);
    // In a real implementation, this would stop the test
    if (confirm('Are you sure you want to stop this test?')) {
      console.log('Stop test:', testId);
    }
  };

  const handleCreateNewTest = () => {
    trackDashboardInteraction('create_test', 'ab_test_results');
    // In a real implementation, this would open test creation modal
    console.log('Create new test');
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">A/B Test Results</h2>
          <p className="text-gray-600">
            {metrics.activeTests.length} active tests • 
            {metrics.activeTests.filter(t => t.confidence >= 0.95).length} with significant results
          </p>
        </div>
        <button
          onClick={handleCreateNewTest}
          className="px-4 py-2 bg-coria-green text-white rounded-md hover:bg-coria-green/90 transition-colors"
        >
          Create New Test
        </button>
      </div>

      {/* Test Impact Summary */}
      <TestImpactSummary impacts={metrics.conversionImpact} />

      {/* Active Tests */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Tests</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metrics.activeTests.map((test, index) => {
            const impact = metrics.conversionImpact.find(i => i.testId === test.testId);
            return (
              <TestResultCard
                key={index}
                test={test}
                results={metrics.testResults}
                impact={impact!}
                onViewDetails={handleViewDetails}
                onStopTest={handleStopTest}
              />
            );
          })}
        </div>
      </div>

      {/* Test Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Optimization Recommendations</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-green-600 text-xl">✅</span>
              <div>
                <h4 className="font-medium text-green-800">Ready to Implement</h4>
                <p className="text-sm text-green-700 mt-1">
                  "Get Started Free" CTA shows 12% improvement with 78% confidence. 
                  Consider implementing this change site-wide.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-yellow-600 text-xl">⚠️</span>
              <div>
                <h4 className="font-medium text-yellow-800">Needs More Data</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Pricing display test shows promise but needs more participants for statistical significance.
                  Continue running for 2-3 more weeks.
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <span className="text-blue-600 text-xl">💡</span>
              <div>
                <h4 className="font-medium text-blue-800">New Test Suggestion</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Consider testing different hero section layouts based on current engagement patterns.
                  Focus on mobile optimization for better conversion rates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}