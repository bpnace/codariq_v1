// Simple service worker for static asset caching
const CACHE_NAME = 'codariq-v1';
const urlsToCache = [
  '/',
  '/fonts/Switzer-Variable.woff2',
  '/codariq_logo2.png',
  '/codariq_logo3.png',
  '/images/hero/hero1.webp',
  '/images/badges/climate-friendly.webp',
  '/images/badges/gdpr-ready.webp',
  '/images/badges/remote-only.webp',
];

// Install event - cache static assets
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', function (event) {
  // Only cache GET requests and same-origin requests
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Skip Calendly and analytics requests
  if (
    event.request.url.includes('calendly.com') ||
    event.request.url.includes('analytics') ||
    event.request.url.includes('plausible')
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (response) {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
