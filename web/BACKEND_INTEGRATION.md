# Django Backend Entegrasyonu

Bu dokümantasyon, Next.js frontend'inin Django backend'i ile nasıl entegre edildiğini açıklar.

## API Endpoints

Frontend aşağıdaki Django API endpoint'lerini kullanır:

### Authentication Endpoints
- `POST /api/users/register` - Kullanıcı kaydı
- `POST /api/users/login` - Kullanıcı girişi
- `POST /api/users/logout/` - Kullanıcı çıkışı
- `POST /api/auth/refresh/` - Token yenileme

## Register API Format

### Request Format
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

### Response Format
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "first_name": "string (optional)",
    "last_name": "string (optional)",
    "phone_number": "string (optional)",
    "profile_image": "string (optional)"
  },
  "access_token": "string",
  "refresh_token": "string"
}
```

## Login API Format

### Request Format
```json
{
  "username": "string",
  "password": "string"
}
```

### Response Format
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "first_name": "string (optional)",
    "last_name": "string (optional)",
    "phone_number": "string (optional)",
    "profile_image": "string (optional)"
  },
  "access_token": "string",
  "refresh_token": "string"
}
```

## Django Backend Gereksinimleri

Django backend'inizde aşağıdaki yapılandırmaların bulunması gerekir:

### 1. CORS Ayarları
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Next.js dev server
]

CORS_ALLOW_CREDENTIALS = True
```

### 2. API URL Yapılandırması
- Backend URL: `http://localhost:8000/api`
- Frontend bu URL'yi `NEXT_PUBLIC_API_URL` environment variable'ından alır

### 3. Authentication Backend
- JWT token tabanlı authentication
- Access token ve refresh token döndürmeli
- Token'ları localStorage'da saklar

## Test Etme

### 1. Django Backend'i Başlatın
```bash
cd /path/to/django/backend
python manage.py runserver 8000
```

### 2. Next.js Frontend'i Başlatın
```bash
cd /Users/bayramdkmn/Desktop/Sampa/web
npm run dev
```

### 3. Test Sayfasına Gidin
- `http://localhost:3000/signup` adresine gidin
- Sağ alt köşedeki test butonunu kullanın
- Console'da detaylı logları görün

### 4. Manuel Test
- Form alanlarını doldurun
- "Hesap Oluştur" butonuna tıklayın
- Başarılı kayıt sonrası ana sayfaya yönlendirileceksiniz

## Hata Ayıklama

### Yaygın Hatalar
1. **CORS Hatası**: Django'da CORS ayarlarını kontrol edin
2. **404 Hatası**: API URL'lerini kontrol edin
3. **500 Hatası**: Django backend loglarını kontrol edin
4. **Network Hatası**: Django server'ın çalıştığından emin olun

### Console Logları
- Browser console'da detaylı API istekleri görülebilir
- Network tab'ında HTTP isteklerini izleyebilirsiniz
- Test fonksiyonu `window.testRegister()` olarak global olarak kullanılabilir

## Environment Variables

`.env.local` dosyasında:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Dosya Yapısı

```
src/
├── config/
│   └── api.ts              # API endpoint'leri
├── services/
│   └── authService.ts      # Authentication servisi
├── components/
│   ├── SignupForm.tsx      # Güncellenmiş signup formu
│   └── BackendTestComponent.tsx  # Test komponenti
└── utils/
    └── testRegister.ts     # Test fonksiyonu
```
