const CACHE_NAME = 'grupo-montenegro-v10';
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
    './images/logo-habitaciones.png',
    './images/logo-etiquetas.png',
    './images/logo-separaciones.png'
];

// Instalar Service Worker (sin esperar a que se cierre la app)
self.addEventListener('install', function(event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Cache abierto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Activar Service Worker y tomar control de las pestañas abiertas
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
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Interceptar peticiones: primero la red (para ver siempre lo último),
// y la copia guardada solo si no hay conexión
self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                if (response.ok && new URL(event.request.url).origin === self.location.origin) {
                    var copia = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, copia);
                    });
                }
                return response;
            })
            .catch(function() {
                return caches.match(event.request);
            })
    );
});
