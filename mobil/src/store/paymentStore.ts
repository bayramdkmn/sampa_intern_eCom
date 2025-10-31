import { create } from "zustand";
import { PaymentMethod } from "../types";
import { api } from "../services/api";
import type { PaymentCard as ApiPaymentCard, UpdateCardData } from "../types/api";

const detectCardType = (cardNumber: string): 'visa' | 'mastercard' | 'amex' => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  if (cleanNumber.length >= 4) {
    const lastFour = cleanNumber.slice(-4);
    
    if (lastFour.startsWith('4')) return 'visa';
    
    if (lastFour.startsWith('5') || lastFour.startsWith('2')) return 'mastercard';
    
    if (lastFour.startsWith('3')) return 'amex';
  }
  
  return 'visa';
};

const mapApiCardToLocalPaymentMethod = (apiCard: any): PaymentMethod => {
  
  const expiryYear = apiCard.expiry_year;
  const yearString = typeof expiryYear === 'string' ? expiryYear : String(expiryYear);
  const shortYear = yearString.slice(-2);
  
  return {
    id: apiCard.id,
    cardNumber: apiCard.card_number,
    cardHolderName: apiCard.card_holder_name,
    expiryDate: `${apiCard.expiry_month}/${shortYear}`,
    cardType: detectCardType(apiCard.card_number),
    isDefault: apiCard.is_primary || false,
    cvv: apiCard.cvv,
  };
};

interface PaymentState {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: string | null;
  
  fetchPaymentMethods: () => Promise<void>;
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, "id">) => Promise<void>;
  updatePaymentMethod: (id: string, paymentMethod: Partial<PaymentMethod>) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setDefaultPaymentMethod: (id: string) => Promise<void>;
  getDefaultPaymentMethod: () => PaymentMethod | null;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>()((set, get) => ({
  paymentMethods: [],
  isLoading: false,
  error: null,

  fetchPaymentMethods: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const apiCards = await api.getCards();
      const localPaymentMethods = apiCards.map(mapApiCardToLocalPaymentMethod);
      
      set({ paymentMethods: localPaymentMethods, isLoading: false });
    } catch (error: any) {
      console.error('Ödeme yöntemleri yüklenirken hata:', error);
      set({ 
        error: error.message || 'Ödeme yöntemleri yüklenemedi', 
        isLoading: false 
      });
    }
  },

  addPaymentMethod: async (paymentMethod: Omit<PaymentMethod, "id">) => {
    try {
      set({ isLoading: true, error: null });

      if (paymentMethod.isDefault) {
        const { paymentMethods } = get();
        const currentPrimary = paymentMethods.find(pm => pm.isDefault);
        
        if (currentPrimary) {
          await api.updateCard(currentPrimary.id, { is_primary: false } as UpdateCardData);
        }
      }

      const [month, year] = paymentMethod.expiryDate.split('/');

      const newApiCard = await api.createCard({
        card_holder_name: paymentMethod.cardHolderName,
        card_number: paymentMethod.cardNumber.replace(/\s/g, ""),
        expiry_month: month,
        expiry_year: `20${year}`,
        cvv: paymentMethod.cvv || '000',
        brand: paymentMethod.cardType,
        is_primary: paymentMethod.isDefault,
      });

      const newLocalPaymentMethod = mapApiCardToLocalPaymentMethod(newApiCard);
      
      set((state) => ({
        paymentMethods: [
          ...state.paymentMethods.map(pm => ({
            ...pm,
            isDefault: paymentMethod.isDefault ? false : pm.isDefault
          })),
          newLocalPaymentMethod
        ],
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Ödeme yöntemi eklenirken hata:', error);
      set({ 
        error: error.message || 'Ödeme yöntemi eklenemedi', 
        isLoading: false 
      });
      throw error;
    }
  },

  updatePaymentMethod: async (id: string, updatedData: Partial<PaymentMethod>) => {
    try {
      set({ isLoading: true, error: null });

      const updatePayload: any = {};
      
      if (updatedData.cardHolderName) {
        updatePayload.card_holder_name = updatedData.cardHolderName;
      }
      if (updatedData.expiryDate) {
        const [month, year] = updatedData.expiryDate.split('/');
        updatePayload.expiry_month = month;
        updatePayload.expiry_year = `20${year}`;
      }
      if (updatedData.isDefault !== undefined) {
        updatePayload.is_primary = updatedData.isDefault;
      }

      const updatedApiCard = await api.updateCard(id, updatePayload);
      const updatedLocalPaymentMethod = mapApiCardToLocalPaymentMethod(updatedApiCard);

      set((state) => ({
        paymentMethods: state.paymentMethods.map(pm =>
          pm.id === id ? updatedLocalPaymentMethod : pm
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Ödeme yöntemi güncellenirken hata:', error);
      set({ 
        error: error.message || 'Ödeme yöntemi güncellenemedi', 
        isLoading: false 
      });
      throw error;
    }
  },

  deletePaymentMethod: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      await api.deleteCard(id);

      set((state) => ({
        paymentMethods: state.paymentMethods.filter(pm => pm.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Ödeme yöntemi silinirken hata:', error);
      set({ 
        error: error.message || 'Ödeme yöntemi silinemedi', 
        isLoading: false 
      });
      throw error;
    }
  },

  setDefaultPaymentMethod: async (id: string) => {
    try {

      const { paymentMethods } = get();
      const currentPrimary = paymentMethods.find(pm => pm.isDefault);
      
      
      if (currentPrimary && currentPrimary.id !== id) {
        await api.updateCard(currentPrimary.id, { is_primary: false });
      }

      await api.updateCard(id, { is_primary: true });

      set((state) => ({
        paymentMethods: state.paymentMethods.map(pm => ({
          ...pm,
          isDefault: pm.id === id 
        })),
      }));
      
    } catch (error: any) {
      console.error('❌ Varsayılan ödeme yöntemi ayarlanırken hata:', error);
      set({ 
        error: error.message || 'Varsayılan ödeme yöntemi ayarlanamadı'
      });
      throw error;
    }
  },

  getDefaultPaymentMethod: () => {
    const { paymentMethods } = get();
    return paymentMethods.find(pm => pm.isDefault) || null;
  },

  clearError: () => {
    set({ error: null });
  },
}));
