var cacheName = 'OpenIndoor';
var filesToCache = [
    '/',
    '/index.html',
    'https://unpkg.com/maplibre-gl@2.1.6/dist/maplibre-gl.js',
    'https://unpkg.com/maplibre-gl@2.1.6/dist/maplibre-gl.css',
    'https://app.openindoor.io/openindoor.js'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
        })
    );
});

/* Serve cached content when offline */
self.addEventListener('fetch', function(e) {
    e.respondWith(
        caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
        })
    );
});