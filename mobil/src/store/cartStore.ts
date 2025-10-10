import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Product, CartItem } from "../types";

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      
      addToCart: (product: Product, quantity: number = 1) => {
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

        // Toplamı güncelle
        get().calculateTotal();
      },

      removeFromCart: (productId: string) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
        get().calculateTotal();
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          // Miktar 0 ise sil
          get().removeFromCart(productId);
        } else {
          set({
            items: get().items.map((item) =>
              item.product.id === productId ? { ...item, quantity } : item
            ),
          });
          get().calculateTotal();
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

