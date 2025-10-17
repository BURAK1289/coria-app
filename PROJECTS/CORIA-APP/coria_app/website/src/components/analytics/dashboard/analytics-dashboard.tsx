'use client';

/**
 * Main Analytics Dashboard Component
 * Combines all dashboard sections with navigation
 */

import { useState } from 'react';
import { OverviewMetricsDashboard } from './overview-metrics';
import { ConversionFunnelDashboard } from './conversion-funnel';
import { ContentPerformanceDashboard } from './content-performance';
import { ABTestResultsDashboard } from './ab-test-results';
import { trackDashboardInteraction } from '@/lib/analytics/dashboard-data';
import { TestimonialAnalyticsSvgIcon } from '@/components/icons/svg-icons';
import { Icon } from '@/components/icons/Icon';

type DashboardSection = 'overview' | 'conversions' | 'content' | 'ab-tests';

interface NavigationTabProps {
  id: DashboardSection;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: (id: DashboardSection) => void;
}

function NavigationTab({ id, label, icon, active, onClick }: NavigationTabProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        active 
          ? 'bg-coria-green text-white' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <span className="text-lg flex items-center justify-center">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

interface DashboardHeaderProps {
  currentSection: DashboardSection;
  onSectionChange: (section: DashboardSection) => void;
}

function DashboardHeader({ currentSection, onSectionChange }: DashboardHeaderProps) {
  const sections: Array<{
    id: DashboardSection;
    label: string;
    icon: React.ReactNode;
  }> = [
    { id: 'overview', label: 'Overview', icon: <TestimonialAnalyticsSvgIcon size={20} className="text-current" /> },
    { id: 'conversions', label: 'Conversions', icon: <Icon name="trending-up" size={20} className="text-current" aria-hidden="true" /> },
    { id: 'content', label: 'Content', icon: <Icon name="file-text" size={20} className="text-current" aria-hidden="true" /> },
    { id: 'ab-tests', label: 'A/B Tests', icon: <Icon name="flask" size={20} className="text-current" aria-hidden="true" /> },
  ];

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Monitor website performance and user behavior</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              {sections.map((section) => (
                <NavigationTab
                  key={section.id}
                  id={section.id}
                  label={section.label}
                  icon={section.icon}
                  active={currentSection === section.id}
                  onClick={onSectionChange}
                />
              ))}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface QuickStatsProps {
  currentSection: DashboardSection;
}

function QuickStats({ currentSection }: QuickStatsProps) {
  const getStatsForSection = (section: DashboardSection) => {
    switch (section) {
      case 'overview':
        return [
          { label: 'Total Visitors', value: '12.5K', change: '+12%', positive: true },
          { label: 'Page Views', value: '45.7K', change: '+8%', positive: true },
          { label: 'Bounce Rate', value: '34%', change: '-5%', positive: true },
          { label: 'Avg Session', value: '4m 5s', change: '+15%', positive: true },
        ];
      case 'conversions':
        return [
          { label: 'Conversion Rate', value: '7.8%', change: '+15%', positive: true },
          { label: 'App Downloads', value: '1.5K', change: '+22%', positive: true },
          { label: 'Form Submissions', value: '579', change: '+8%', positive: true },
          { label: 'Goal Completions', value: '1.9K', change: '+18%', positive: true },
        ];
      case 'content':
        return [
          { label: 'Blog Views', value: '4.2K', change: '+25%', positive: true },
          { label: 'Engagement Rate', value: '68%', change: '+12%', positive: true },
          { label: 'Social Shares', value: '423', change: '+35%', positive: true },
          { label: 'Time on Page', value: '3m 45s', change: '+8%', positive: true },
        ];
      case 'ab-tests':
        return [
          { label: 'Active Tests', value: '2', change: '0', positive: null },
          { label: 'Significant Results', value: '1', change: '+1', positive: true },
          { label: 'Conversion Lift', value: '+12%', change: '+5%', positive: true },
          { label: 'Users in Tests', value: '2.1K', change: '+15%', positive: true },
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForSection(currentSection);

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              {stat.change !== '0' && (
                <div className={`text-xs ${
                  stat.positive === true ? 'text-green-600' : 
                  stat.positive === false ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {stat.change}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  const [currentSection, setCurrentSection] = useState<DashboardSection>('overview');

  const handleSectionChange = (section: DashboardSection) => {
    setCurrentSection(section);
    trackDashboardInteraction('section_change', 'main_dashboard', section);
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'overview':
        return <OverviewMetricsDashboard />;
      case 'conversions':
        return <ConversionFunnelDashboard />;
      case 'content':
        return <ContentPerformanceDashboard />;
      case 'ab-tests':
        return <ABTestResultsDashboard />;
      default:
        return <OverviewMetricsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        currentSection={currentSection} 
        onSectionChange={handleSectionChange} 
      />
      
      <QuickStats currentSection={currentSection} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentSection()}
      </div>
      
      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Data retention: 90 days</span>
              <span>•</span>
              <span>Privacy compliant</span>
              <span>•</span>
              <button 
                onClick={() => trackDashboardInteraction('export_all', 'main_dashboard')}
                className="text-coria-green hover:text-coria-green/80"
              >
                Export All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}