const CACHE_NAME = 'fresco-futasis-pwa-v2';
const urlsToCache = [
    '/',
    '/index-single.html',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/service-worker.js'
];

// Düzenli aralıklarla yeni içerik kontrolü için değişken
const CHECK_INTERVAL = 60000; // 60 saniyede bir kontrol et

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
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    // Ancak aynı zamanda ağdan da kontrol et ve cache'i güncelle (Cache-then-Network stratejisi)
                    const fetchPromise = fetch(event.request).then(
                        networkResponse => {
                            // Geçerli yanıt aldığımızdan emin olun
                            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                                const responseToCache = networkResponse.clone();
                                caches.open(CACHE_NAME).then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                                
                                // İndex sayfası ise ve içerik değiştiyse, istemciye bildir
                                if (event.request.url.includes('index-single.html') || event.request.url.endsWith('/')) {
                                    checkForContentUpdate(response, networkResponse);
                                }
                            }
                            return networkResponse;
                        }
                    ).catch(error => {
                        console.log('Fetch başarısız:', error);
                        return response;
                    });
                    
                    // Önce önbellekten cevap ver, ama arka planda güncelleme için fetch et
                    return response;
                }
                
                // Cache hit yok - ağdan getir
                return fetch(event.request).then(
                    response => {
                        // Geçerli yanıt aldığımızdan emin olun
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Yanıtı klonla
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

// İçerik güncellemelerini kontrol eden fonksiyon
function checkForContentUpdate(cachedResponse, networkResponse) {
    Promise.all([cachedResponse.clone().text(), networkResponse.clone().text()])
        .then(([cachedText, networkText]) => {
            if (cachedText !== networkText) {
                console.log('Yeni içerik tespit edildi! Sayfayı yenileme bildirimi gönderiliyor...');
                self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                        client.postMessage({
                            type: 'CONTENT_UPDATED',
                            message: 'Yeni içerik mevcut. Sayfayı yenilemek için tıklayın.'
                        });
                    });
                });
            }
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

// Düzenli aralıklarla yeni içerik kontrolü
self.addEventListener('message', event => {
    if (event.data === 'CHECK_UPDATES') {
        console.log('Güncellemeler kontrol ediliyor...');
        self.registration.update();
    }
});

// Otomatik güncelleme zamanlatıcısı
setInterval(() => {
    self.registration.update();
    console.log('Otomatik güncelleme kontrolü yapıldı.');
}, CHECK_INTERVAL); 