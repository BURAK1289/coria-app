'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/icons/Icon';
import { usePWA } from '@/lib/pwa';
import { MobileButton } from '@/components/ui/mobile-button';
import { cn } from '@/lib/utils';
import { logger } from '@/lib/logger';

interface UpdateNotificationProps {
  className?: string;
}

export function UpdateNotification({ className }: UpdateNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const t = useTranslations('pwa');
  const pwa = usePWA();

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setIsVisible(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      await pwa.skipWaiting();
      // Page will reload automatically after update
    } catch (error) {
      logger.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-4 left-4 right-4 z-50',
        'bg-blue-50 border border-blue-200 rounded-lg',
        'p-4 safe-area-top',
        'animate-in slide-in-from-top-full duration-300',
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Icon name="refresh" size={20} className="text-blue-600" aria-hidden="true" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-blue-900">
            {t('update.title')}
          </h3>
          <p className="text-sm text-blue-700 mt-1">
            {t('update.description')}
          </p>
          
          <div className="flex items-center space-x-2 mt-3">
            <MobileButton
              onClick={handleUpdate}
              loading={isUpdating}
              disabled={isUpdating}
              variant="primary"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            >
              {isUpdating ? t('update.updating') : t('update.button')}
            </MobileButton>
            
            <button
              onClick={handleDismiss}
              className="text-sm text-blue-600 hover:text-blue-800 px-3 py-2"
            >
              {t('update.dismiss')}
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-blue-400 hover:text-blue-600"
          aria-label="Dismiss update notification"
        >
          <Icon name="close" size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}