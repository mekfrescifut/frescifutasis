# Fresco Futasis PWA

Basit bir tarayıcı üzerinden yüklenebilir Progressive Web App (PWA) örneği.

## Özellikler

- Tarayıcı üzerinden kurulabilir
- Çevrimdışı çalışabilir
- Responsive tasarım
- Hızlı erişim

## Nasıl Kurulur

1. Bu uygulamayı bir web sunucusunda (yerel veya internet üzerinde) host edin
2. Tarayıcınızla uygulamaya erişin
3. Chrome, Edge veya diğer modern tarayıcılarda adres çubuğunun sağındaki "Yükle" veya "Ana Ekrana Ekle" seçeneğine tıklayın
4. Uygulamayı yükleyin ve ana ekranınızdan erişin

## Yerel Ortamda Çalıştırma

Uygulamayı yerel ortamda test etmek için basit bir HTTP sunucusu kullanabilirsiniz:

```bash
# Python 3 ile
python -m http.server 8000

# Veya Node.js ile
npx serve
```

Sonra tarayıcınızda http://localhost:8000 adresine giderek uygulamaya erişebilirsiniz.

## PWA Gereksinimleri

Bu uygulama şu PWA gereksinimlerini karşılar:

- HTTPS üzerinden sunulmalıdır (yerel geliştirme için localhost istisnadır)
- Web uygulaması manifestine sahiptir
- Service worker kullanır
- Responsive tasarıma sahiptir

## Not

Chrome veya Edge tarayıcıları en iyi PWA deneyimini sağlar. 