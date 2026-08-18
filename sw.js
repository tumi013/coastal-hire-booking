var CACHE_NAME = 'coastal-hire-v13';
var STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(function(err) {
                console.log('Cache error:', err);
            })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) {
                    return k !== CACHE_NAME;
                }).map(function(k) {
                    return caches.delete(k);
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    var url = event.request.url;

    if (event.request.method !== 'GET' ||
        url.indexOf('firebase') !== -1 ||
        url.indexOf('firebaseio.com') !== -1 ||
        url.indexOf('firebasedatabase.app') !== -1 ||
        url.indexOf('gstatic.com') !== -1 ||
        url.indexOf('googleapis.com') !== -1 ||
        url.indexOf('cdnjs.cloudflare.com') !== -1 ||
        url.indexOf('fontawesome') !== -1) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(function(response) {
                if (response && response.status === 200) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(function() {
                return caches.match(event.request)
                    .then(function(cached) {
                        if (cached) return cached;
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});
