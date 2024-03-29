// the cache version gets updated every time there is a new deployment
const CACHE_VERSION = '3.0.001';
const CURRENT_CACHE = `main-${CACHE_VERSION}`;

// prettier-ignore
// these are the routes we are going to cache for offline support
const cacheFiles = [
  '/', 
  '', 
  'fonts/Tektur.ttf', 
  'helpers/vue.min.js', 
  'helpers/console-enhancer.js', 
  'images/big_tent_logo.svg', 
  'models/ModeObject.js', 
  'models/ThemeObject.js', 
  'models/ResultObject.js', 
  'scripts/dropnstop.js', 
  'styles/dropnstop.css', 
  'index.html',
];

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
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CURRENT_CACHE).then((cache) => {
      // Go to the cache first
      return cache.match(event.request.url).then((cachedResponse) => {
        // Return a cached response if we have one
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise, hit the network
        return fetch(event.request).then((fetchedResponse) => {
          // Add the network response to the cache for later visits
          cache.put(event.request, fetchedResponse.clone());

          // Return the network response
          return fetchedResponse;
        });
      });
    }),
  );
});
