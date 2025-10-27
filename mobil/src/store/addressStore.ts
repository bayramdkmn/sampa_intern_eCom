import { create } from "zustand";
import { Address } from "../types";
import { api } from "../services/api";
import type { Address as ApiAddress } from "../types/api";
import { useAuthStore } from "./authStore";

const mapApiAddressToLocalAddress = (apiAddress: ApiAddress): Address => {
  
  return {
    id: apiAddress.id,
    title: apiAddress.title || "",
    city: apiAddress.city || "",
    district: apiAddress.district || apiAddress.state_province || "",
    fullAddress: apiAddress.address_line || apiAddress.address_line_1 || "",
    isDefault: apiAddress.is_default || false,
    postalCode: apiAddress.postal_code || "",
    country: apiAddress.country || "TR",
  };
};

interface AddressState {
  addresses: Address[];
  isLoading: boolean;
  error: string | null;
  
  fetchAddresses: () => Promise<void>;
  addAddress: (address: Omit<Address, "id">) => Promise<void>;
  updateAddress: (id: string, address: Partial<Address>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setDefaultAddress: (id: string) => Promise<void>;
  getDefaultAddress: () => Address | null;
  clearError: () => void;
}

export const useAddressStore = create<AddressState>()((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const apiAddresses = await api.getAddresses();
      const localAddresses = apiAddresses.map(mapApiAddressToLocalAddress);
      
      set({ addresses: localAddresses, isLoading: false });
    } catch (error: any) {
      console.error('Adresler yüklenirken hata:', error);
      set({ 
        error: error.message || 'Adresler yüklenemedi', 
        isLoading: false 
      });
    }
  },

  addAddress: async (address: Omit<Address, "id">) => {
    try {
      set({ isLoading: true, error: null });

      const user = useAuthStore.getState().user;
      const userFullName = user?.name || 'Kullanıcı';
      const nameParts = userFullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const newApiAddress = await api.createAddress({
        title: address.title,
        first_name: firstName,
        last_name: lastName,
        phone_number: user?.phone || '',
        city: address.city,
        district: address.district, 
        address_line: address.fullAddress,
        postal_code: address.postalCode || '00000',
        country: address.country || 'TR',
        is_default: address.isDefault,
      });

      const newLocalAddress = mapApiAddressToLocalAddress(newApiAddress);
      
      set((state) => ({
        addresses: [...state.addresses, newLocalAddress],
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Adres eklenirken hata:', error);
      set({ 
        error: error.message || 'Adres eklenemedi', 
        isLoading: false 
      });
      throw error;
    }
  },

  updateAddress: async (id: string, updatedData: Partial<Address>) => {
    try {
      set({ isLoading: true, error: null });

      const updatePayload: any = {};
      
      if (updatedData.title) updatePayload.title = updatedData.title;
      if (updatedData.city) updatePayload.city = updatedData.city;
      if (updatedData.district) updatePayload.district = updatedData.district; // Backend'de district kullanılıyor
      if (updatedData.fullAddress) updatePayload.address_line = updatedData.fullAddress; // Backend'de address_line kullanılıyor
      if (updatedData.postalCode) updatePayload.postal_code = updatedData.postalCode;
      if (updatedData.isDefault !== undefined) updatePayload.is_default = updatedData.isDefault;

      const updatedApiAddress = await api.updateAddress(id, updatePayload);
      const updatedLocalAddress = mapApiAddressToLocalAddress(updatedApiAddress);

      set((state) => ({
        addresses: state.addresses.map(addr =>
          addr.id === id ? updatedLocalAddress : addr
        ),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Adres güncellenirken hata:', error);
      set({ 
        error: error.message || 'Adres güncellenemedi', 
        isLoading: false 
      });
      throw error;
    }
  },

  deleteAddress: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      await api.deleteAddress(id);

      set((state) => ({
        addresses: state.addresses.filter(addr => addr.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Adres silinirken hata:', error);
      set({ 
        error: error.message || 'Adres silinemedi', 
        isLoading: false 
      });
      throw error;
    }
  },

  setDefaultAddress: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const { addresses } = get();
      const currentDefault = addresses.find(addr => addr.isDefault);
      
      if (currentDefault && currentDefault.id !== id) {
        await api.updateAddress(currentDefault.id, { is_default: false });
      }

      await api.updateAddress(id, { is_default: true });

      set((state) => ({
        addresses: state.addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === id // Sadece seçilen adres true, diğerleri false
        })),
        isLoading: false,
      }));
      
    } catch (error: any) {
      console.error('❌ Varsayılan adres ayarlanırken hata:', error);
      set({ 
        error: error.message || 'Varsayılan adres ayarlanamadı', 
        isLoading: false 
      });
      throw error;
    }
  },

  getDefaultAddress: () => {
    const { addresses } = get();
    return addresses.find(addr => addr.isDefault) || null;
  },

  clearError: () => {
    set({ error: null });
  },
}));
