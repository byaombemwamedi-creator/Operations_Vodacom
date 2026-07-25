// Créations et Opérations Vodacom - Service Worker (sw.js)
const CACHE_NAME = 'vodacom-creations-v100';
const urlsToCache = [
    './',
    './index.html',
    './Voda-logo.png',
    'https://cdn.tailwindcss.com'
];

// 1. Wakati wa Kusakinisha App (Install Event)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Vodacom Cache imefunguliwa kikamilifu');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
    );
});

// 2. Wakati wa Kuamilisha Service Worker (Activate Event)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Inafuta cache ya zamani:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Kudaka maombi yote (Fetch Event) - Stratejia ya Offline-First & Network Fallback
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then((networkResponse) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                }).catch(() => {
                    // Ikiwa mtandao umekata kabisa, rudisha index.html badala ya kuruhusu browser ilete error
                    if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});

