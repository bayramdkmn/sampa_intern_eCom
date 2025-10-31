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
  isSyncing: boolean; 

  addToCart: (product: Product, quantity?: number, color?: string, size?: string) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  calculateTotal: () => void;
  setItems: (items: CartItem[]) => void;
  setTotal: (total: number) => void;
  syncWithBackend: () => Promise<void>; 
  syncCartToBackend: () => Promise<void>; 
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

          try {
            await api.addToCart({
              product_id: parseInt(product.id),
              quantity,
              color,
              size,
            });
          } catch (apiError) {
            console.warn('Sepete ekleme API hatası (offline mode):', apiError);
          }
        } catch (error: any) {
          console.error('Sepete ekleme hatası:', error);
          set({ error: error.message || 'Sepete eklenirken hata oluştu' });
          throw error;
        }
      },

      removeFromCart: async (productId: string) => {
        try {
          const currentItems = get().items;
          const currentTotal = get().total;

          set({
            items: get().items.filter((item) => item.product.id !== productId),
          });
          get().calculateTotal();

          try {
            await api.removeFromCart(parseInt(productId));
          } catch (apiError) {
            console.warn('⚠️ Backend remove failed (offline mode):', apiError);
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
            get().removeFromCart(productId);
            return;
          }
          set({
            items: get().items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          });
          get().calculateTotal();
          try {
            await api.updateCartItem(parseInt(productId), quantity);
          } catch (apiError) {
            console.warn('⚠️ Backend quantity update failed (offline mode):', apiError);
          }
        } catch (error: any) {
          console.error('Miktar güncelleme hatası:', error);
          set({ error: error.message || 'Miktar güncellenirken hata oluştu' });
          throw error;
        }
      },

      syncCartToBackend: async () => {
        try {
          const { items } = get();
          const backendCart = await api.getCartItems();
          if (!backendCart || !Array.isArray(backendCart)) {
            console.warn('⚠️ Backend cart is empty or invalid, skipping sync');
            return;
          }
          for (const localItem of items) {
            const backendItem = backendCart.find(item => item.product.id.toString() === localItem.product.id);
            
            if (backendItem) {
              if (backendItem.quantity !== localItem.quantity) {
                await api.updateCartItem(parseInt(backendItem.id), localItem.quantity);
              }
            } else {
              await api.addToCart({ product_id: parseInt(localItem.product.id), quantity: localItem.quantity });
            }
          }
          
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

