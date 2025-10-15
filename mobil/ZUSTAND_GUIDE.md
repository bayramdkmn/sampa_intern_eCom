# 🎯 Zustand Kullanım Kılavuzu

Redux biliyorsan, Zustand'ı 10 dakikada öğrenirsin! İşte karşılaştırmalı rehber:

## 📚 İçindekiler

1. [Redux vs Zustand](#redux-vs-zustand)
2. [Store Oluşturma](#store-oluşturma)
3. [State Okuma](#state-okuma)
4. [State Güncelleme](#state-güncelleme)
5. [Async İşlemler](#async-işlemler)
6. [Persist (Kalıcılık)](#persist-kalıcılık)
7. [TypeScript](#typescript)
8. [Best Practices](#best-practices)

---

## Redux vs Zustand

### ❌ Redux ile Sepet Yönetimi

```typescript
// types.ts
const ADD_TO_CART = 'ADD_TO_CART';
const REMOVE_FROM_CART = 'REMOVE_FROM_CART';

// actions.ts
export const addToCart = (product) => ({
  type: ADD_TO_CART,
  payload: product
});

export const removeFromCart = (id) => ({
  type: REMOVE_FROM_CART,
  payload: id
});

// reducer.ts
const initialState = {
  items: [],
  total: 0
};

export const cartReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_CART:
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    case REMOVE_FROM_CART:
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    default:
      return state;
  }
};

// store.ts
import { createStore } from 'redux';
const store = createStore(cartReducer);

// Component'te
import { useDispatch, useSelector } from 'react-redux';

function CartScreen() {
  const dispatch = useDispatch();
  const items = useSelector(state => state.items);
  
  const handleAdd = () => {
    dispatch(addToCart(product));
  };
}
```

**Toplam: ~50 satır kod** 😩

---

### ✅ Zustand ile Sepet Yönetimi

```typescript
// cartStore.ts
import { create } from 'zustand';

export const useCartStore = create((set) => ({
  // State
  items: [],
  total: 0,
  
  // Actions
  addToCart: (product) => 
    set((state) => ({ items: [...state.items, product] })),
    
  removeFromCart: (id) => 
    set((state) => ({ items: state.items.filter(i => i.id !== id) })),
}));

// Component'te
import { useCartStore } from '../store/cartStore';

function CartScreen() {
  const { items, addToCart } = useCartStore();
  
  const handleAdd = () => {
    addToCart(product);
  };
}
```

**Toplam: ~15 satır kod** 🎉

---

## Store Oluşturma

### Basit Store

```typescript
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

### TypeScript ile Store

```typescript
interface BearState {
  bears: number;
  addBear: () => void;
  removeBear: () => void;
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  addBear: () => set((state) => ({ bears: state.bears + 1 })),
  removeBear: () => set((state) => ({ bears: state.bears - 1 })),
}));
```

---

## State Okuma

### Redux'ta

```typescript
const user = useSelector(state => state.user);
const isLoggedIn = useSelector(state => state.isLoggedIn);
```

### Zustand'da

```typescript
// Tüm store'u al
const { user, isLoggedIn } = useAuthStore();

// Sadece ihtiyacın olanı al (performans için)
const user = useAuthStore((state) => state.user);
const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
```

---

## State Güncelleme

### 1. Basit Güncelleme

```typescript
const useStore = create((set) => ({
  name: '',
  setName: (name) => set({ name }),
}));
```

### 2. Önceki State'e Bağlı

```typescript
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 3. Birden Fazla Değer

```typescript
const useStore = create((set) => ({
  name: '',
  age: 0,
  updateProfile: (name, age) => set({ name, age }),
}));
```

### 4. Get ile Mevcut State'e Erişim

```typescript
const useStore = create((set, get) => ({
  items: [],
  total: 0,
  
  addItem: (item) => {
    set({ items: [...get().items, item] });
    // Total'i güncelle
    const total = get().items.reduce((sum, i) => sum + i.price, 0);
    set({ total });
  },
}));
```

---

## Async İşlemler

Redux'ta thunk/saga gerekir, Zustand'da direkt async/await!

```typescript
const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,
  
  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await fetch('https://api.example.com/products');
      const data = await response.json();
      
      set({ products: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
}));

// Kullanımı
function ProductList() {
  const { products, fetchProducts, isLoading } = useProductStore();
  
  useEffect(() => {
    fetchProducts(); // Direkt çağır!
  }, []);
  
  if (isLoading) return <Loader />;
  
  return <FlatList data={products} />;
}
```

---

## Persist (Kalıcılık)

AsyncStorage ile otomatik kaydetme:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'auth-storage', // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

App açıldığında otomatik yüklenir! 🎉

### Kısmi Persist

```typescript
persist(
  (set) => ({ /* ... */ }),
  {
    name: 'cart-storage',
    storage: createJSONStorage(() => AsyncStorage),
    // Sadece bunları kaydet
    partialize: (state) => ({
      items: state.items,
      total: state.total,
    }),
  }
)
```

---

## TypeScript

### Interface ile Store

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  login: async (email, password) => {
    const response = await api.login(email, password);
    set({ user: response.user, token: response.token });
  },
  logout: () => set({ user: null, token: null }),
}));
```

### Tip Çıkarımı

```typescript
// Zustand otomatik tip çıkarımı yapar!
const { user, login } = useAuthStore(); 
// user: User | null
// login: (email: string, password: string) => Promise<void>
```

---

## Best Practices

### 1. Store'ları Küçük Tut

❌ Kötü:
```typescript
// Her şey tek store'da
const useAppStore = create((set) => ({
  user: null,
  products: [],
  cart: [],
  orders: [],
  // 100 satır daha...
}));
```

✅ İyi:
```typescript
// Ayrı sorumluluklar
const useAuthStore = create((set) => ({ /* auth */ }));
const useProductStore = create((set) => ({ /* products */ }));
const useCartStore = create((set) => ({ /* cart */ }));
```

### 2. Selector Kullan (Performans)

❌ Kötü:
```typescript
// Tüm store'u al
const { user, products, cart } = useStore();
// user değişmese bile products değişince render!
```

✅ İyi:
```typescript
// Sadece ihtiyacın olanı al
const user = useStore((state) => state.user);
// Sadece user değişince render!
```

### 3. Actions'ları Store'da Tanımla

❌ Kötü:
```typescript
function Component() {
  const { items } = useCartStore();
  const addItem = (item) => {
    useCartStore.setState({ items: [...items, item] });
  };
}
```

✅ İyi:
```typescript
// Store'da tanımla
const useCartStore = create((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ 
    items: [...state.items, item] 
  })),
}));

