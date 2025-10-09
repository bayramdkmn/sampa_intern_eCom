import { create } from "zustand";
import { PaymentMethod } from "../types";

interface PaymentState {
  // State
  paymentMethods: PaymentMethod[];
  
  // Actions
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, "id">) => void;
  updatePaymentMethod: (id: string, paymentMethod: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (id: string) => void;
  setDefaultPaymentMethod: (id: string) => void;
  getDefaultPaymentMethod: () => PaymentMethod | null;
}

// Mock initial data
const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "1",
    cardNumber: "**** **** **** 1234",
    cardHolderName: "AHMET YILMAZ",
    expiryDate: "12/25",
    cardType: "visa",
    isDefault: true,
  },
  {
    id: "2",
    cardNumber: "**** **** **** 5678",
    cardHolderName: "AHMET YILMAZ",
    expiryDate: "08/26",
    cardType: "mastercard",
    isDefault: false,
  },
];

export const usePaymentStore = create<PaymentState>()((set, get) => ({
  // Initial State
  paymentMethods: MOCK_PAYMENT_METHODS,

  // 💳 Yeni Ödeme Yöntemi Ekle
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, "id">) => {
    const { paymentMethods } = get();
    const newPaymentMethod: PaymentMethod = {
      ...paymentMethod,
      id: Date.now().toString(),
      isDefault: paymentMethods.length === 0 ? true : paymentMethod.isDefault || false,
    };
    
    // Eğer yeni kart varsayılan olarak işaretlendiyse, diğerlerini kaldır
    if (newPaymentMethod.isDefault) {
      const updatedPaymentMethods = paymentMethods.map(pm => ({ ...pm, isDefault: false }));
      set({ paymentMethods: [...updatedPaymentMethods, newPaymentMethod] });
    } else {
      set({ paymentMethods: [...paymentMethods, newPaymentMethod] });
    }
  },

  // ✏️ Ödeme Yöntemini Güncelle
  updatePaymentMethod: (id: string, updatedData: Partial<PaymentMethod>) => {
    const { paymentMethods } = get();
    
    // Eğer varsayılan kart değiştiriliyorsa, diğer kartların varsayılanını kaldır
    if (updatedData.isDefault) {
      const newPaymentMethods = paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === id ? true : false,
        ...(pm.id === id ? updatedData : {}),
      }));
      set({ paymentMethods: newPaymentMethods });
    } else {
      const newPaymentMethods = paymentMethods.map(pm =>
        pm.id === id ? { ...pm, ...updatedData } : pm
      );
      set({ paymentMethods: newPaymentMethods });
    }
  },

  // 🗑️ Ödeme Yöntemini Sil
  deletePaymentMethod: (id: string) => {
    const { paymentMethods } = get();
    const paymentMethodToDelete = paymentMethods.find(pm => pm.id === id);
    const newPaymentMethods = paymentMethods.filter(pm => pm.id !== id);
    
    // Eğer silinen kart varsayılan kart ise ve başka kartlar varsa, ilkini varsayılan yap
    if (paymentMethodToDelete?.isDefault && newPaymentMethods.length > 0) {
      newPaymentMethods[0].isDefault = true;
    }
    
    set({ paymentMethods: newPaymentMethods });
  },

  // ⭐ Varsayılan Ödeme Yöntemi Olarak Ayarla
  setDefaultPaymentMethod: (id: string) => {
    const { paymentMethods } = get();
    const newPaymentMethods = paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id,
    }));
    set({ paymentMethods: newPaymentMethods });
  },

  // 🎯 Varsayılan Ödeme Yöntemini Al
  getDefaultPaymentMethod: () => {
    const { paymentMethods } = get();
    return paymentMethods.find(pm => pm.isDefault) || null;
  },
}));

