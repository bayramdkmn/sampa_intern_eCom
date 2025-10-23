import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartItem, StoreOrder } from "../types";
import { api } from "../services/api";
import type { Order as ApiOrder } from "../types/api";

// API Order'dan Local StoreOrder'a dönüşüm
const mapApiOrderToLocalOrder = (apiOrder: any): StoreOrder => {
  console.log('🔍 Mapping order:', JSON.stringify(apiOrder, null, 2));
  
  const items: CartItem[] = apiOrder.items.map((item: any) => ({
    product: {
      id: item.product?.toString() || item.product_id?.toString() || "unknown",
      name: item.product_name || "Ürün adı yok",
      price: parseFloat(item.price || "0"),
      image: "https://via.placeholder.com/400", // Backend'de product detayı yok
      category: "Genel",
      description: "Ürün açıklaması yok",
      rating: 0,
      inStock: true,
    },
    quantity: item.quantity || 1,
  }));

  const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  return {
    id: apiOrder.id.toString(),
    orderNumber: `#${apiOrder.id}`, // Backend'de order_number yok, id kullanıyoruz
    items,
    total,
    shippingCost: 0,
    finalTotal: parseFloat(apiOrder.total_price || "0"),
    status: apiOrder.status,
    createdAt: apiOrder.created_at,
    date: apiOrder.created_at,
    address: apiOrder.address || "Adres bilgisi yok",
    shippingAddress: apiOrder.address,
    billingAddress: null,
  };
};

interface OrderState {
  // State
  orders: StoreOrder[];
  currentOrder: StoreOrder | null;
  isLoading: boolean;
  error: string | null;

  // Actions
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
      // Initial State
      orders: [],
      currentOrder: null,
      isLoading: false,
      error: null,

      // 📦 Sipariş Oluştur
      createOrder: async (
        shippingAddressId: string, 
        paymentMethodId?: string, 
        notes?: string
      ) => {
        try {
          set({ isLoading: true, error: null });

          const newApiOrder = await api.createOrder({
            shipping_address: shippingAddressId,
            payment_method: paymentMethodId,
            notes,
          });

          const newLocalOrder = mapApiOrderToLocalOrder(newApiOrder);

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

      // 📋 Siparişleri Backend'den Çek
      fetchOrders: async () => {
        try {
          set({ isLoading: true, error: null });

          const apiOrders = await api.getOrders();
          console.log('📦 API Orders raw:', JSON.stringify(apiOrders, null, 2));
          
          const localOrders = apiOrders.map(mapApiOrderToLocalOrder);
          console.log('📦 Mapped orders:', JSON.stringify(localOrders, null, 2));

          set({ orders: localOrders, isLoading: false });
        } catch (error: any) {
          console.error('Siparişler yüklenirken hata:', error);
          set({
            error: error.message || "Siparişler yüklenirken hata oluştu",
            isLoading: false,
          });
        }
      },

      // 🔍 ID'ye Göre Sipariş Bul
      fetchOrderById: async (orderId: string) => {
        try {
          set({ isLoading: true, error: null });

          // Önce local state'de var mı kontrol et
          const existingOrder = get().orders.find((o) => o.id === orderId);
          if (existingOrder) {
            set({ isLoading: false, currentOrder: existingOrder });
            return existingOrder;
          }

          // Yoksa API'den çek
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

      // ❌ Siparişi İptal Et
      cancelOrder: async (orderId: string) => {
        try {
          set({ isLoading: true, error: null });

          const cancelledApiOrder = await api.cancelOrder(orderId);
          const cancelledLocalOrder = mapApiOrderToLocalOrder(cancelledApiOrder);

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

      // 🧹 Mevcut Siparişi Temizle
      clearCurrentOrder: () => {
        set({ currentOrder: null });
      },

      // 🧹 Hatayı Temizle
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
