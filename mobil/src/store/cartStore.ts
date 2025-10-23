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
  syncWithBackend: () => Promise<void>; // Backend'den sepeti çek
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
          // Önce local state'i güncelle
          set({
            items: get().items.filter((item) => item.product.id !== productId),
          });
          get().calculateTotal();

          // Backend'den sil (arka planda)
          try {
            await api.removeFromCart(parseInt(productId));
          } catch (apiError) {
            console.warn('Sepetten silme API hatası (offline mode):', apiError);
          }
        } catch (error: any) {
          console.error('Sepetten silme hatası:', error);
          set({ error: error.message || 'Sepetten silinirken hata oluştu' });
          throw error;
        }
      },

      updateQuantity: async (productId: string, quantity: number) => {
        try {
          if (quantity <= 0) {
            await get().removeFromCart(productId);
            return;
          }

          // Önce local state'i güncelle
          set({
            items: get().items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          });
          get().calculateTotal();

          // Backend'e gönder (arka planda)
          try {
            await api.updateCartItem(parseInt(productId), quantity);
          } catch (apiError) {
            console.warn('Miktar güncelleme API hatası (offline mode):', apiError);
          }
        } catch (error: any) {
          console.error('Miktar güncelleme hatası:', error);
          set({ error: error.message || 'Miktar güncellenirken hata oluştu' });
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

