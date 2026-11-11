const CACHE_NAME = 'grupo-montenegro-v12';
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
    './images/logo-separaciones.png',
    './images/logo-asistencia.png'
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

// Interceptar peticiones:
// - Imágenes: primero la copia guardada (carga instantánea) y se actualiza por detrás.
// - Lo demás (la página): primero la red, para ver siempre lo último; la copia solo sin conexión.
self.addEventListener('fetch', function(event) {
    if (event.request.method !== 'GET') return;
    var url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;   // enlaces a otros programas: no se tocan

    if (event.request.destination === 'image') {
        event.respondWith(
            caches.open(CACHE_NAME).then(function(cache) {
                return cache.match(event.request).then(function(guardada) {
                    var deRed = fetch(event.request).then(function(response) {
                        if (response.ok) cache.put(event.request, response.clone());
                        return response;
                    }).catch(function() { return guardada; });
                    return guardada || deRed;
                });
            })
        );
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                if (response.ok) {
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