// Component'te kullan
function Component() {
  const { items, addItem } = useCartStore();
}
```

### 4. Computed Values için Fonksiyon Kullan

```typescript
const useCartStore = create((set, get) => ({
  items: [],
  
  // Computed value - fonksiyon olarak
  getTotal: () => {
    return get().items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  },
}));

// Kullanımı
const total = useCartStore(state => state.getTotal());
```

---

## Örnek: Gerçek Kullanım

### Auth Store ile Login Flow

```typescript
// store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await fetch('API_URL/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          const data = await response.json();
          
          set({
            user: data.user,
            token: data.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Login Screen

```typescript
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    try {
      await login(email, password);
      navigation.navigate('Home');
    } catch (error) {
      alert('Login failed!');
    }
  };
  
  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <Button onPress={handleLogin} disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </View>
  );
}
```

### Protected Route

```typescript
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <LoginScreen />;
  }
  
  return children;
}
```

---

## 🎉 Özet

### Zustand Neden Daha İyi?

| Özellik | Redux | Zustand |
|---------|-------|---------|
| Kod Miktarı | Çok fazla | Minimal |
| Öğrenme | Zor | Kolay |
| Boilerplate | actions, reducers, types | Yok |
| TypeScript | Karmaşık | Kolay |
| Async | Thunk/Saga gerekli | Built-in |
| Persist | redux-persist | Built-in |
| Performans | İyi | Mükemmel |

### Ne Zaman Redux Kullanmalı?

- Çok büyük ekip (10+ developer)
- Çok karmaşık state logic
- Redux ekosistemi gerekli (DevTools, middleware vs.)
- Mevcut Redux projesi

### Ne Zaman Zustand Kullanmalı?

- ✅ Yeni projeler
- ✅ Orta/küçük ekipler
- ✅ Hızlı geliştirme
- ✅ Minimal kod
- ✅ Modern React uygulamaları (bu proje gibi!)

---

Kolay gelsin! 🚀

