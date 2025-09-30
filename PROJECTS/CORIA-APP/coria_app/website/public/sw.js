const CACHE_VERSION = 'v2';
const STATIC_CACHE = `coria-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `coria-dynamic-${CACHE_VERSION}`;
const API_CACHE = `coria-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `coria-images-${CACHE_VERSION}`;

// Cache durations (in milliseconds)
const CACHE_DURATIONS = {
  STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
  DYNAMIC: 7 * 24 * 60 * 60 * 1000,  // 7 days
  API: 60 * 60 * 1000,               // 1 hour
  IMAGES: 30 * 24 * 60 * 60 * 1000,  // 30 days
};

// Static assets to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Static assets cached, skipping waiting');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheName.includes(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Claim all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests (except for fonts and images from CDNs)
  if (!url.origin.includes(self.location.origin) && !isCDNResource(url)) {
    return;
  }

  // Route requests to appropriate caching strategy
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (isImageRequest(url)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isAPIRequest(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (isPageRequest(url)) {
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  } else {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  }
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Check out new sustainable products and tips!',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icon-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-close.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.title = data.title || 'CORIA';
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('CORIA', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Caching strategies
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse && !isExpired(cachedResponse, CACHE_DURATIONS.STATIC)) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network first failed, falling back to cache:', error);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Network failed, return cached version if available
    return cachedResponse;
  });

  return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(url) {
  return url.pathname.includes('/_next/static/') ||
         url.pathname.match(/\.(js|css|woff|woff2|ttf|eot)$/) ||
         url.pathname === '/manifest.json' ||
         url.pathname === '/favicon.ico';
}

function isImageRequest(url) {
  return url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/);
}

function isAPIRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isPageRequest(url) {
  return url.pathname.match(/^\/(tr|en|de|fr)?(\/.*)?$/) && 
         !url.pathname.includes('.') &&
         url.pathname !== '/offline.html';
}

function isCDNResource(url) {
  const cdnDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'cdn.jsdelivr.net',
    'unpkg.com'
  ];
  return cdnDomains.some(domain => url.hostname.includes(domain));
}

function isExpired(response, maxAge) {
  const dateHeader = response.headers.get('date');
  if (!dateHeader) return true;
  
  const responseDate = new Date(dateHeader);
  const now = new Date();
  return (now.getTime() - responseDate.getTime()) > maxAge;
}

async function doBackgroundSync() {
  // Implement background sync logic here
  // For example, sync offline form submissions, analytics data, etc.
  console.log('[SW] Performing background sync');
  
  try {
    // Example: sync offline analytics
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
      await clearOfflineData();
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function getOfflineData() {
  // Get offline data from IndexedDB or localStorage
  return [];
}

async function syncOfflineData(data) {
  // Sync data with server
  console.log('[SW] Syncing offline data:', data);
}

async function clearOfflineData() {
  // Clear synced offline data
  console.log('[SW] Clearing offline data');
}