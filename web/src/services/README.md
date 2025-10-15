# API Services Kullanım Kılavuzu

Bu projede yeni bir API yönetim sistemi kuruldu. İki farklı API class'ı var:

## 🎯 Type-Safe API System

Artık tüm API çağrıları **type-safe**! `any` type'ları kaldırıldı ve spesifik interface'ler kullanılıyor.

```typescript
import { clientApi, User, Address, Product, Order } from '@/services';

// Type-safe API çağrıları
const user: User = await clientApi.getUserProfile();
const addresses: Address[] = await clientApi.getAddresses();
const products: Product[] = await clientApi.getProducts();
const orders: Order[] = await clientApi.getOrders();
```

## 1. ClientApi (Client-side)
Client-side (browser) işlemler için kullanılır. localStorage kullanır.

```typescript
import { clientApi, RegisterData, LoginData } from '@/services';

// Auth işlemleri - Type-safe
const loginData: LoginData = { email: "test@example.com", password: "password" };
const loginResponse = await clientApi.login(loginData);

const registerData: RegisterData = {
  first_name: "John",
  last_name: "Doe", 
  email: "john@example.com",
  password: "password"
};
const registerResponse = await clientApi.register(registerData);

// Ürün işlemleri - Type-safe
const products: Product[] = await clientApi.getProducts();
const product: Product = await clientApi.getProduct('123');

// Kullanıcı işlemleri - Type-safe
const addresses: Address[] = await clientApi.getAddresses();
const cards: PaymentCard[] = await clientApi.getCards();
```

## 2. ServerApi (Server-side)
Server-side (Next.js API routes, Server Components) için kullanılır. Cookie kullanır.

```typescript
import { serverApi, UserProfile, Address, Product } from '@/services';

// Server Component'te kullanım - Type-safe
export default async function ProfilePage() {
  const userProfile: UserProfile = await serverApi.getUserProfile();
  const addresses: Address[] = await serverApi.getAddresses();
  const products: Product[] = await serverApi.getProducts();
  
  return <div>...</div>;
}
```

## 🏗️ Available Types

```typescript
import {
  User,           // Kullanıcı bilgileri
  UserProfile,    // Kullanıcı profili + addresses + cards
  Address,        // Adres bilgileri
  CreateAddressData,
  UpdateAddressData,
  PaymentCard,    // Ödeme kartı bilgileri
  CreateCardData,
  UpdateCardData,
  Product,        // Ürün bilgileri
  ProductListResponse,
  Order,          // Sipariş bilgileri
  CreateOrderData,
  OrderItem,
  OrderStatus,
  AuthResponse,
  RegisterData,
  LoginData,
  ChangePasswordData,
  ApiError,
  PaginatedResponse
} from '@/services';
```

## Legacy Service'ler
Eski `authService` ve `productService` hala çalışıyor ama artık yeni API sistemi kullanıyor:

```typescript
import { authService, productService, Product, Address } from '@/services';

// Bu hala çalışıyor ama arka planda ClientApi kullanıyor
const products: Product[] = await productService.getProducts();
const addresses: Address[] = await authService.getAddresses();
```

## ✨ Avantajlar

1. **🎯 Type Safety**: Artık hiç `any` type yok! Tüm API çağrıları type-safe
2. **🔄 Centralized Error Handling**: Tüm API çağrıları aynı error handling'i kullanıyor
3. **🍪 Cookie/LocalStorage Management**: Server/Client arası otomatik geçiş
4. **🔑 Token Management**: Otomatik refresh token işlemi
5. **📝 Consistent Logging**: Tüm API çağrıları tutarlı loglama yapıyor
6. **📚 IntelliSense**: IDE'de otomatik tamamlama ve type checking
7. **🐛 Runtime Safety**: Compile-time'da type hatalarını yakalama

## 🚀 Migration
Mevcut kodunuz çalışmaya devam edecek. Yeni projelerde `clientApi` veya `serverApi` kullanmanızı öneriyoruz.

## 📖 Type Examples

```typescript
// User işlemleri
const user: User = await clientApi.getUserProfile();
user.first_name; // ✅ Type-safe access
user.invalid_field; // ❌ TypeScript error

// Address işlemleri  
const newAddress: CreateAddressData = {
  title: "Ev",
  first_name: "John",
  last_name: "Doe",
  address_line_1: "123 Main St",
  city: "Istanbul",
  state_province: "Istanbul",
  postal_code: "34000",
  country: "Turkey"
};
const createdAddress: Address = await clientApi.createAddress(newAddress);

// Product işlemleri
const products: Product[] = await clientApi.getProducts();
products.forEach(product => {
  console.log(product.name); // ✅ Type-safe
  console.log(product.price); // ✅ Type-safe
});
```
