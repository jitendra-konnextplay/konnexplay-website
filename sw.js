/**
 * Service worker: make a refresh mean a refresh.
 *
 * GitHub Pages tells browsers to hold every file for ten minutes and there is
 * no way to change that header on Pages. So a change could be live on the
 * server while a plain refresh kept showing the old page. That has caused real
 * confusion more than once: a fix was reported as not working when it was
 * already published.
 *
 * The strategy is split, because the two kinds of file want opposite things:
 *
 *   Pages (the document and the .dc.html files)  -> network first.
 *     Always ask the server. Fall back to the cached copy only when the
 *     network fails, so the site still opens with no signal.
 *
 *   Versioned assets (anything with ?v= in the URL) -> cache first.
 *     Their URL changes whenever their contents change, so a cached copy can
 *     never be stale. This keeps repeat visits fast.
 *
 * Everything else is left alone and goes straight to the network.
 */

/* Bumping this name throws away everything the previous worker had stored,
   which is the quickest way to be sure no page from before a change survives. */
var CACHE = 'kx-v2';

self.addEventListener('install', function (e) {
  // Take over straight away rather than waiting for every tab to close.
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys.map(function (k) {
            if (k !== CACHE) return caches.delete(k);
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

function isPage(url, req) {
  if (req.mode === 'navigate') return true;
  return /\.html($|\?)/.test(url.pathname + url.search) || url.pathname.endsWith('/');
}

function isVersionedAsset(url) {
  return url.searchParams.has('v');
}

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;

  var url;
  try {
    url = new URL(req.url);
  } catch (err) {
    return;
  }
  if (url.origin !== self.location.origin) return; // third parties: not ours

  /* The settings panel is password protected by the server. A navigation this
     worker fetches on the page's behalf never reaches the browser's own login
     prompt, so the visitor was shown a bare 401 with no way to answer it.
     Anything under /admin is left to the browser, which knows how to ask. */
  if (/(^|\/)admin(\/|$)/.test(url.pathname)) return;

  // Never cache the version file: it is how the page learns it is out of date.
  if (url.pathname.endsWith('version.json')) return;

  if (isPage(url, req)) {
    /* Going to the network is not enough on its own. GitHub Pages tells the
       browser to hold every file for ten minutes, and a plain fetch is served
       out of that same store, so a refresh could still hand back the page from
       before the change. Asking for the page with cache: reload skips the
       browser's copy and goes to the server, which is what a refresh is meant
       to do. It cannot be done by passing the original Request through, since a
       navigation Request cannot be rebuilt, so the URL is refetched instead. */
    var live;
    try {
      live = fetch(url.href, { cache: 'reload', credentials: 'same-origin' });
    } catch (err) {
      live = fetch(req);
    }
    e.respondWith(
      live
        .then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        })
        .catch(function () {
          return caches.match(req).then(function (hit) {
            return hit || caches.match('./index.html');
          });
        })
    );
    return;
  }

  if (isVersionedAsset(url)) {
    e.respondWith(
      caches.match(req).then(function (hit) {
        if (hit) return hit;
        return fetch(req).then(function (res) {
          if (res && res.ok) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(req, copy); });
          }
          return res;
        });
      })
    );
  }
});

/* The page can ask for a clean slate, which the admin panel uses after
   publishing so the owner never has to think about caching at all. */
self.addEventListener('message', function (e) {
  if (e.data === 'kx-clear-cache') {
    caches.delete(CACHE);
  }
});
