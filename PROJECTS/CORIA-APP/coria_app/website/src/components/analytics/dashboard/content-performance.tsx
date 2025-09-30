'use client';

/**
 * Content Performance Dashboard Component
 * Tracks blog posts, feature pages, and content engagement
 */

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  ContentMetrics, 
  generateMockDashboardData, 
  trackDashboardView,
  trackDashboardInteraction 
} from '@/lib/analytics/dashboard-data';

interface BlogPostCardProps {
  post: ContentMetrics['blogPosts'][0];
  onViewDetails: (slug: string) => void;
}

function BlogPostCard({ post, onViewDetails }: BlogPostCardProps) {
  const readTimeMinutes = Math.ceil(post.readTime / 60);
  
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {post.title}
          </h4>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>📖 {readTimeMinutes} min read</span>
            <span>👁️ {post.views.toLocaleString()} views</span>
            <span>📤 {post.socialShares} shares</span>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(post.slug)}
          className="text-coria-green hover:text-coria-green/80 text-sm font-medium"
        >
          View Details
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Engagement Rate Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Engagement Rate</span>
            <span className="font-medium">{(post.engagementRate * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-coria-green h-2 rounded-full transition-all duration-500"
              style={{ width: `${post.engagementRate * 100}%` }}
            />
          </div>
        </div>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{post.views.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Views</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{post.socialShares}</div>
            <div className="text-xs text-gray-500">Shares</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{(post.engagementRate * 100).toFixed(0)}%</div>
            <div className="text-xs text-gray-500">Engagement</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface FeaturePageTableProps {
  features: ContentMetrics['featurePages'];
}

function FeaturePageTable({ features }: FeaturePageTableProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Page Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 font-medium text-gray-600">Feature</th>
              <th className="text-right py-3 font-medium text-gray-600">Views</th>
              <th className="text-right py-3 font-medium text-gray-600">Time on Page</th>
              <th className="text-right py-3 font-medium text-gray-600">Conversion</th>
              <th className="text-right py-3 font-medium text-gray-600">Exit Rate</th>
              <th className="text-right py-3 font-medium text-gray-600">Performance</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => {
              const performanceScore = (
                (1 - feature.exitRate) * 0.4 + 
                feature.conversionRate * 0.4 + 
                Math.min(feature.timeOnPage / 300, 1) * 0.2
              ) * 100;
              
              const performanceColor = performanceScore >= 80 ? 'text-green-600' : 
                                     performanceScore >= 60 ? 'text-yellow-600' : 'text-red-600';
              
              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4">
                    <div className="font-medium text-gray-900">
                      {feature.feature.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </td>
                  <td className="text-right py-4 text-gray-900">{feature.views.toLocaleString()}</td>
                  <td className="text-right py-4 text-gray-600">
                    {Math.floor(feature.timeOnPage / 60)}m {feature.timeOnPage % 60}s
                  </td>
                  <td className="text-right py-4 text-gray-600">{(feature.conversionRate * 100).toFixed(1)}%</td>
                  <td className="text-right py-4 text-gray-600">{(feature.exitRate * 100).toFixed(1)}%</td>
                  <td className={`text-right py-4 font-medium ${performanceColor}`}>
                    {performanceScore.toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

interface LanguagePerformanceProps {
  languages: ContentMetrics['languagePerformance'];
}

function LanguagePerformance({ languages }: LanguagePerformanceProps) {
  const totalVisitors = languages.reduce((sum, lang) => sum + lang.visitors, 0);
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Language Performance</h3>
      <div className="space-y-4">
        {languages.map((lang, index) => {
          const percentage = (lang.visitors / totalVisitors) * 100;
          const flagEmoji = lang.language === 'tr' ? '🇹🇷' : 
                           lang.language === 'en' ? '🇺🇸' : 
                           lang.language === 'de' ? '🇩🇪' : '🇫🇷';
          
          return (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{flagEmoji}</span>
                  <div>
                    <div className="font-medium text-gray-900 uppercase">{lang.language}</div>
                    <div className="text-sm text-gray-500">{percentage.toFixed(1)}% of traffic</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{lang.visitors.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">visitors</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Conversion Rate</div>
                  <div className="font-medium text-coria-green">{(lang.conversionRate * 100).toFixed(2)}%</div>
                </div>
                <div>
                  <div className="text-gray-600">Avg Session</div>
                  <div className="font-medium text-gray-900">
                    {Math.floor(lang.averageSessionDuration / 60)}m {lang.averageSessionDuration % 60}s
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

interface ContentEngagementProps {
  engagement: ContentMetrics['contentEngagement'];
}

function ContentEngagement({ engagement }: ContentEngagementProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Engagement</h3>
      <div className="space-y-4">
        {engagement.map((content, index) => (
          <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                {content.contentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h4>
              <span className="text-2xl">📊</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-700">{content.interactions.toLocaleString()}</div>
                <div className="text-sm text-blue-600">Interactions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-700">{(content.shareRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-blue-600">Share Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-700">{(content.commentRate * 100).toFixed(1)}%</div>
                <div className="text-sm text-blue-600">Comment Rate</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ContentPerformanceDashboard() {
  const [metrics, setMetrics] = useState<ContentMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  useEffect(() => {
    trackDashboardView('content_performance');
    
    // In a real implementation, this would fetch from your analytics API
    const data = generateMockDashboardData();
    setMetrics(data.content);
    setLoading(false);
  }, [selectedTimeRange]);

  const handleViewBlogDetails = (slug: string) => {
    trackDashboardInteraction('view_blog_details', 'content_performance', slug);
    // In a real implementation, this would navigate to detailed blog analytics
    console.log('View blog details:', slug);
  };

  const handleExportData = () => {
    trackDashboardInteraction('export', 'content_performance');
    // In a real implementation, this would export the data
    console.log('Export content performance data');
  };

  if (loading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Content Performance</h2>
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={handleExportData}
            className="px-4 py-2 bg-coria-green text-white rounded-md hover:bg-coria-green/90 transition-colors"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Blog Posts Performance */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Posts</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metrics.blogPosts.map((post, index) => (
            <BlogPostCard
              key={index}
              post={post}
              onViewDetails={handleViewBlogDetails}
            />
          ))}
        </div>
      </div>

      {/* Feature Pages Performance */}
      <FeaturePageTable features={metrics.featurePages} />

      {/* Language and Engagement Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LanguagePerformance languages={metrics.languagePerformance} />
        <ContentEngagement engagement={metrics.contentEngagement} />
      </div>

      {/* Content Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {metrics.blogPosts.reduce((sum, post) => sum + post.views, 0).toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Total Blog Views</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {(metrics.blogPosts.reduce((sum, post) => sum + post.engagementRate, 0) / metrics.blogPosts.length * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-blue-600">Avg Engagement Rate</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">
              {metrics.blogPosts.reduce((sum, post) => sum + post.socialShares, 0)}
            </div>
            <div className="text-sm text-purple-600">Total Social Shares</div>
          </div>
        </div>
      </Card>
    </div>
  );
}