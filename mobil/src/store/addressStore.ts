import { create } from "zustand";
import { Address } from "../types";

interface AddressState {
  // State
  addresses: Address[];
  
  // Actions
  addAddress: (address: Omit<Address, "id">) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  deleteAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  getDefaultAddress: () => Address | null;
}

// Mock initial data
const MOCK_ADDRESSES: Address[] = [
  {
    id: "1",
    title: "Ev",
    fullName: "Ahmet Yılmaz",
    phone: "+90 555 123 45 67",
    city: "İstanbul",
    district: "Kadıköy",
    fullAddress: "Caferağa Mahallesi, Moda Caddesi No: 123 Daire: 5",
    isDefault: true,
  },
  {
    id: "2",
    title: "İş",
    fullName: "Ahmet Yılmaz",
    phone: "+90 555 123 45 67",
    city: "İstanbul",
    district: "Şişli",
    fullAddress: "Mecidiyeköy Mahallesi, Büyükdere Caddesi No: 45 Kat: 8",
    isDefault: false,
  },
];

export const useAddressStore = create<AddressState>()((set, get) => ({
  // Initial State
  addresses: MOCK_ADDRESSES,

  // 📍 Yeni Adres Ekle
  addAddress: (address: Omit<Address, "id">) => {
    const { addresses } = get();
    const newAddress: Address = {
      ...address,
      id: Date.now().toString(),
      isDefault: addresses.length === 0 ? true : address.isDefault || false,
    };
    
    // Eğer yeni adres varsayılan olarak işaretlendiyse, diğerlerini kaldır
    if (newAddress.isDefault) {
      const updatedAddresses = addresses.map(addr => ({ ...addr, isDefault: false }));
      set({ addresses: [...updatedAddresses, newAddress] });
    } else {
      set({ addresses: [...addresses, newAddress] });
    }
  },

  updateAddress: (id: string, updatedData: Partial<Address>) => {
    const { addresses } = get();
    
    if (updatedData.isDefault) {
      const newAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === id ? true : false,
        ...(addr.id === id ? updatedData : {}),
      }));
      set({ addresses: newAddresses });
    } else {
      const newAddresses = addresses.map(addr =>
        addr.id === id ? { ...addr, ...updatedData } : addr
      );
      set({ addresses: newAddresses });
    }
  },

  // 🗑️ Adresi Sil
  deleteAddress: (id: string) => {
    const { addresses } = get();
    const addressToDelete = addresses.find(addr => addr.id === id);
    const newAddresses = addresses.filter(addr => addr.id !== id);
    
    // Eğer silinen adres varsayılan adres ise ve başka adresler varsa, ilkini varsayılan yap
    if (addressToDelete?.isDefault && newAddresses.length > 0) {
      newAddresses[0].isDefault = true;
    }
    
    set({ addresses: newAddresses });
  },

  // ⭐ Varsayılan Adres Olarak Ayarla
  setDefaultAddress: (id: string) => {
    const { addresses } = get();
    const newAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    }));
    set({ addresses: newAddresses });
  },

  // 🎯 Varsayılan Adresi Al
  getDefaultAddress: () => {
    const { addresses } = get();
    return addresses.find(addr => addr.isDefault) || null;
  },
}));

// 🎯 KULLANIM ÖRNEĞİ:
// 
// import { useAddressStore } from '../store/addressStore';
// 
// function AddressesScreen() {
//   const { addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddressStore();
//   
//   const handleAddAddress = () => {
//     addAddress({
//       title: "Ev",
//       fullName: "Ahmet Yılmaz",
//       phone: "+90 555 123 45 67",
//       city: "İstanbul",
//       district: "Kadıköy",
//       fullAddress: "Moda Caddesi No: 123",
//       isDefault: false,
//     });
//   };
//   
//   return (
//     <View>
//       {addresses.map(address => (
//         <AddressCard key={address.id} address={address} />
//       ))}
//     </View>
//   );
// }

