import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import { useFavoriteStore } from "./favoriteStore";
import { useCartStore } from "./cartStore";
import { useAddressStore } from "./addressStore";
import { usePaymentStore } from "./paymentStore";
import { useOrderStore } from "./orderStore";
import { api } from "../services/api";
import { API_BASE_URL } from "../config/api";
import { tokenStorage } from "../utils/storage";
import type { User as ApiUser } from "../types/api";

// Görsel URL normalize edici (relative ise host ekler)
const normalizeImageUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const base = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

// API User'dan Local User'a dönüşüm
const mapApiUserToLocalUser = (apiUser: ApiUser): User => {
  const rawPhoto = (apiUser.pro_photo || apiUser.profile_image) as string | undefined;
  const avatar = normalizeImageUrl(rawPhoto);

  return {
    id: String(apiUser.id || apiUser.pk),
    name: apiUser.name || `${apiUser.first_name ?? ''} ${apiUser.last_name ?? ''}`.trim(),
    email: apiUser.email,
    avatar,
    phone: apiUser.phone_number,
  };
};

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<User>) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  setToken: (token: string) => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          const response = await api.login({ email, password });

          // Backend'den access veya access_token gelebilir
          const accessToken = response.access_token || response.access;

          if (response.user && accessToken) {
            const localUser = mapApiUserToLocalUser(response.user);
            
            set({
              user: localUser,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            console.log('✅ Login başarılı!');
          } else {
            console.error('❌ Login eksik data:', { hasUser: !!response.user, hasToken: !!accessToken });
            throw new Error('Giriş başarısız');
          }
        } catch (error: any) {
          const errorMessage = error.message || 'Giriş yapılırken bir hata oluştu';
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (firstName: string, lastName: string, email: string, password: string) => {
        try {
          set({ isLoading: true, error: null });

          // 1. Kayıt ol
          const registerResponse = await api.register({
            email,
            password,
            password_confirm: password,
            first_name: firstName,
            last_name: lastName,
          });

          console.log('✅ Kayıt başarılı:', registerResponse);

          // 2. Backend token dönmüyorsa otomatik login yap
          const accessToken = registerResponse.access_token || registerResponse.access;
          
          if (!accessToken) {
            console.log('🔄 Token yok, otomatik login yapılıyor...');
            
            // Kayıt başarılı, şimdi login yap
            const loginResponse = await api.login({ email, password });
            
            console.log('🔍 Login Response Check:', {
              hasUser: !!loginResponse.user,
              hasAccessToken: !!loginResponse.access_token,
              hasAccess: !!loginResponse.access,
              fullResponse: loginResponse,
            });

            // Login'den gelen token'ı al (access veya access_token)
            const loginAccessToken = loginResponse.access_token || loginResponse.access;
            
            if (loginResponse.user && loginAccessToken) {
              const localUser = mapApiUserToLocalUser(loginResponse.user);
              
              set({
                user: localUser,
                token: loginAccessToken,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              
              console.log('✅ Otomatik login başarılı!');
              return;
            } else {
              console.error('❌ Login response eksik:', loginResponse);
            }
          }

          // Backend token döndüyse direkt kullan
          if (registerResponse.user && accessToken) {
            const localUser = mapApiUserToLocalUser(registerResponse.user);
            
            set({
              user: localUser,
              token: accessToken,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            
            console.log('✅ Token ile kayıt başarılı!');
            return;
          }

          // Hiçbiri olmadıysa hata
          throw new Error('Kayıt başarısız - Giriş yapılamadı');
          
        } catch (error: any) {
          const errorMessage = error.message || 'Kayıt olurken bir hata oluştu';
          set({ 
            isLoading: false, 
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ isLoading: true, error: null });

          // TODO: Backend'de password reset endpoint'i eklendiğinde burası güncellenecek
          // await apiService.resetPassword({ email });

          // Şimdilik mock
          await new Promise(resolve => setTimeout(resolve, 1000));

          set({ isLoading: false, error: null });
        } catch (error: any) {
          const errorMessage = error.message || 'Şifre sıfırlama isteği gönderilemedi';
          set({ 
            isLoading: false, 
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });

          // Backend'e logout isteği gönder
          await api.logout();

          // Diğer store'ları temizle
          const { clearFavorites } = useFavoriteStore.getState();
          const { clearCart } = useCartStore.getState();
          
          clearFavorites();
          clearCart();
          
          useAddressStore.setState({ addresses: [] });
          usePaymentStore.setState({ paymentMethods: [] });
          useOrderStore.setState({ orders: [], currentOrder: null });

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Logout error:', error);
          // Hata olsa bile local state'i temizle
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      updateUser: async (userData: Partial<User>) => {
        try {
          // Access token kontrolü – yoksa düzenleme yapma
          const accessToken = await tokenStorage.getAccessToken();
          if (!accessToken) {
            set({
              isLoading: false,
              isAuthenticated: false,
              user: null,
              error: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
            });
            throw new Error('AUTH_REQUIRED');
          }

          const currentUser = get().user;
          if (!currentUser) {
            throw new Error('Kullanıcı oturumu bulunamadı');
          }

          set({ isLoading: true, error: null });

          // Backend'e güncelleme isteği gönder
          const updatedApiUser = await api.updateUserProfile({
            first_name: userData.name?.split(' ')[0],
            last_name: userData.name?.split(' ').slice(1).join(' '),
            phone_number: userData.phone,
          });

          const updatedLocalUser = mapApiUserToLocalUser(updatedApiUser);

          set({
            user: updatedLocalUser,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.message || 'Profil güncellenirken bir hata oluştu';
          set({ 
            isLoading: false, 
            error: errorMessage,
          });
          throw error;
        }
      },

      fetchUserProfile: async () => {
        try {
          set({ isLoading: true, error: null });
          const profile = await api.getUserProfile();
          console.log('👤 getUserProfile raw:', profile);
          const localUser = mapApiUserToLocalUser(profile as ApiUser);
          console.log('👤 mapped avatar:', localUser.avatar);
          set({ user: localUser, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.message || 'Profil alınamadı';
          set({ isLoading: false, error: errorMessage });
          throw error;
        }
      },

      setToken: (token: string) => {
        set({ token });
      },

      checkAuth: async () => {
        try {
          const isAuth = await api.isAuthenticated();
          
          if (isAuth) {
            const currentUser = await api.getCurrentUser();
            if (currentUser) {
              const localUser = mapApiUserToLocalUser(currentUser);
              set({
                user: localUser,
                isAuthenticated: true,
              });
            }
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
            });
          }
        } catch (error) {
          console.error('Auth check error:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
          });
        }
      },

      clearError: () => {
        set({ error: null });
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

