const CACHE_NAME = 'wings-cache-v' + new Date().getTime(); // Version changes with every update
const FILES_TO_CACHE = [
    '/',                // Root
    '/index.html',      // Main page
    '/Styles/middle-pane.css',  // Styles
    '/Styles/left-pane.css', // More styles
    '/Styles/right-pane.css',
    '/Styles/Retail-General.css',
    '/Styles/reaction.css', //Main script
    '/Scripts/view.js',  
    '/Scripts/comment.js', 
    '/Scripts/blockicondownload.js',
    '/pics/angle.svg',       // Logo
    '/pics/bell.svg',
    '/pics/bookmark.svg',
    '/pics/bounce.svg',
    '/pics/comment.svg',
    '/pics/dots.svg',
    '/pics/envelope.svg',
    '/pics/home.svg',
    '/pics/logo.png',
    '/pics/retweet.svg',
    '/pics/search.svg',
    '/pics/share.svg',
    '/pics/stats.svg',
    '/pics/talk.svg',
    '/pics/up.svg',
    '/pics/very.svg',// Logo
// Another script
];

// Install event - Cache all necessary files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting(); // Activate immediately
});

// Activate event - Remove old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Apply changes immediately
});

// Fetch event - Always check for updates
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                return caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, response.clone());
                    return response;
                });
            })
            .catch(() => caches.match(event.request))
    );
});