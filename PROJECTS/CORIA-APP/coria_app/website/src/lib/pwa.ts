'use client';

// PWA utility functions for service worker and push notifications
import { logger } from './logger';

interface PWAInstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NotificationPermissionResult {
  permission: NotificationPermission;
  subscription?: PushSubscription;
}

class PWAManager {
  private deferredPrompt: PWAInstallPrompt | null = null;
  private swRegistration: ServiceWorkerRegistration | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private async init() {
    if (process.env.NODE_ENV !== 'production') {
      logger.info('[PWA] Service worker development modunda devre dışı bırakıldı');

      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
          logger.info('[PWA] Var olan servis worker kayıtları temizlendi');
        } catch (error) {
          logger.warn('[PWA] Servis worker temizleme başarısız:', error);
        }
      }

      return;
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      logger.info('[PWA] Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e as PWAInstallPrompt;
      this.dispatchInstallAvailable();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      logger.info('[PWA] App installed');
      this.deferredPrompt = null;
      this.dispatchAppInstalled();
    });

    // Register service worker
    await this.registerServiceWorker();
  }

  // Service Worker Registration
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }

    if (!('serviceWorker' in navigator)) {
      logger.warn('[PWA] Service workers not supported');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      logger.info('[PWA] Service worker registered:', registration);
      this.swRegistration = registration;

      // Check for updates
      registration.addEventListener('updatefound', () => {
        logger.info('[PWA] Service worker update found');
        const newWorker = registration.installing;

        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logger.info('[PWA] New service worker installed, update available');
              this.dispatchUpdateAvailable();
            }
          });
        }
      });

      return registration;
    } catch (error) {
      logger.error('[PWA] Service worker registration failed:', error);
      return null;
    }
  }

  // Update service worker
  async updateServiceWorker(): Promise<void> {
    if (!this.swRegistration) {
      logger.warn('[PWA] No service worker registration available');
      return;
    }

    try {
      await this.swRegistration.update();
      logger.info('[PWA] Service worker update triggered');
    } catch (error) {
      logger.error('[PWA] Service worker update failed:', error);
    }
  }

  // Skip waiting and activate new service worker
  async skipWaiting(): Promise<void> {
    if (!this.swRegistration || !this.swRegistration.waiting) {
      return;
    }

    this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    // Reload page after activation
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  // App Installation
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      logger.warn('[PWA] Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;

      logger.info('[PWA] Install prompt result:', choiceResult.outcome);
      this.deferredPrompt = null;

      return choiceResult.outcome === 'accepted';
    } catch (error) {
      logger.error('[PWA] Install prompt failed:', error);
      return false;
    }
  }

  isInstallAvailable(): boolean {
    return this.deferredPrompt !== null;
  }

  isInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true;
  }

  // Push Notifications
  async requestNotificationPermission(): Promise<NotificationPermissionResult> {
    if (!('Notification' in window)) {
      logger.warn('[PWA] Notifications not supported');
      return { permission: 'denied' };
    }

    if (!this.swRegistration) {
      logger.warn('[PWA] Service worker not registered');
      return { permission: 'denied' };
    }

    try {
      const permission = await Notification.requestPermission();
      logger.info('[PWA] Notification permission:', permission);

      if (permission === 'granted') {
        const subscription = await this.subscribeToPush();
        return { permission, subscription: subscription || undefined };
      }

      return { permission };
    } catch (error) {
      logger.error('[PWA] Notification permission request failed:', error);
      return { permission: 'denied' };
    }
  }

  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      logger.warn('[PWA] Service worker not registered');
      return null;
    }

    try {
      // You would need to replace this with your actual VAPID public key
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';

      if (!vapidPublicKey) {
        logger.warn('[PWA] VAPID public key not configured');
        return null;
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: new Uint8Array(this.urlBase64ToUint8Array(vapidPublicKey))
      });

      logger.info('[PWA] Push subscription created:', subscription);

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);

      return subscription;
    } catch (error) {
      logger.error('[PWA] Push subscription failed:', error);
      return null;
    }
  }

  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.swRegistration) {
      return false;
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        logger.info('[PWA] Push subscription removed');

        // Remove subscription from server
        await this.removeSubscriptionFromServer(subscription);

        return true;
      }

      return false;
    } catch (error) {
      logger.error('[PWA] Push unsubscription failed:', error);
      return false;
    }
  }

  // Background Sync
  async registerBackgroundSync(tag: string): Promise<void> {
    if (!this.swRegistration || !('sync' in this.swRegistration)) {
      logger.warn('[PWA] Background sync not supported');
      return;
    }

    try {
      await (this.swRegistration as any).sync.register(tag);
      logger.info('[PWA] Background sync registered:', tag);
    } catch (error) {
      logger.error('[PWA] Background sync registration failed:', error);
    }
  }

  // Offline Storage
  async cacheResource(url: string, cacheName: string = 'dynamic-cache'): Promise<void> {
    if (!('caches' in window)) {
      logger.warn('[PWA] Cache API not supported');
      return;
    }

    try {
      const cache = await caches.open(cacheName);
      await cache.add(url);
      logger.info('[PWA] Resource cached:', url);
    } catch (error) {
      logger.error('[PWA] Resource caching failed:', error);
    }
  }

  async getCachedResource(url: string): Promise<Response | null> {
    if (!('caches' in window)) {
      return null;
    }

    try {
      const response = await caches.match(url);
      return response || null;
    } catch (error) {
      logger.error('[PWA] Cache lookup failed:', error);
      return null;
    }
  }

  // Utility methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      logger.error('[PWA] Failed to send subscription to server:', error);
    }
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      logger.error('[PWA] Failed to remove subscription from server:', error);
    }
  }

  // Event dispatchers
  private dispatchInstallAvailable(): void {
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private dispatchAppInstalled(): void {
    window.dispatchEvent(new CustomEvent('pwa-app-installed'));
  }

  private dispatchUpdateAvailable(): void {
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }
}

