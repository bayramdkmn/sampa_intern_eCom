import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import { useFavoriteStore } from "./favoriteStore";
import { useCartStore } from "./cartStore";
import { useAddressStore } from "./addressStore";
import { usePaymentStore } from "./paymentStore";
import { useOrderStore } from "./orderStore";



interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          // TODO: Gerçek API çağrısı yap
          // const response = await fetch('YOUR_API/login', {
          //   method: 'POST',
          //   body: JSON.stringify({ email, password })
          // });
          // const data = await response.json();

          const mockUser: User = {
            id: "1",
            name: "Bayram Dikmen",
            email: email,
            avatar: "https://via.placeholder.com/150",
            phone: "+90 555 123 45 67",
          };

          const mockToken = "mock-jwt-token-12345";

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string) => {
        try {
          set({ isLoading: true });

          // TODO: Gerçek API çağrısı
          // const response = await fetch('YOUR_API/register', {
          //   method: 'POST',
          //   body: JSON.stringify({ name, email, password })
          // });

          const mockUser: User = {
            id: "2",
            name: name,
            email: email,
            avatar: "https://via.placeholder.com/150",
          };

          const mockToken = "mock-jwt-token-67890";

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true });

          // TODO: Gerçek API çağrısı
          // const response = await fetch('YOUR_API/reset-password', {
          //   method: 'POST',
          //   body: JSON.stringify({ email })
          // });

          await new Promise(resolve => setTimeout(resolve, 1000)); // Simüle edilmiş API çağrısı

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Diğer store'ları temizle
        const { clearFavorites } = useFavoriteStore.getState();
        const { clearCart } = useCartStore.getState();
        
        // Store'ları temizle
        clearFavorites();
        clearCart();
        
        // Adresleri ve ödeme yöntemlerini temizle (mock data'yı sıfırla)
        // Store'ları sıfırla
        useAddressStore.setState({ addresses: [] });
        usePaymentStore.setState({ paymentMethods: [] });
        useOrderStore.setState({ orders: [], currentOrder: null });

        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setToken: (token: string) => {
        set({ token });
      },
    }),
    {
      name: "auth-storage", 
      storage: createJSONStorage(() => AsyncStorage), 
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// 🎯 KULLANIM ÖRNEĞİ:
// 
// import { useAuthStore } from '../store/authStore';
// 
// function LoginScreen() {
//   const { login, user, isLoading } = useAuthStore();
//   
//   const handleLogin = async () => {
//     await login('ahmet@example.com', '123456');
//     // Giriş yapıldı, user otomatik güncellendi!
//   };
//   
//   return (
//     <View>
//       {user ? <Text>Hoşgeldin {user.name}</Text> : <Text>Giriş Yap</Text>}
//     </View>
//   );
// }

