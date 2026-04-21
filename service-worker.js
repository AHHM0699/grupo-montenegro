const CACHE_NAME = 'grupo-montenegro-v4';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './images/logo-holding.png',
    './images/logo-liliana.png',
    './images/logo-odoncito.png',
    './images/logo-cheplas.png',
    './images/logo-entregas.png',
    './images/logo-programa-caja.png',
    './images/logo-promsg.png'
];

// Instalar Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activar Service Worker
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName !== CACHE_NAME;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// Interceptar peticiones
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});
