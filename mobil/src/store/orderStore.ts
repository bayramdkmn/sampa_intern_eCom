import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartItem, StoreOrder } from "../types";

interface OrderState {
  
  orders: StoreOrder[];
  currentOrder: StoreOrder | null;
  isLoading: boolean;
  error: string | null;

  
  createOrder: (items: CartItem[], total: number, shippingCost: number) => Promise<StoreOrder>;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<StoreOrder | null>;
  cancelOrder: (orderId: string) => Promise<void>;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      
      orders: [],
      currentOrder: null,
      isLoading: false,
      error: null,

      
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
          const newOrder: StoreOrder = {
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

      fetchOrders: async () => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Gerçek API çağrısı
          // const response = await fetch('YOUR_API/orders');
          // const data = await response.json();

          const orders = get().orders;

          set({ isLoading: false });
        } catch (error) {
          set({
            error: "Siparişler yüklenirken hata oluştu",
            isLoading: false,
          });
        }
      },

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

      clearCurrentOrder: () => {
        set({ currentOrder: null });
      },
    }),
    {
      name: "order-storage", 
      storage: createJSONStorage(() => AsyncStorage),
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