// Singleton instance
export const pwaManager = new PWAManager();

interface UsePWAReturn {
  registerServiceWorker: () => Promise<ServiceWorkerRegistration | null>;
  updateServiceWorker: () => Promise<void>;
  skipWaiting: () => Promise<void>;
  showInstallPrompt: () => Promise<boolean>;
  isInstallAvailable: () => boolean;
  isInstalled: () => boolean;
  requestNotificationPermission: () => Promise<NotificationPermissionResult>;
  subscribeToPush: () => Promise<PushSubscription | null>;
  unsubscribeFromPush: () => Promise<boolean>;
  registerBackgroundSync: (tag: string) => Promise<void>;
  cacheResource: (url: string, cacheName?: string) => Promise<void>;
  getCachedResource: (url: string) => Promise<Response | null>;
}

// Hook for React components
export function usePWA(): UsePWAReturn {
  return {
    registerServiceWorker: () => pwaManager.registerServiceWorker(),
    updateServiceWorker: () => pwaManager.updateServiceWorker(),
    skipWaiting: () => pwaManager.skipWaiting(),
    showInstallPrompt: () => pwaManager.showInstallPrompt(),
    isInstallAvailable: () => pwaManager.isInstallAvailable(),
    isInstalled: () => pwaManager.isInstalled(),
    requestNotificationPermission: () => pwaManager.requestNotificationPermission(),
    subscribeToPush: () => pwaManager.subscribeToPush(),
    unsubscribeFromPush: () => pwaManager.unsubscribeFromPush(),
    registerBackgroundSync: (tag: string) => pwaManager.registerBackgroundSync(tag),
    cacheResource: (url: string, cacheName?: string) => pwaManager.cacheResource(url, cacheName),
    getCachedResource: (url: string) => pwaManager.getCachedResource(url),
  };
}
