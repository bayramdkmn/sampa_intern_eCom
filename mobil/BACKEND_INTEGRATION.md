# 🚀 Mobil Backend Entegrasyonu Dokümantasyonu

Bu dokümantasyon, mobil uygulamanın Django backend'i ile nasıl entegre edildiğini açıklar.

## 📋 İçindekiler

- [Kurulum](#kurulum)
- [API Yapısı](#api-yapısı)
- [Store Kullanımı](#store-kullanımı)
- [Örnekler](#örnekler)
- [Hata Yönetimi](#hata-yönetimi)

---

## 🔧 Kurulum

### 1. Bağımlılıkları Yükle

```bash
cd /Users/bayramdkmn/Desktop/sampa_intern_eCom/mobil
npm install
```

### 2. Backend URL'i Ayarla

`src/config/api.ts` dosyasında backend URL'inizi güncelleyin:

```typescript
export const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Local
// export const API_BASE_URL = 'https://your-api.com/api'; // Production
```

### 3. Backend'i Başlat

```bash
cd /path/to/django/backend
python manage.py runserver 8000
```

### 4. Mobil Uygulamayı Başlat

```bash
npx expo start
```

---

## 📡 API Yapısı

### API Servisi

API servisi `src/services/api.ts` dosyasında tanımlıdır ve tüm backend isteklerini yönetir.

**Özellikler:**
- ✅ Otomatik JWT token yönetimi
- ✅ Token refresh mekanizması
- ✅ Request/Response interceptor'ları
- ✅ Hata yönetimi
- ✅ AsyncStorage ile token saklama

```typescript
import { apiService } from '@/services/api';

// Kullanım örneği
const products = await apiService.getProducts();
const user = await apiService.login({ email, password });
```

### Token Yönetimi

Token'lar AsyncStorage'da güvenli şekilde saklanır:

```typescript
import { tokenStorage } from '@/utils/storage';

// Token kaydet
await tokenStorage.setAccessToken(token);
await tokenStorage.setRefreshToken(refreshToken);

// Token al
const token = await tokenStorage.getAccessToken();

// Token'ları temizle
await tokenStorage.clearTokens();
```

---

## 🗄️ Store Kullanımı

Tüm store'lar Zustand ile yönetilir ve backend ile senkronize edilmiştir.

### AuthStore

**Kullanım:**

```typescript
import { useAuthStore } from '@/store/authStore';

function LoginScreen() {
  const { login, user, isLoading, error } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      // Başarılı - user otomatik güncellendi
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <View>
      {isLoading && <ActivityIndicator />}
      {error && <Text>{error}</Text>}
      {user && <Text>Hoşgeldin {user.name}</Text>}
    </View>
  );
}
```

**Metodlar:**
- `login(email, password)` - Kullanıcı girişi
- `register(firstName, lastName, email, password)` - Yeni kullanıcı kaydı
- `logout()` - Çıkış yap
- `updateUser(userData)` - Profil güncelle
- `checkAuth()` - Oturum kontrolü

---

### ProductStore

**Kullanım:**

```typescript
import { useProductStore } from '@/store/productStore';

function ProductsScreen() {
  const { 
    products, 
    fetchProducts, 
    isLoading, 
    error 
  } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <ProductCard product={item} />
      )}
    />
  );
}
```

**Metodlar:**
- `fetchProducts()` - Tüm ürünleri çek
- `fetchProductById(id)` - Tek ürün detayı
- `setSearchQuery(query)` - Arama filtresi
- `setSelectedCategory(categoryId)` - Kategori filtresi
- `getFilteredProducts()` - Filtrelenmiş ürünler

---

### CartStore

**Kullanım:**

```typescript
import { useCartStore } from '@/store/cartStore';

function ProductDetailScreen({ product }) {
  const { addToCart, items, total } = useCartStore();

  const handleAddToCart = async () => {
    try {
      await addToCart(product, 1, 'red', 'M');
      Alert.alert('Başarılı', 'Ürün sepete eklendi!');
    } catch (error) {
      Alert.alert('Hata', 'Sepete eklenemedi');
    }
  };

  return (
    <Button title="Sepete Ekle" onPress={handleAddToCart} />
  );
}
```

**Metodlar:**
- `addToCart(product, quantity, color?, size?)` - Sepete ekle
- `removeFromCart(productId)` - Sepetten çıkar
- `updateQuantity(productId, quantity)` - Miktarı güncelle
- `clearCart()` - Sepeti temizle
- `syncWithBackend()` - Backend ile senkronize et

**Özellikler:**
- ✅ Offline-first yaklaşım
- ✅ Otomatik backend senkronizasyonu
- ✅ AsyncStorage ile kalıcı saklama

---

### AddressStore

**Kullanım:**

```typescript
import { useAddressStore } from '@/store/addressStore';

function AddressesScreen() {
  const { 
    addresses, 
    fetchAddresses, 
    deleteAddress,
    setDefaultAddress 
  } = useAddressStore();

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <FlatList
      data={addresses}
      renderItem={({ item }) => (
        <AddressCard 
          address={item}
          onDelete={() => deleteAddress(item.id)}
          onSetDefault={() => setDefaultAddress(item.id)}
        />
      )}
    />
  );
}
```

**Metodlar:**
- `fetchAddresses()` - Adresleri çek
- `addAddress(addressData)` - Yeni adres ekle
- `updateAddress(id, addressData)` - Adresi güncelle
- `deleteAddress(id)` - Adresi sil
- `setDefaultAddress(id)` - Varsayılan adres yap

---

### PaymentStore

**Kullanım:**

```typescript
import { usePaymentStore } from '@/store/paymentStore';

function PaymentMethodsScreen() {
  const { 
    paymentMethods, 
    fetchPaymentMethods,
    addPaymentMethod 
  } = usePaymentStore();

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleAddCard = async (cardData) => {
    try {
      await addPaymentMethod(cardData);
      Alert.alert('Başarılı', 'Kart eklendi!');
    } catch (error) {
      Alert.alert('Hata', error.message);
    }
  };

  return (
    <View>
      {paymentMethods.map(card => (
        <PaymentCard key={card.id} card={card} />
      ))}
    </View>
  );
}
```

**Metodlar:**
- `fetchPaymentMethods()` - Kartları çek
- `addPaymentMethod(cardData)` - Yeni kart ekle
- `updatePaymentMethod(id, cardData)` - Kartı güncelle
- `deletePaymentMethod(id)` - Kartı sil
- `setDefaultPaymentMethod(id)` - Varsayılan kart yap

---

### OrderStore

**Kullanım:**

```typescript
import { useOrderStore } from '@/store/orderStore';
import { useCartStore } from '@/store/cartStore';

function CheckoutScreen() {
  const { createOrder } = useOrderStore();
  const { clearCart } = useCartStore();

  const handleCompleteOrder = async (
    shippingAddressId: string,
    paymentMethodId: string
  ) => {
    try {
      const order = await createOrder(
        shippingAddressId,
        paymentMethodId,
        'Hızlı teslimat lütfen'
      );

      clearCart();
      navigation.navigate('OrderSuccess', { orderId: order.id });
    } catch (error) {
      Alert.alert('Hata', 'Sipariş oluşturulamadı');
    }
  };

  return (
    <Button 
      title="Siparişi Tamamla" 
      onPress={handleCompleteOrder}
    />
  );
}
```

**Metodlar:**
- `fetchOrders()` - Siparişleri çek
- `createOrder(shippingAddressId, paymentMethodId?, notes?)` - Sipariş oluştur
- `fetchOrderById(orderId)` - Sipariş detayı
- `cancelOrder(orderId)` - Siparişi iptal et

---

## 📝 Örnekler

### Tam Login Akışı

```typescript
import { useAuthStore } from '@/store/authStore';

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    clearError();
    
    try {
      await login(email, password);
      // Başarılı - navigation otomatik yönetilir
      navigation.replace('Home');
    } catch (err) {
      // Hata store'da error state'inde
      console.error(err);
    }
  };

  return (
    <View>
      <TextInput 
        value={email}
        onChangeText={setEmail}
        placeholder="E-posta"
      />
      <TextInput 
        value={password}
        onChangeText={setPassword}
        placeholder="Şifre"
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button 
        title={isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        onPress={handleLogin}
        disabled={isLoading}
      />
    </View>
  );
}
```

### Ürün Listesi ve Sepete Ekleme

```typescript
import { useProductStore } from '@/store/productStore';
import { useCartStore } from '@/store/cartStore';

function ProductListScreen() {
  const { products, fetchProducts, isLoading } = useProductStore();
  const { addToCart } = useCartStore();

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product, 1);
      Alert.alert('✅ Başarılı', 'Ürün sepete eklendi!');
    } catch (error) {
      Alert.alert('❌ Hata', 'Ürün sepete eklenemedi');
    }
  };

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.productCard}>
          <Image source={{ uri: item.image }} style={styles.image} />
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>₺{item.price}</Text>
          <Button 
            title="Sepete Ekle" 
            onPress={() => handleAddToCart(item)}
          />
        </View>
      )}
    />
  );
}
```

### Sipariş Oluşturma

```typescript
import { useOrderStore } from '@/store/orderStore';
import { useCartStore } from '@/store/cartStore';
import { useAddressStore } from '@/store/addressStore';
import { usePaymentStore } from '@/store/paymentStore';

function CheckoutScreen() {
  const { createOrder, isLoading } = useOrderStore();
  const { clearCart } = useCartStore();
  const { getDefaultAddress } = useAddressStore();
  const { getDefaultPaymentMethod } = usePaymentStore();

  const handleCheckout = async () => {
    const address = getDefaultAddress();
    const payment = getDefaultPaymentMethod();

    if (!address) {
      Alert.alert('Uyarı', 'Lütfen teslimat adresi ekleyin');
      return;
    }

    try {
      const order = await createOrder(
        address.id,
        payment?.id,
        'Kapıda teslim ederken arayın lütfen'
      );

      clearCart();
      
      Alert.alert(
        '🎉 Sipariş Alındı!',
        `Sipariş No: ${order.orderNumber}`,
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('OrderDetail', { 
              orderId: order.id 
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Hata', 'Sipariş oluşturulamadı. Lütfen tekrar deneyin.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sipariş Özeti</Text>
      {/* Sipariş detayları */}
      
      <Button 
        title={isLoading ? 'İşleniyor...' : 'Siparişi Tamamla'}
        onPress={handleCheckout}
        disabled={isLoading}
      />
    </View>
  );
}
```

---

## ⚠️ Hata Yönetimi

### API Hataları

Tüm API hataları `ApiError` formatında döner:

```typescript
interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}
```

**Örnek Kullanım:**

```typescript
import { useAuthStore } from '@/store/authStore';

const { login, error } = useAuthStore();

try {
  await login(email, password);
} catch (err: any) {
  console.log('Hata mesajı:', err.message);
  console.log('HTTP status:', err.status);
  console.log('Field errors:', err.errors);
  
  // Kullanıcıya göster
  Alert.alert('Giriş Başarısız', err.message);
}
```

### Offline Mod

CartStore offline-first yaklaşım kullanır. İnternet olmasa bile:
- ✅ Sepete ekleme çalışır
- ✅ Miktar güncelleme çalışır
- ✅ Sepetten çıkarma çalışır

Backend'e bağlandığında otomatik senkronize olur.

### Token Yenileme

Token süresi dolduğunda otomatik olarak yenilenir:

```typescript
// Axios interceptor otomatik yönetir
// 401 hatası alındığında:
// 1. Refresh token ile yeni access token al
// 2. Başarısız isteği tekrar dene
// 3. Başarısızsa kullanıcıyı logout et
```

---

## 🔐 Güvenlik

### Token Saklama

- Token'lar AsyncStorage'da güvenli şekilde saklanır
- Asla kodda hardcode edilmez
- API isteklerinde Authorization header ile gönderilir

### HTTPS

Production'da mutlaka HTTPS kullanın:

```typescript
// Production için
export const API_BASE_URL = 'https://your-api.com/api';
```

---

## 🧪 Test Etme

### 1. Backend'i Test Et

```bash
curl http://127.0.0.1:8000/api/products/products/
```

### 2. Login Test Et

```bash
curl -X POST http://127.0.0.1:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### 3. Mobil Uygulamada Test

```typescript
// App.tsx veya herhangi bir screen'de
import { apiService } from '@/services/api';

useEffect(() => {
  const testAPI = async () => {
    try {
      const products = await apiService.getProducts();
      console.log('✅ API çalışıyor:', products.length, 'ürün');
    } catch (error) {
      console.error('❌ API hatası:', error);
    }
  };

  testAPI();
}, []);
```

---

## 📚 Ekstra Kaynaklar

- [Zustand Dokumentasyonu](https://github.com/pmndrs/zustand)
- [Axios Dokumentasyonu](https://axios-http.com/)
- [AsyncStorage Dokumentasyonu](https://react-native-async-storage.github.io/async-storage/)
- [Django REST Framework](https://www.django-rest-framework.org/)

---

## 🆘 Sorun Giderme

### "Network Error" Hatası

```bash
# iOS Simulator için
# Info.plist'e ekle:
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
</dict>

# Android için
# android/app/src/main/AndroidManifest.xml
<application
  android:usesCleartextTraffic="true">
```

### Token Yenileme Çalışmıyor

```typescript
// Token'ları kontrol et
import { tokenStorage } from '@/utils/storage';

const token = await tokenStorage.getAccessToken();
const refresh = await tokenStorage.getRefreshToken();

console.log('Access:', token);
console.log('Refresh:', refresh);
```

### Store State Güncellenmiyor

```typescript
// Zustand devtools kullan
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useMyStore = create(
  devtools((set) => ({
    // ...
  }))
);
```

---

## ✅ Checklist

Backend entegrasyonunu tamamladıktan sonra kontrol et:

- [ ] `npm install` çalıştırıldı mı?
- [ ] Backend URL doğru mu? (`src/config/api.ts`)
- [ ] Django backend çalışıyor mu? (`http://127.0.0.1:8000`)
- [ ] Login yapıldığında token kaydediliyor mu?
- [ ] Ürünler backend'den geliyor mu?
- [ ] Sepete ekleme çalışıyor mu?
- [ ] Offline modda sepet çalışıyor mu?
- [ ] Sipariş oluşturulabiliyor mu?

---

**🎉 Backend entegrasyonu tamamlandı! Başarılı geliştirmeler!**

