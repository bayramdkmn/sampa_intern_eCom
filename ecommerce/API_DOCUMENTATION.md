# API Dokümantasyonu

## Kullanıcı Sistemi (Email Tabanlı)

### Kayıt Olma
```
POST /users/register/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "Ad",
    "last_name": "Soyad"
}
```

### Giriş Yapma
```
POST /users/login/
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password123"
}
```

## Ürün Filtreleme Sistemi

### Temel Ürün Listesi
```
GET /products/products/
```

### Arama
```
GET /products/products/?search=telefon
```

### Kategori Filtresi
```
GET /products/products/?category=1
```

### Marka Filtresi
```
GET /products/products/?brand=2
```

### Fiyat Aralığı
```
GET /products/products/?min_price=100&max_price=500
```

### Stokta Olan Ürünler
```
GET /products/products/?in_stock=true
```

### İndirimli Ürünler
```
GET /products/products/?on_sale=true
```

### Ana Sayfa Ürünleri
```
GET /products/products/?main_window=true
```

### Sıralama
```
GET /products/products/?ordering=price          # Fiyata göre artan
GET /products/products/?ordering=-price         # Fiyata göre azalan
GET /products/products/?ordering=name           # İsme göre A-Z
GET /products/products/?ordering=-name          # İsme göre Z-A
GET /products/products/?ordering=-rating_average # Puana göre azalan
```

### Kombine Filtreler
```
GET /products/products/?category=1&brand=2&min_price=100&max_price=500&in_stock=true&ordering=-rating_average
```

## Özel Endpoint'ler

### Filtreleme Seçenekleri
```
GET /products/products/filter_options/
```
Döner:
```json
{
    "categories": [
        {"id": 1, "name": "Elektronik"},
        {"id": 2, "name": "Giyim"}
    ],
    "brands": [
        {"id": 1, "name": "Samsung"},
        {"id": 2, "name": "Apple"}
    ],
    "price_range": {
        "min_price": 10.00,
        "max_price": 1000.00
    }
}
```

### Öne Çıkan Ürünler
```
GET /products/products/featured/
```

### İndirimli Ürünler
```
GET /products/products/on_sale/
```

### En Yüksek Puanlı Ürünler
```
GET /products/products/top_rated/
```

## Kategori ve Marka Endpoint'leri

### Kategoriler
```
GET /products/categories/
GET /products/categories/{id}/
GET /products/categories/{id}/products/  # Kategoriye ait ürünler
```

### Markalar
```
GET /products/brands/
GET /products/brands/{id}/
GET /products/brands/{id}/products/  # Markaya ait ürünler
```

## Ürün Detay ve Değerlendirme

### Ürün Detayı
```
GET /products/products/{id}/
```

### Ürün Değerlendirme
```
POST /products/products/{id}/rate/
Authorization: Bearer {token}
Content-Type: application/json

{
    "stars": 5
}
```

### Ürün Değerlendirmeleri
```
GET /products/products/{id}/ratings/
```

## Örnek Kullanım Senaryoları

### 1. Ana Sayfa İçin Ürünler
```
GET /products/products/featured/
```

### 2. Kategori Sayfası
```
GET /products/products/?category=1&ordering=-rating_average
```

### 3. Arama Sayfası
```
GET /products/products/?search=telefon&min_price=100&max_price=1000&in_stock=true
```

### 4. İndirim Sayfası
```
GET /products/products/on_sale/
```

### 5. En Popüler Ürünler
```
GET /products/products/top_rated/
```

## Hata Kodları

- `400 Bad Request`: Geçersiz parametreler
- `401 Unauthorized`: Kimlik doğrulama gerekli
- `404 Not Found`: Kaynak bulunamadı
- `500 Internal Server Error`: Sunucu hatası

## Notlar

- Tüm ürün endpoint'leri sadece aktif ürünleri döndürür (`isActive=True`)
- Filtreleme parametreleri birleştirilebilir
- Sıralama parametreleri `ordering` ile belirtilir
- Arama hem ürün adında hem açıklamada hem de kategori/marka adında yapılır
