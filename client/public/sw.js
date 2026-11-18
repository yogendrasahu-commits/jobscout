// JobScout Enterprise Mobile Service Worker v2.2.0 (Offline-First Ready)
const CACHE_NAME = 'jobscout-cache-v2.2.0';
const API_CACHE_NAME = 'jobscout-api-cache-v2.2.0';

// Essential offline core shell
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
  '/jobscout-logo.png',
  '/jobscout-emblem.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png'
];

// Install Event: Cache core shell immediately and activate
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Pre-caching core assets notice:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Delete old caches and take control of all clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Message Event: Allow client app to trigger immediate skipWaiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// Fetch Event:
// 1. Read APIs (/api/jobs, /api/auth/seekers, /api/auth/employers, /api/posts, etc.): Stale-While-Revalidate with Offline Cache Fallback
// 2. Navigation (SPA Pages): Network-First with cache update + Offline Fallback to index.html
// 3. Static Assets (/assets, images, fonts): Cache-First with Background Update
// 4. Map Tiles (tile.openstreetmap.org): Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (mutations handled by Client Outbox Sync Engine)
  if (request.method !== 'GET') return;

  // Never intercept real-time WebSockets or binary file downloads
  if (
    url.pathname.startsWith('/socket.io') ||
    url.pathname.startsWith('/download') ||
    url.pathname.startsWith('/downloads') ||
    url.pathname.startsWith('/upload')
  ) {
    return;
  }

  // 1. Read APIs: Stale-While-Revalidate & Instant Offline Cache Serving
  if (
    url.pathname.startsWith('/api/jobs') ||
    url.pathname.startsWith('/api/auth/seekers') ||
    url.pathname.startsWith('/api/auth/employers') ||
    url.pathname.startsWith('/api/posts') ||
    url.pathname.startsWith('/api/discussions') ||
    url.pathname.startsWith('/api/auth/me') ||
    url.pathname.startsWith('/api/health')
  ) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (apiCache) => {
        const cachedResponse = await apiCache.match(request);

        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              apiCache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(async () => {
            // When network fails (Wi-Fi off), return cached response or fallback JSON
            if (cachedResponse) {
              return cachedResponse;
            }
            const cleanUrlMatch = await apiCache.match(url.pathname);
            if (cleanUrlMatch) return cleanUrlMatch;

            return new Response(JSON.stringify({ offline: true, message: 'Offline cache active' }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 2. Map Tiles (OpenStreetMap & CartoCDN): Cache-First with Network Refresh
  if (
    url.hostname.includes('tile.openstreetmap.org') || 
    url.hostname.includes('openstreetmap') ||
    url.hostname.includes('cartocdn.com')
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          // Transparent empty 204 response if tile fetch fails while offline
          return new Response('', { status: 204 });
        }
      })
    );
    return;
  }

  // 3. Navigation requests (SPA pages): Network-First with Cache fallback to index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', clone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE_NAME);
          const cachedIndex = await cache.match('/index.html') || await cache.match('/');
          if (cachedIndex) return cachedIndex;

          return new Response(
            '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>JobScout Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;text-align:center;padding:40px 20px;background:#0f172a;color:#fff;"><h2>📡 Offline Mode Active</h2><p>Viewing cached JobScout application shell.</p><button onclick="location.reload()" style="background:#4f46e5;color:#fff;border:none;padding:12px 24px;border-radius:12px;font-weight:bold;margin-top:16px;cursor:pointer;">Refresh</button></body></html>',
            { status: 200, headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 4. Static Assets (JS, CSS, Images, Fonts): Cache-First with Background Revalidation
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Push Notification Listener (Native Mobile PWA Notifications)
self.addEventListener('push', (event) => {
  let data = { title: 'JobScout Alert', body: 'You have a new update in JobScout.', icon: '/icons/icon-192x192.png' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    if (event.data) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || 'New job opportunity or real-time interview invitation.',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/favicon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'JobScout', options)
  );
});

// Notification Click Handler: Focus or open window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
