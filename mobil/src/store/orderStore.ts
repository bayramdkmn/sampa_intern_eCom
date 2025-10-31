import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartItem, StoreOrder } from "../types";
import { api } from "../services/api";
import type { Order as ApiOrder } from "../types/api";
import { useCartStore } from "./cartStore";

const mapApiOrderToLocalOrder = (apiOrder: any): StoreOrder => {
  console.log('🔍 Mapping order:', JSON.stringify(apiOrder, null, 2));
  
  const items: CartItem[] = (apiOrder.items || []).map((item: any) => ({
    product: {
      id: item.product?.toString() || item.product_id?.toString() || "unknown",
      name: item.product_name || "Ürün adı yok",
      price: parseFloat(item.price || "0") / (item.quantity || 1),
      image: "https://via.placeholder.com/400",
      category: "Genel",
      description: "Ürün açıklaması yok",
      rating: 0,
      inStock: true,
    },
    quantity: item.quantity || 1,
  }));

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const finalTotal = parseFloat(apiOrder.total_price || "0");
  
  return {
    id: apiOrder.id.toString(),
    orderNumber: `#${apiOrder.id}`,
    items,
    total,
    shippingCost: 0,
    finalTotal,
    status: apiOrder.status,
    createdAt: apiOrder.created_at,
    date: apiOrder.created_at,
    address: apiOrder.address || "Adres bilgisi yok",
  };
};

interface OrderState {
  orders: StoreOrder[];
  currentOrder: StoreOrder | null;
  isLoading: boolean;
  error: string | null;

  createOrder: (
    shippingAddressId: string, 
    paymentMethodId?: string, 
    notes?: string
  ) => Promise<StoreOrder>;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<StoreOrder | null>;
  cancelOrder: (orderId: string) => Promise<void>;
  clearCurrentOrder: () => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: null,
      isLoading: false,
      error: null,

      createOrder: async (
        shippingAddressId: string, 
        paymentMethodId?: string, 
        notes?: string
      ) => {
        try {
          set({ isLoading: true, error: null });

          const currentCart = useCartStore.getState();
          const { items, total } = currentCart;
          
          const orderData = {
            shipping_address: shippingAddressId,
            payment_method: paymentMethodId,
            notes,
            items: items.map(item => ({
              product_id: parseInt(item.product.id),
              quantity: item.quantity,
              price: (item.product.price * item.quantity).toFixed(2), // Toplam fiyat - 2 ondalık basamak
            })),
            total_amount: total.toFixed(2), // 2 ondalık basamak
          };

          const newApiOrder = await api.createOrder(orderData);

          const newLocalOrder = mapApiOrderToLocalOrder(newApiOrder);

          useCartStore.getState().clearCart();

          set({
            orders: [newLocalOrder, ...get().orders],
            currentOrder: newLocalOrder,
            isLoading: false,
          });

          return newLocalOrder;
        } catch (error: any) {
          console.error('Sipariş oluşturulurken hata:', error);
          set({
            error: error.message || "Sipariş oluşturulurken hata oluştu",
            isLoading: false,
          });
          throw error;
        }
      },

      fetchOrders: async () => {
        try {
          set({ isLoading: true, error: null });

          const apiOrders = await api.getOrders();
          
          const localOrders = apiOrders.map(mapApiOrderToLocalOrder);

          set({ orders: localOrders, isLoading: false });
        } catch (error: any) {
          console.error('Siparişler yüklenirken hata:', error);
          set({
            error: error.message || "Siparişler yüklenirken hata oluştu",
            isLoading: false,
          });
        }
      },

      fetchOrderById: async (orderId: string) => {
        try {
          set({ isLoading: true, error: null });

          const existingOrder = get().orders.find((o) => o.id === orderId);
          if (existingOrder) {
            set({ isLoading: false, currentOrder: existingOrder });
            return existingOrder;
          }

          const apiOrder = await api.getOrder(orderId);
          const localOrder = mapApiOrderToLocalOrder(apiOrder);

          set((state) => ({
            orders: [...state.orders, localOrder],
            currentOrder: localOrder,
            isLoading: false,
          }));

          return localOrder;
        } catch (error: any) {
          console.error('Sipariş yüklenirken hata:', error);
          set({
            error: error.message || "Sipariş yüklenirken hata oluştu",
            isLoading: false,
          });
          return null;
        }
      },

      cancelOrder: async (orderId: string) => {
        try {
          set({ isLoading: true, error: null });

          const cancelledApiOrder = await api.cancelOrder(orderId);
          console.log('🔄 CANCEL ORDER - Backend response:', JSON.stringify(cancelledApiOrder, null, 2));
          
          const cancelledLocalOrder = mapApiOrderToLocalOrder(cancelledApiOrder);
          console.log('🔄 CANCEL ORDER - Mapped order:', JSON.stringify(cancelledLocalOrder, null, 2));

          set((state) => ({
            orders: state.orders.map(order =>
              order.id === orderId ? cancelledLocalOrder : order
            ),
            currentOrder: state.currentOrder?.id === orderId 
              ? cancelledLocalOrder 
              : state.currentOrder,
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('Sipariş iptal edilirken hata:', error);
          set({
            error: error.message || "Sipariş iptal edilemedi",
            isLoading: false,
          });
          throw error;
        }
      },

      clearCurrentOrder: () => {
        set({ currentOrder: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "order-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        orders: state.orders,
        currentOrder: state.currentOrder,
      }),
    }
  )
);
