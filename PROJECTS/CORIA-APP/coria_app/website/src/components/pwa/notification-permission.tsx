'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Bell, X } from 'lucide-react';
import { usePWA } from '@/lib/pwa';
import { MobileButton } from '@/components/ui/mobile-button';
import { cn } from '@/lib/utils';

interface NotificationPermissionProps {
  className?: string;
}

export function NotificationPermission({ className }: NotificationPermissionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const t = useTranslations('pwa');
  const pwa = usePWA();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.localStorage.getItem('notification-permission-dismissed')) {
      setIsDismissed(true);
      return;
    }

    if ('Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 10000);

      return () => clearTimeout(timer);
    }

    return undefined;
  }, []);

  const handleAllow = async () => {
    setIsRequesting(true);
    
    try {
      const result = await pwa.requestNotificationPermission();
      if (result.permission === 'granted') {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Notification permission failed:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('notification-permission-dismissed', 'true');
    }
  };

  if (isDismissed) {
    return null;
  }

  if (typeof window !== 'undefined') {
    if (!('Notification' in window) || Notification.permission !== 'default') {
      return null;
    }
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 z-40',
        'bg-white dark:bg-gray-800 rounded-lg shadow-lg border',
        'p-4 safe-area-bottom',
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <Bell className="h-5 w-5 text-coria-primary mt-0.5" />
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold">
            {t('notifications.title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t('notifications.description')}
          </p>
          
          <div className="flex space-x-2 mt-3">
            <MobileButton
              onClick={handleAllow}
              loading={isRequesting}
              variant="primary"
              size="sm"
            >
              {t('notifications.allow')}
            </MobileButton>
            
            <button
              onClick={handleDismiss}
              className="text-sm text-gray-500 px-3 py-2"
            >
              {t('notifications.dismiss')}
            </button>
          </div>
        </div>
        
        <button onClick={handleDismiss}>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}