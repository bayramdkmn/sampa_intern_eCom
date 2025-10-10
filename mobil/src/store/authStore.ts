import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";

// 🔥 ZUSTAND vs REDUX:
// Redux'ta: actions, reducers, types ayrı ayrı dosyalar
// Zustand'da: Hepsi tek yerde, çok daha basit!

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions (Redux'taki dispatch'e gerek yok, direkt çağırıyorsun!)
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  // persist middleware: AsyncStorage'a otomatik kaydeder (Redux Persist gibi ama çok kolay!)
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // 🔐 Login Action
      // Redux'ta: dispatch(loginAction(email, password))
      // Zustand'da: login(email, password) - Direkt çağır!
      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });

          // TODO: Gerçek API çağrısı yap
          // const response = await fetch('YOUR_API/login', {
          //   method: 'POST',
          //   body: JSON.stringify({ email, password })
          // });
          // const data = await response.json();

          // Şimdilik mock data
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

      // 📝 Register Action
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

      // 🔄 Reset Password Action
      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true });

          // TODO: Gerçek API çağrısı
          // const response = await fetch('YOUR_API/reset-password', {
          //   method: 'POST',
          //   body: JSON.stringify({ email })
          // });

          // Şimdilik sadece loading state'i değiştir
          await new Promise(resolve => setTimeout(resolve, 1000)); // Simüle edilmiş API çağrısı

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // 🚪 Logout Action
      // Redux'ta: dispatch({ type: 'LOGOUT' })
      // Zustand'da: logout() - Bu kadar basit!
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      // ✏️ Update User Action
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      // 🔑 Set Token Action
      setToken: (token: string) => {
        set({ token });
      },
    }),
    {
      name: "auth-storage", // AsyncStorage key'i
      storage: createJSONStorage(() => AsyncStorage), // AsyncStorage kullan
      // Sadece bunları kaydet (token ve user yeterli)
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

