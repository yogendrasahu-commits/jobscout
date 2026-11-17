// JobScout Enterprise Mobile Service Worker v2.0.0
const CACHE_NAME = 'jobscout-cache-v2.0.0';

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
          if (key !== CACHE_NAME) {
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
// 1. /api, /socket.io, /download, /downloads: ALWAYS Network-Only (Never cache dynamic data)
// 2. Navigation (HTML): Network-First with cache update + offline fallback to index.html
// 3. Static Assets (/assets, images, icons): Stale-While-Revalidate with automatic cache refresh
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Never intercept API routes, real-time WebSockets, or file download endpoints
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/socket.io') ||
    url.pathname.startsWith('/download') ||
    url.pathname.startsWith('/downloads') ||
    url.pathname.startsWith('/upload')
  ) {
    return;
  }

  // 1. Navigation requests (SPA pages): Network-First
  // Ensures user always gets the freshest index.html with up-to-date JS chunk hashes
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
          return cachedIndex || new Response(
            '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>JobScout Offline</title><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="font-family:sans-serif;text-align:center;padding:40px 20px;background:#0f172a;color:#fff;"><h2>📡 Offline Mode</h2><p>Please check your internet connection to continue browsing JobScout.</p><button onclick="location.reload()" style="background:#4f46e5;color:#fff;border:none;padding:12px 24px;border-radius:12px;font-weight:bold;margin-top:16px;cursor:pointer;">Retry</button></body></html>',
            { status: 503, headers: { 'Content-Type': 'text/html' } }
          );
        })
    );
    return;
  }

  // 2. Static Assets (JS, CSS, Images, Fonts): Cache-First with Background Update
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
