const CACHE_NAME = 'fresco-futasis-pwa-v3';
const urlsToCache = [
    '/',
    '/index-single.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/service-worker.js'
];

// Düzenli aralıklarla yeni içerik kontrolü için değişken
const CHECK_INTERVAL = 30000; // 30 saniyede bir kontrol et (daha sık)

// Install a service worker
self.addEventListener('install', event => {
    console.log('Service Worker yükleniyor...');
    
    // Yeni service worker'ın hemen aktif olmasını sağla
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache açıldı');
                return cache.addAll(urlsToCache);
            })
    );
});

// Cache and return requests
self.addEventListener('fetch', event => {
    // Network-first stratejisi - önce ağdan getir, başarısız olursa cache'den al
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Yanıtı klonla
                const clonedResponse = networkResponse.clone();
                
                // Cache'i güncelle
                if (networkResponse.status === 200 && networkResponse.type === 'basic') {
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clonedResponse);
                    });
                    
                    // Ana sayfa veya index sayfasında içerik değişikliği varsa sayfayı yenile
                    if (event.request.url.includes('index-single.html') || event.request.url.endsWith('/')) {
                        checkForContentUpdateAndReload(event.request, networkResponse);
                    }
                }
                return networkResponse;
            })
            .catch(() => {
                // Ağ erişimi başarısız olursa cache'den al
                return caches.match(event.request);
            })
    );
});

// İçerik güncellemelerini kontrol eden ve sayfayı otomatik yenileyen fonksiyon
function checkForContentUpdateAndReload(request, networkResponse) {
    caches.match(request).then(cachedResponse => {
        if (!cachedResponse) return; // Cache'de yok, karşılaştırma yapılamaz
        
        Promise.all([cachedResponse.clone().text(), networkResponse.clone().text()])
            .then(([cachedText, networkText]) => {
                if (cachedText !== networkText) {
                    console.log('Yeni içerik tespit edildi! Sayfayı otomatik yeniliyorum...');
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            // Yeni içerik algılanınca sayfayı doğrudan yenile
                            if (client.url.includes(request.url)) {
                                client.navigate(client.url);
                            }
                        });
                    });
                }
            });
    });
}

// Update a service worker
self.addEventListener('activate', event => {
    console.log('Service Worker etkinleştiriliyor...');
    
    // Yeni service worker'ın tüm açık sekmeleri kontrol etmesini sağla
    event.waitUntil(self.clients.claim());
    
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Eski cache siliniyor:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Düzenli aralıklarla güncelleme kontrolü
setInterval(() => {
    self.registration.update();
    console.log('Otomatik güncelleme kontrolü yapıldı.');
}, CHECK_INTERVAL); 