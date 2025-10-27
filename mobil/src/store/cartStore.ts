import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, CartItem } from "../types";
import { api } from "../services/api";

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
  isSyncing: boolean; // API ile senkronizasyon durumu

  // Actions
  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  calculateTotal: () => void;
  setItems: (items: CartItem[]) => void;
  setTotal: (total: number) => void;
  syncWithBackend: () => Promise<void>; // Backend'den sepeti çek
  syncCartToBackend: () => Promise<void>; // Local sepeti backend'e gönder
  clearError: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      isLoading: false,
      error: null,
      isSyncing: false,

      addToCart: async (product: Product, quantity: number = 1, color?: string, size?: string) => {
        try {
          const items = get().items;
          const existingItem = items.find((item) => item.product.id === product.id);

          // Önce local state'i güncelle (optimistic update)
          if (existingItem) {
            set({
              items: items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            });
          } else {
            set({
              items: [...items, { product, quantity }],
            });
          }

          get().calculateTotal();

          // Backend'e gönder (arka planda)
          try {
            await api.addToCart({
              product_id: parseInt(product.id),
              quantity,
              color,
              size,
            });
          } catch (apiError) {
            console.warn('Sepete ekleme API hatası (offline mode):', apiError);
            // Hata olsa bile local state'i değiştirme (offline-first)
          }
        } catch (error: any) {
          console.error('Sepete ekleme hatası:', error);
          set({ error: error.message || 'Sepete eklenirken hata oluştu' });
          throw error;
        }
      },

      removeFromCart: async (productId: string) => {
        try {
          // Mevcut state'i sakla (rollback için)
          const currentItems = get().items;
          const currentTotal = get().total;

          // Önce local state'i güncelle
          set({
            items: get().items.filter((item) => item.product.id !== productId),
          });
          get().calculateTotal();

          // Backend'den sil (arka planda, hata olsa bile local state'i değiştirme)
          try {
            await api.removeFromCart(parseInt(productId));
          } catch (apiError) {
            console.warn('⚠️ Backend remove failed (offline mode):', apiError);
            // Backend hatası olsa bile local state'i değiştirme (offline-first approach)
          }
        } catch (error: any) {
          console.error('Sepetten silme hatası:', error);
          set({ error: error.message || 'Sepetten silinirken hata oluştu' });
          throw error;
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        try {
          console.log(`🛒 UPDATE QUANTITY - Product ID: ${productId}, New Quantity: ${quantity}`);
          
          if (quantity <= 0) {
            get().removeFromCart(productId);
            return;
          }

          // Mevcut state'i sakla (rollback için)
          const currentItems = get().items;
          const currentTotal = get().total;

          // Önce local state'i güncelle
          set({
            items: get().items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          });
          get().calculateTotal();
          
          console.log(`🛒 LOCAL STATE UPDATED - New items:`, get().items.map(item => ({
            product_id: item.product.id,
            name: item.product.name,
            quantity: item.quantity
          })));

          // Backend'e de güncelle (arka planda, hata olsa bile local state'i değiştirme)
          try {
            await api.updateCartItem(parseInt(productId), quantity);
          } catch (apiError) {
            console.warn('⚠️ Backend quantity update failed (offline mode):', apiError);
            // Backend hatası olsa bile local state'i değiştirme (offline-first approach)
          }
        } catch (error: any) {
          console.error('Miktar güncelleme hatası:', error);
          set({ error: error.message || 'Miktar güncellenirken hata oluştu' });
          throw error;
        }
      },

      // Backend'e sync et (checkout sırasında veya arada bir çağrılacak)
      syncCartToBackend: async () => {
        try {
          const { items } = get();
          
          // Backend'den mevcut cart'ı al
          const backendCart = await api.getCartItems();
          
          // Backend response'unu kontrol et
          if (!backendCart || !Array.isArray(backendCart)) {
            console.warn('⚠️ Backend cart is empty or invalid, skipping sync');
            return;
          }
          
          // Her local item için backend'deki durumu kontrol et ve güncelle
          for (const localItem of items) {
            const backendItem = backendCart.find(item => item.product.id.toString() === localItem.product.id);
            
            if (backendItem) {
              // Backend'deki quantity ile local'deki farklıysa güncelle
              if (backendItem.quantity !== localItem.quantity) {
                await api.updateCartItem(parseInt(backendItem.id), localItem.quantity);
              }
            } else {
              // Backend'de yoksa ekle
              await api.addToCart({ product_id: parseInt(localItem.product.id), quantity: localItem.quantity });
            }
          }
          
          // Backend'de olup local'de olmayan item'ları sil
          for (const backendItem of backendCart) {
            const localItem = items.find(item => item.product.id === backendItem.product.id.toString());
            if (!localItem) {
              await api.removeFromCart(parseInt(backendItem.id));
            }
          }
          
        } catch (error) {
          console.error('❌ Cart sync failed:', error);
          throw error;
        }
      },

      clearCart: () => {
        set({
          items: [],
          total: 0,
          itemCount: 0,
        });
      },

      setItems: (items: CartItem[]) => {
        set({ items });
        get().calculateTotal();
      },

      setTotal: (total: number) => {
        set({ total });
      },

      calculateTotal: () => {
        const items = get().items;
        const total = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

        set({ total, itemCount });
      },

      syncWithBackend: async () => {
        try {
          set({ isSyncing: true, error: null });

          const backendCartItems = await api.getCartItems();
          
          // Backend cart item'larını local Product formatına çevir
          // Not: Bu kısım backend'in döndüğü cart yapısına göre ayarlanmalı
          // Şimdilik basit bir mapping yapıyoruz
          const localCartItems: CartItem[] = backendCartItems.map((item: any) => ({
            product: {
              id: item.product.id.toString(),
              name: item.product.name,
              price: parseFloat(item.product.price),
              image: item.product.image || "https://via.placeholder.com/400",
              category: item.product.category,
              description: item.product.description,
              rating: parseFloat(item.product.rating_average || "0"),
              inStock: item.product.stock > 0,
            },
            quantity: item.quantity,
          }));

          set({ items: localCartItems, isSyncing: false });
          get().calculateTotal();
        } catch (error: any) {
          console.error('Sepet senkronizasyonu hatası:', error);
          set({ 
            isSyncing: false, 
            error: error.message || 'Sepet senkronize edilemedi' 
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "cart-storage", 
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.calculateTotal();
        }
      },
    }
  )
);

// 🎯 KULLANIM ÖRNEĞİ:
// 
// import { useCartStore } from '../store/cartStore';
// 
// function ProductDetailScreen({ product }) {
//   const { addToCart, items } = useCartStore();
//   
//   const handleAddToCart = () => {
//     addToCart(product, 1);
//     alert('Sepete eklendi!');
//   };
//   
//   return (
//     <TouchableOpacity onPress={handleAddToCart}>
//       <Text>Sepete Ekle</Text>
//     </TouchableOpacity>
//   );
// }
// 
// function CartScreen() {
//   const { items, total, removeFromCart } = useCartStore();
//   
//   return (
//     <View>
//       <Text>Toplam: ₺{total}</Text>
//       {items.map(item => (
//         <Text key={item.product.id}>{item.product.name}</Text>
//       ))}
//     </View>
//   );
// }

