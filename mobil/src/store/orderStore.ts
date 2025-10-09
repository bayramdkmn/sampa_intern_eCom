import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartItem } from "../types";

// Sipariş Tipi
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  shippingCost: number;
  finalTotal: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  deliveryAddress?: string;
  paymentMethod?: string;
}

interface OrderState {
  // State
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createOrder: (items: CartItem[], total: number, shippingCost: number) => Promise<Order>;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<void>;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      // Initial State
      orders: [],
      currentOrder: null,
      isLoading: false,
      error: null,

      // 🛍️ Sipariş Oluştur
      // Redux'ta: dispatch(createOrder(orderData))
      // Zustand'da: await createOrder(items, total) - Çok kolay!
      createOrder: async (items: CartItem[], total: number, shippingCost: number) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Gerçek API çağrısı
          // const response = await fetch('YOUR_API/orders', {
          //   method: 'POST',
          //   body: JSON.stringify({ items, total, shippingCost })
          // });
          // const data = await response.json();

          // Mock sipariş oluştur
          const newOrder: Order = {
            id: `order_${Date.now()}`,
            items: items,
            total: total,
            shippingCost: shippingCost,
            finalTotal: total + shippingCost,
            status: "pending",
            createdAt: new Date().toISOString(),
          };

          set({
            orders: [newOrder, ...get().orders],
            currentOrder: newOrder,
            isLoading: false,
          });

          return newOrder;
        } catch (error) {
          set({
            error: "Sipariş oluşturulurken hata oluştu",
            isLoading: false,
          });
          throw error;
        }
      },

      // 📋 Siparişleri Çek
      fetchOrders: async () => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Gerçek API çağrısı
          // const response = await fetch('YOUR_API/orders');
          // const data = await response.json();

          // Mock siparişler (şimdilik mevcut siparişleri kullan)
          const orders = get().orders;

          set({ isLoading: false });
        } catch (error) {
          set({
            error: "Siparişler yüklenirken hata oluştu",
            isLoading: false,
          });
        }
      },

      // 🔍 ID'ye Göre Sipariş Bul
      fetchOrderById: async (orderId: string) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Gerçek API çağrısı
          // const response = await fetch(`YOUR_API/orders/${orderId}`);
          // const data = await response.json();

          const order = get().orders.find((o) => o.id === orderId) || null;

          set({ isLoading: false });
          return order;
        } catch (error) {
          set({
            error: "Sipariş yüklenirken hata oluştu",
            isLoading: false,
          });
          return null;
        }
      },

      // ❌ Siparişi İptal Et
      cancelOrder: async (orderId: string) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Gerçek API çağrısı
          // const response = await fetch(`YOUR_API/orders/${orderId}/cancel`, {
          //   method: 'PUT'
          // });

          set({
            orders: get().orders.map((order) =>
              order.id === orderId
                ? { ...order, status: "cancelled" as const }
                : order
            ),
            isLoading: false,
          });
        } catch (error) {
          set({
            error: "Sipariş iptal edilirken hata oluştu",
            isLoading: false,
          });
        }
      },

      // 🧹 Mevcut Siparişi Temizle
      clearCurrentOrder: () => {
        set({ currentOrder: null });
      },
    }),
    {
      name: "order-storage", // AsyncStorage key
      storage: createJSONStorage(() => AsyncStorage),
      // Siparişleri kaydet
      partialize: (state) => ({
        orders: state.orders,
      }),
    }
  )
);

// 🎯 KULLANIM ÖRNEĞİ:
// 
// import { useOrderStore } from '../store/orderStore';
// import { useCartStore } from '../store/cartStore';
// 
// function CartScreen() {
//   const { items, total, clearCart } = useCartStore();
//   const { createOrder } = useOrderStore();
//   
//   const handleCheckout = async () => {
//     const shippingCost = total > 500 ? 0 : 29.99;
//     
//     try {
//       const order = await createOrder(items, total, shippingCost);
//       clearCart(); // Sepeti temizle
//       
//       alert(`Sipariş oluşturuldu! #${order.id}`);
//       navigation.navigate('OrderSuccess', { orderId: order.id });
//     } catch (error) {
//       alert('Sipariş oluşturulamadı!');
//     }
//   };
//   
//   return (
//     <TouchableOpacity onPress={handleCheckout}>
//       <Text>Siparişi Tamamla</Text>
//     </TouchableOpacity>
//   );
// }
// 
// function OrdersScreen() {
//   const { orders, fetchOrders } = useOrderStore();
//   
//   useEffect(() => {
//     fetchOrders();
//   }, []);
//   
//   return (
//     <FlatList
//       data={orders}
//       renderItem={({ item }) => (
//         <View>
//           <Text>Sipariş #{item.id}</Text>
//           <Text>Durum: {item.status}</Text>
//           <Text>Toplam: ₺{item.finalTotal}</Text>
//         </View>
//       )}
//     />
//   );
// }

