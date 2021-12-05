// the cache version gets updated every time there is a new deployment
const CACHE_VERSION = 1.55;
const CURRENT_CACHE = `main-${CACHE_VERSION}`;

// these are the routes we are going to cache for offline support
const cacheFiles = ['/', '', 'manifest.webmanifest', 'favicon.png', 'favicon-16x16.png', 'models/ModeObject.js', 'fonts/AlfaSlabOne-Regular.ttf', 'images/icon512.png', 'images/icon192.png', 'images/icon180.png', 'images/icon120.png', 'models/ResultObject.js', 'fonts/BAUHS93.TTF', 'images/big_tent_logo.svg', 'helpers/vue.min.js', 'helpers/console-enhancer.js', 'styles/dropnstop.css', 'scripts/dropnstop.js', 'index.html'];

// on activation we clean up the previously registered service workers
self.addEventListener('activate', (evt) =>
  evt.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CURRENT_CACHE) {
            return caches.delete(cacheName);
          }
        }),
      );
    }),
  ),
);

// on install we download the routes we want to cache for offline
self.addEventListener('install', (evt) =>
  evt.waitUntil(
    caches.open(CURRENT_CACHE).then((cache) => {
      return cache.addAll(cacheFiles);
    }),
  ),
);

// fetch cache first, but use network if cache fails
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    }),
  );
});
