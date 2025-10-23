# 🚀 Mobil Uygulama Kurulum Rehberi

## ⚠️ ÖNEMLİ: İlk Kurulum Adımları

### 1. NPM Cache Sorununu Çöz

Terminalini aç ve şu komutları **sırayla** çalıştır:

```bash
# NPM cache iznini düzelt
sudo chown -R 501:20 "/Users/bayramdkmn/.npm"

# Cache'i temizle
npm cache clean --force
```

### 2. Projeye Git

```bash
cd /Users/bayramdkmn/Desktop/sampa_intern_eCom/mobil
```

### 3. Bağımlılıkları Kur

```bash
npm install --legacy-peer-deps
```

**NOT:** `--legacy-peer-deps` bayrağı peer dependency uyarılarını bypass eder ve kurulumu sorunsuz tamamlar.

### 4. Backend'i Başlat

**Yeni bir terminal penceresi aç** ve Django backend'i başlat:

```bash
cd /path/to/django/backend
python manage.py runserver 8000
```

Backend'in `http://127.0.0.1:8000` adresinde çalıştığından emin ol.

### 5. Mobil Uygulamayı Başlat

İlk terminalde (mobil proje klasöründe):

```bash
npx expo start -c
```

`-c` bayrağı cache'i temizler ve temiz bir başlangıç yapar.

---

## 📱 Uygulamayı Aç

### iOS Simülatör

Terminalde **`i`** tuşuna bas. Xcode'un yüklü olması gerekir.

### Android Emülatör

Terminalde **`a`** tuşuna bas. Android Studio'nun yüklü olması gerekir.

### Fiziksel Cihaz (Expo Go)

1. App Store (iOS) veya Play Store (Android) üzerinden **Expo Go** uygulamasını indir
2. Terminaldeki QR kodu tara
3. Uygulama cihazında açılacak

---

## ✅ Backend Entegrasyonu Testi

### 1. Kayıt Ol

- "Kayıt Ol" butonuna tıkla
- Ad Soyad: `Ahmet Yılmaz`
- E-posta: `ahmet@example.com`
- Şifre: `123456`
- Şifre Tekrar: `123456`
- "Kayıt Ol" butonuna tıkla

**Beklenen:** Backend'e kayıt isteği gider, başarılı olursa hoşgeldin ekranı açılır.

### 2. Giriş Yap

- "Giriş Yap" butonuna tıkla
- E-posta: Kayıt olduğun e-posta
- Şifre: Kayıt olduğun şifre
- "Giriş Yap" butonuna tıkla

**Beklenen:** Token alınır, ana sayfaya yönlendirilir ve ürünler backend'den yüklenir.

### 3. Ürünleri Kontrol Et

Ana sayfada "Öne Çıkan Ürünler" bölümünde backend'den gelen ürünler görünmeli.

**Eğer ürün yoksa:**
- Django admin'e gir: `http://127.0.0.1:8000/admin`
- Products bölümünden test ürünleri ekle
- Mobil uygulamayı yenile (Terminalde `r` tuşuna bas)

---

## 🔧 Sorun Giderme

### "axios could not be found"

```bash
cd /Users/bayramdkmn/Desktop/sampa_intern_eCom/mobil
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### "Network Error" / Backend'e Bağlanamıyor

**iOS için:**
1. `ios/Runner/Info.plist` dosyasını aç
2. Şunu ekle:
```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>
```

**Android için:**
1. `android/app/src/main/AndroidManifest.xml` dosyasını aç
2. `<application>` tag'ine şunu ekle:
```xml
android:usesCleartextTraffic="true"
```

### Backend'in Çalıştığını Kontrol Et

```bash
curl http://127.0.0.1:8000/api/products/products/
```

Ürün listesi dönüyorsa backend çalışıyor demektir.

### Metro Cache Temizle

```bash
# Terminal 1 - Metro server'ı durdur (Ctrl+C)

# Cache'leri temizle
rm -rf $TMPDIR/metro-* $TMPDIR/haste-map-*
watchman watch-del-all

# Yeniden başlat
npx expo start -c
```

---

## 📂 Proje Yapısı

```
mobil/
├── src/
│   ├── services/
│   │   └── api.ts              # API Client (Web'dekinin aynısı)
│   ├── store/
│   │   ├── authStore.ts        # ✅ Backend'e bağlı
│   │   ├── productStore.ts     # ✅ Backend'e bağlı
│   │   ├── cartStore.ts        # ✅ Backend'e bağlı
│   │   ├── addressStore.ts     # ✅ Backend'e bağlı
│   │   ├── paymentStore.ts     # ✅ Backend'e bağlı
│   │   └── orderStore.ts       # ✅ Backend'e bağlı
│   ├── screens/
│   │   ├── LoginScreen.tsx     # ✅ Backend'e bağlı
│   │   ├── RegisterScreen.tsx  # ✅ Backend'e bağlı
│   │   └── HomeScreen.tsx      # ✅ Backend'den ürün çekiyor
│   ├── types/
│   │   └── api.ts              # Backend type tanımları
│   ├── config/
│   │   └── api.ts              # API endpoints
│   └── utils/
│       └── storage.ts          # AsyncStorage helpers
├── BACKEND_INTEGRATION.md      # Detaylı dokümantasyon
└── KURULUM.md                  # Bu dosya
```

---

## 🎯 Backend API Endpoints

```
BASE_URL: http://127.0.0.1:8000/api

Auth:
  POST   /users/register/
  POST   /users/login/
  POST   /users/logout/
  POST   /users/refresh/

User:
  GET    /users/me/
  PATCH  /users/me/

Products:
  GET    /products/products/
  GET    /products/products/{id}/

Cart:
  GET    /cart/
  POST   /cart/add/
  PUT    /cart/update/
  DELETE /cart/remove/

Orders:
  GET    /orders/my-orders/
  POST   /orders/
  GET    /orders/{id}/

Addresses:
  GET    /users/addresses/
  POST   /users/addresses/
  PATCH  /users/addresses/{id}/
  DELETE /users/addresses/{id}/

Cards:
  GET    /users/cards/
  POST   /users/cards/
  PATCH  /users/cards/{id}/
  DELETE /users/cards/{id}/
```

---

## 💡 Kullanım Örnekleri

### Login

```typescript
import { useAuthStore } from '@/store/authStore';

const { login, isLoading, error } = useAuthStore();

await login('user@example.com', 'password123');
// Token otomatik kaydedilir, user state güncellenir
```

### Ürün Listesi

```typescript
import { useProductStore } from '@/store/productStore';

const { products, fetchProducts, isLoading } = useProductStore();

useEffect(() => {
  fetchProducts(); // Backend'den ürünleri çek
}, []);
```

### Sepete Ekle

```typescript
import { useCartStore } from '@/store/cartStore';

const { addToCart } = useCartStore();

await addToCart(product, 1, 'red', 'M');
// Offline-first: Önce local'e ekler, sonra backend'e gönderir
```

---

## 📚 Daha Fazla Bilgi

Detaylı API kullanımı ve örnekler için: **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)**

---

## ✅ Kurulum Checklist

- [ ] NPM cache izin sorunu çözüldü (`sudo chown`)
- [ ] Bağımlılıklar kuruldu (`npm install --legacy-peer-deps`)
- [ ] Django backend çalışıyor (`python manage.py runserver 8000`)
- [ ] Mobil uygulama başlatıldı (`npx expo start -c`)
- [ ] Login/Register test edildi
- [ ] Ürünler backend'den geliyor
- [ ] Console'da API istekleri görünüyor

---

**🎉 Kurulum tamamlandı! Başarılı geliştirmeler!**

