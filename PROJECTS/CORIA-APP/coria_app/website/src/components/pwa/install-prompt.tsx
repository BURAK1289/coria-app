'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/lib/pwa';
import { MobileButton } from '@/components/ui/mobile-button';
import { cn } from '@/lib/utils';

interface InstallPromptProps {
  className?: string;
}

export function InstallPrompt({ className }: InstallPromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const t = useTranslations('pwa');
  const pwa = usePWA();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.sessionStorage.getItem('pwa-install-dismissed')) {
      setIsDismissed(true);
    }
  }, []);

  useEffect(() => {
    // Show prompt when install becomes available
    const handleInstallAvailable = () => {
      setIsVisible(true);
    };

    // Hide prompt when app is installed
    const handleAppInstalled = () => {
      setIsVisible(false);
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-app-installed', handleAppInstalled);

    // Check if install is already available
    if (pwa.isInstallAvailable()) {
      setIsVisible(true);
    }

    // Hide if already installed
    if (pwa.isInstalled()) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-app-installed', handleAppInstalled);
    };
  }, [pwa]);

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const accepted = await pwa.showInstallPrompt();
      if (accepted) {
        setIsVisible(false);
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  if (isDismissed) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed bottom-4 left-4 right-4 z-50',
        'bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700',
        'p-4 safe-area-bottom',
        'animate-in slide-in-from-bottom-full duration-300',
        className
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-coria-primary/10 rounded-lg flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-coria-primary" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {t('install.title')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {t('install.description')}
          </p>
          
          <div className="flex items-center space-x-2 mt-3">
            <MobileButton
              onClick={handleInstall}
              loading={isInstalling}
              disabled={isInstalling}
              variant="primary"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{t('install.button')}</span>
            </MobileButton>
            
            <button
              onClick={handleDismiss}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2"
            >
              {t('install.dismiss')}
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}