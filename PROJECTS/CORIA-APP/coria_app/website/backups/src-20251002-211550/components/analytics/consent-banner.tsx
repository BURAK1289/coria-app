'use client';

/**
 * Privacy-compliant consent banner
 * GDPR/KVKK compliant cookie consent management
 */

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  needsConsentBanner, 
  grantAllConsent, 
  denyOptionalConsent,
  saveConsentPreferences,
  getConsentPreferences 
} from '@/lib/analytics/consent';

export function ConsentBanner() {
  const t = useTranslations('consent');
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    setShowBanner(needsConsentBanner());
    
    const current = getConsentPreferences();
    setPreferences({
      analytics: current.analytics === 'granted',
      marketing: current.marketing === 'granted',
    });
  }, []);

  const handleAcceptAll = () => {
    grantAllConsent();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    denyOptionalConsent();
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    saveConsentPreferences({
      analytics: preferences.analytics ? 'granted' : 'denied',
      marketing: preferences.marketing ? 'granted' : 'denied',
    });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto p-4">
        {!showDetails ? (
          // Simple banner
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                {t('banner.message')}
                <button
                  onClick={() => setShowDetails(true)}
                  className="text-coria-green hover:underline ml-1"
                >
                  {t('banner.learnMore')}
                </button>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('banner.rejectAll')}
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 text-sm bg-coria-green text-white rounded-md hover:bg-coria-green/90 transition-colors"
              >
                {t('banner.acceptAll')}
              </button>
            </div>
          </div>
        ) : (
          // Detailed preferences
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {t('preferences.title')}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <p className="text-sm text-gray-600">
              {t('preferences.description')}
            </p>

            <div className="space-y-3">
              {/* Essential cookies - always on */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {t('preferences.essential.title')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('preferences.essential.description')}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {t('preferences.alwaysActive')}
                </div>
              </div>

              {/* Analytics cookies */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {t('preferences.analytics.title')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('preferences.analytics.description')}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      analytics: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coria-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coria-green"></div>
                </label>
              </div>

              {/* Marketing cookies */}
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {t('preferences.marketing.title')}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {t('preferences.marketing.description')}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences(prev => ({
                      ...prev,
                      marketing: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coria-green/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coria-green"></div>
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleRejectAll}
                className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                {t('preferences.rejectAll')}
              </button>
              <button
                onClick={handleSavePreferences}
                className="flex-1 px-4 py-2 text-sm bg-coria-green text-white rounded-md hover:bg-coria-green/90 transition-colors"
              >
                {t('preferences.savePreferences')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}