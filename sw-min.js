const CACHE_VERSION = '3.0.009',
  CURRENT_CACHE = 'main-3.0.009',
  cacheFiles = ['/', '', 'fonts/Tektur.ttf', 'helpers/vue.min.js', 'helpers/console-enhancer.js', 'images/big_tent_logo.svg', 'models/ModeObject.js', 'models/ThemeObject.js', 'models/ResultObject.js', 'scripts/dropnstop.js', 'styles/dropnstop.css', 'index.html'];
self.addEventListener('activate', (e) =>
  e.waitUntil(
    caches.keys().then((e) =>
      Promise.all(
        e.map((e) => {
          if (e !== CURRENT_CACHE) return caches.delete(e);
        }),
      ),
    ),
  ),
),
  self.addEventListener('install', (e) => e.waitUntil(caches.open(CURRENT_CACHE).then((e) => e.addAll(cacheFiles)))),
  self.addEventListener('fetch', (e) => {
    e.respondWith(caches.open(CURRENT_CACHE).then((s) => s.match(e.request.url).then((t) => t || fetch(e.request).then((t) => (s.put(e.request, t.clone()), t)))));
  });
