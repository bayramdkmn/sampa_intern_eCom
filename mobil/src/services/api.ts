import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/api';
import { tokenStorage, userStorage, clearAuthData } from '../utils/storage';
import type {
  User,
  UserProfile,
  Address,
  CreateAddressData,
  UpdateAddressData,
  PaymentCard,
  CreateCardData,
  UpdateCardData,
  Product,
  Order,
  CreateOrderData,
  AuthResponse,
  RegisterData,
  LoginData,
  ChangePasswordData,
  ApiError,
  CartItem,
  AddToCartData,
} from '../types/api';

/**
 * API Client Class - Web'dekinin aynısı
 * Tüm backend isteklerini yönetir
 */
class ApiClient {
  private api: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Request & Response Interceptors
   */
  private setupInterceptors() {
    // Request interceptor - Her isteğe token ekle
    this.api.interceptors.request.use(
      async (config) => {
        const token = await tokenStorage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        

        
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.api(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await tokenStorage.getRefreshToken();
            if (!refreshToken) throw new Error('No refresh token');

              const response = await this.api.post<{ access: string }>(
                '/users/token/refresh/',
                { refresh: refreshToken }
              );

              const newAccessToken = response.data.access;
            await tokenStorage.setAccessToken(newAccessToken);

            this.refreshSubscribers.forEach((cb) => cb(newAccessToken));
            this.refreshSubscribers = [];

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return this.api(originalRequest);
          } catch (refreshError) {
            console.error('🔐 Token refresh failed:', refreshError);
            await clearAuthData();
            this.refreshSubscribers = [];
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  /**
   * Hata Yönetimi
   */
  private handleError(error: AxiosError): ApiError {
    
    const apiError: ApiError = {
      message: 'Bir hata oluştu',
      status: error.response?.status,
    };

    if (error.response?.data) {
      const errorData = error.response.data as any;
      
      // Backend'den gelen tüm olası hata formatlarını kontrol et
      apiError.message = 
        errorData.message || 
        errorData.detail || 
        errorData.error || 
        errorData.non_field_errors?.[0] ||
        JSON.stringify(errorData);
      
      apiError.errors = errorData.errors || errorData.field_errors || errorData;
    } else if (error.request) {
      apiError.message = 'Sunucuya bağlanılamıyor. İnternet bağlantınızı kontrol edin.';
    } else {
      apiError.message = error.message || 'Bir hata oluştu';
    }

    console.error('❌ API Error:', apiError);
    return apiError;
  }

  // ==================== AUTH ====================

  async login(data: LoginData): Promise<AuthResponse> {
    
    const response = await this.api.post<AuthResponse>('/users/login/', data);
    

    // Backend'den access veya access_token gelebilir
    const accessToken = response.data.access_token || response.data.access;
    const refreshToken = response.data.refresh_token || response.data.refresh;

    if (accessToken) {
      await tokenStorage.setAccessToken(accessToken);
    }
    if (refreshToken) {
      await tokenStorage.setRefreshToken(refreshToken);
    }
    if (response.data.user) {
      await userStorage.setUserData(response.data.user);
    }

    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    
    const response = await this.api.post<AuthResponse>('/users/register/', data);
    

    if (response.data.access_token) {
      await tokenStorage.setAccessToken(response.data.access_token);
    }
    if (response.data.refresh_token) {
      await tokenStorage.setRefreshToken(response.data.refresh_token);
    }
    if (response.data.user) {
      await userStorage.setUserData(response.data.user);
    }

    return response.data;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await tokenStorage.getRefreshToken();
      if (refreshToken) {
        await this.api.post('/users/logout/', { refresh: refreshToken });
      }
    } finally {
      await clearAuthData();
    }
  }

  // ==================== USER ====================

  async getUserProfile(): Promise<UserProfile> {
    const response = await this.api.get<UserProfile>('/users/me/');
    return response.data;
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    const response = await this.api.patch<User>('/users/me/', data);
    await userStorage.setUserData(response.data);
    return response.data;
  }

  /**
   * Profil fotoğrafı yükle (multipart)
   */
  async uploadProfilePhoto(fileUri: string): Promise<User> {
    const formData = new FormData();
    const filename = fileUri.split('/').pop() || 'avatar.jpg';
    const ext = filename.split('.').pop()?.toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'application/octet-stream';

    // React Native FormData file objesi
    // Backend beklenen alan adı: pro_photo
    formData.append('pro_photo' as any, {
      uri: fileUri as any,
      name: filename,
      type: mime,
    } as any);

    const response = await this.api.patch<User>(
      '/users/me/',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    await userStorage.setUserData(response.data);
    return response.data;
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    const response = await this.api.patch<{ message: string }>('/users/password/change/', data);
    return response.data;
  }

  // ==================== ADDRESSES ====================

  async getAddresses(): Promise<Address[]> {
    const response = await this.api.get<Address[]>('/users/addresses/');
    return response.data;
  }

  async getAddress(id: string | number): Promise<Address> {
    const response = await this.api.get<Address>(`/users/addresses/${id}/`);
    return response.data;
  }

  async createAddress(data: CreateAddressData): Promise<Address> {
    const response = await this.api.post<Address>('/users/addresses/', data);
    return response.data;
  }

  async updateAddress(id: string | number, data: UpdateAddressData): Promise<Address> {
    const response = await this.api.patch<Address>(`/users/addresses/${id}/`, data);
    return response.data;
  }

  async deleteAddress(id: string | number): Promise<void> {
    await this.api.delete(`/users/addresses/${id}/`);
  }

  // ==================== PAYMENT CARDS ====================

  async getCards(): Promise<PaymentCard[]> {
    const response = await this.api.get<PaymentCard[]>('/users/cards/');
    return response.data;
  }

  async getCard(id: string | number): Promise<PaymentCard> {
    const response = await this.api.get<PaymentCard>(`/users/cards/${id}/`);
    return response.data;
  }

  async createCard(data: CreateCardData): Promise<PaymentCard> {
    const response = await this.api.post<PaymentCard>('/users/cards/', data);
    return response.data;
  }

  async updateCard(id: string | number, data: UpdateCardData): Promise<PaymentCard> {
    const response = await this.api.patch<PaymentCard>(`/users/cards/${id}/`, data);
    return response.data;
  }

  async deleteCard(id: string | number): Promise<void> {
    await this.api.delete(`/users/cards/${id}/`);
  }

  // ==================== PRODUCTS ====================

  async getProducts(): Promise<Product[]> {
    const response = await this.api.get<Product[]>('/products/products/');
    return response.data;
  }

  async getProduct(id: string | number): Promise<Product> {
    const response = await this.api.get<Product>(`/products/products/${id}/`);
    return response.data;
  }

  // ==================== ORDERS ====================

  async getOrders(): Promise<Order[]> {
    const response = await this.api.get<Order[]>('/orders/my-orders/');
    return response.data;
  }

  async createOrder(data: CreateOrderData): Promise<Order> {
    const response = await this.api.post<Order>('/orders/create/', data);
    return response.data;
  }

  async getOrder(id: string): Promise<Order> {
    const response = await this.api.get<Order>(`/orders/${id}/`);
    return response.data;
  }

  async cancelOrder(id: string): Promise<Order> {
    const response = await this.api.put<Order>(`/orders/${id}/cancel/`, { status: 'cancelled' });
    return response.data;
  }

  // ==================== CART ====================

  async getCartItems(): Promise<CartItem[]> {
    try {
      const response = await this.api.get<any>('/cart/');
      
      // Backend response'unu kontrol et
      let cartItems: any[] = [];
      if (Array.isArray(response.data)) {
        cartItems = response.data;
      } else if (response.data && Array.isArray(response.data.items)) {
        cartItems = response.data.items;
      } else if (response.data && response.data.results) {
        cartItems = response.data.results;
      }
      
      // Backend'den gelen item'ları CartItem formatına çevir
      return cartItems.map(item => ({
        id: item.id.toString(),
        product: {
          id: item.id.toString(),
          name: item.product_name || 'Ürün',
          price: item.product?.price || item.product_price || 0,
          image: '',
          category: '',
          stock: 1,
          description: '',
          rating_average: '0',
          rating_count: 0,
          slug: '',
          isActive: true,
          brand: '',
          created_at: '',
          updated_at: '',
          main_window_display: true
        },
        quantity: item.quantity
      }));
    } catch (error) {
      console.error('❌ getCartItems error:', error);
      return [];
    }
  }

  async addToCart(data: AddToCartData): Promise<CartItem> {
    const response = await this.api.post<CartItem>('/cart/add/', data);
    return response.data;
  }

  async updateCartItem(productId: number, quantity: number): Promise<CartItem> {
    // Backend'de update endpoint'i yok, mevcut endpoint'leri kullanacağız
    if (quantity <= 0) {
      // Miktar 0 veya negatif, ürünü sepetten çıkar
      await this.api.post('/cart/remove/', { product_id: productId });
      throw new Error('Ürün sepetten çıkarıldı');
    }

    // Önce mevcut sepeti al
    const cartResponse = await this.api.get<any>('/cart/');
    let cartItems: any[] = [];
    
    // Backend response'unu kontrol et
    if (Array.isArray(cartResponse.data)) {
      cartItems = cartResponse.data;
    } else if (cartResponse.data && Array.isArray(cartResponse.data.items)) {
      cartItems = cartResponse.data.items;
    } else if (cartResponse.data && cartResponse.data.results) {
      cartItems = cartResponse.data.results;
    }
    
    const existingItem = cartItems.find(item => 
      item.product?.id === productId || 
      item.product_id === productId ||
      item.id === productId
    );
    
    if (existingItem) {
      const currentQuantity = existingItem.quantity;
      const difference = quantity - currentQuantity;
      
      if (difference > 0) {
        // Artırma gerekiyor - add endpoint'ini kullan
        await this.api.post('/cart/add/', { product_id: productId, quantity: difference });
      } else if (difference < 0) {
        // Azaltma gerekiyor - decrease endpoint'ini kullan
        for (let i = 0; i < Math.abs(difference); i++) {
          await this.api.post('/cart/decrease/', { product_id: productId });
        }
      }
    } else {
      // Ürün sepette yok, ekle
      await this.api.post('/cart/add/', { product_id: productId, quantity: quantity });
    }
    
    // Güncellenmiş sepeti döndür
    const updatedCart = await this.api.get<any>('/cart/');
    let updatedCartItems: any[] = [];
    
    if (Array.isArray(updatedCart.data)) {
      updatedCartItems = updatedCart.data;
    } else if (updatedCart.data && Array.isArray(updatedCart.data.items)) {
      updatedCartItems = updatedCart.data.items;
    } else if (updatedCart.data && updatedCart.data.results) {
      updatedCartItems = updatedCart.data.results;
    }
    
    const updatedItem = updatedCartItems.find(item => 
      item.product?.id === productId || 
      item.product_id === productId ||
      item.id === productId
    );
    
    if (!updatedItem) {
      throw new Error('Ürün sepetten bulunamadı');
    }
    
    // Backend'den gelen item'ı CartItem formatına çevir
    return {
      id: updatedItem.id.toString(),
      product: {
        id: updatedItem.product?.id?.toString() || updatedItem.product_id?.toString() || updatedItem.id.toString(),
        name: updatedItem.product_name || updatedItem.product?.name || 'Ürün',
        price: updatedItem.product?.price || updatedItem.product_price || 0,
        image: updatedItem.product?.image || '',
        category: updatedItem.product?.category || '',
        stock: updatedItem.product?.stock || 1,
        description: updatedItem.product?.description || '',
        rating_average: updatedItem.product?.rating_average || '0',
        rating_count: updatedItem.product?.rating_count || 0,
        slug: updatedItem.product?.slug || '',
        isActive: updatedItem.product?.isActive || true,
        brand: updatedItem.product?.brand || '',
        created_at: updatedItem.product?.created_at || '',
        updated_at: updatedItem.product?.updated_at || '',
        main_window_display: updatedItem.product?.main_window_display || true
      },
      quantity: updatedItem.quantity
    };
  }

  async removeFromCart(productId: number): Promise<void> {
    await this.api.delete('/cart/remove/', {
      data: { product_id: productId },
    });
  }


  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await tokenStorage.getAccessToken();
      if (!token) return false;
      
      // Token var mı ve geçerli mi kontrol et
      await this.api.get('/users/me/');
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.api.get<User>('/users/me/');
      return response.data;
    } catch (error) {
      return null;
    }
  }
}

// Singleton instance export
export const api = new ApiClient();
export default api;
