import {
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
  PaginatedResponse
} from "../types/api";

export class ClientApi {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  }

  private async makeRequest<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth: boolean = false
  ): Promise<T> {
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };


    const token = localStorage.getItem('access_token');
    if (token && !skipAuth) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log('🚀 Client API Request:', {
        endpoint,
        method: config.method,
        headers: config.headers,
        body: config.body
      });

      const doFetch = async (): Promise<{ response: Response; data: any }> => {
        const response = await fetch(`${this.baseURL}${endpoint}`, config);

        const methodUpper = String(config.method || 'GET').toUpperCase();
        const isNoContent = response.status === 204 || methodUpper === 'DELETE';

        let data: any = undefined;
        if (!isNoContent) {
          const contentType = response.headers.get('content-type') || '';
          const hasJson = contentType.includes('application/json');
          if (hasJson) {
            try {
              data = await response.json();
              console.log('📡 Client API Response Data:', data);
            } catch (e) {
              const text = await response.text();
              console.log('📡 Client API Response Text:', text);
              data = text ? { detail: text } : undefined;
            }
          } else {
            const text = await response.text();
            if (text) {
              console.log('📡 Client API Response Text:', text);
              data = { detail: text };
            }
          }
        }
        return { response, data };
      };

      let { response, data } = await doFetch();

      if (response.status === 401 && !skipAuth) {
        try {
          await this.refreshToken();
          const newToken = localStorage.getItem('access_token');
          if (newToken) {
            (config.headers as HeadersInit) = {
              ...(config.headers as HeadersInit),
              Authorization: `Bearer ${newToken}`,
            };
          }
          ({ response, data } = await doFetch());
        } catch (refreshErr) {
          console.error('🔐 Refresh token failed:', refreshErr);
        }
      }

      if (!response.ok) {
        console.log('❌ Client API Error Response:', {
          status: response.status,
          data: data
        });
        throw {
          message: (data && (data.message || data.detail || data.error)) || 'Bir hata oluştu',
          errors: (data && (data.errors || data.field_errors)) || {},
          status: response.status,
        } as ApiError;
      }

      return data as T;
    } catch (error) {
      if (error instanceof TypeError) {
        console.log('🌐 Network Error:', error.message);
        throw {
          message: 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.',
        } as ApiError;
      }
      throw error as any;
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const payload = {
      email: data.email,
      password: data.password,
    };

    console.log('🚀 Login payload:', payload);

    const response = await this.makeRequest<AuthResponse>("/users/login/", {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true); 

    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    }

    return response;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
      password_confirm: data.password_confirm,
    };

    console.log('🚀 Register payload:', payload);

    const response = await this.makeRequest<AuthResponse>("/users/register/", {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true); 

    return response;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await this.makeRequest("/users/logout/", {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
        });
        console.log('🚀 Logout request sent with refresh token');
      } else {
        console.log('⚠️ No refresh token found, skipping Django logout');
      }
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  async refreshToken(): Promise<{ access_token: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('Refresh token bulunamadı');
    }

    const response = await this.makeRequest<{ access_token: string }>(
      "/users/refresh/",
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    localStorage.setItem('access_token', response.access_token);
    return response;
  }

  async getUserProfile(): Promise<UserProfile> {
    const candidateEndpoints = [
      "/users/me/",
      "/users/profile/",
      "/user/profile/",
    ];

    let lastError: any = null;
    for (const endpoint of candidateEndpoints) {
      try {
        return await this.makeRequest<UserProfile>(endpoint);
      } catch (e: any) {
        lastError = e;
        if (e && typeof e === 'object' && 'status' in e && e.status !== 404) {
          throw e;
        }
      }
    }
    throw lastError || new Error('Profil endpointi bulunamadı');
  }


  async getAddresses(): Promise<Address[]> {
    return await this.makeRequest<Address[]>("/users/addresses/");
  }

  async getAddress(id: string | number): Promise<Address> {
    return await this.makeRequest<Address>(`/users/addresses/${id}/`);
  }

  async createAddress(data: CreateAddressData): Promise<Address> {
    return await this.makeRequest<Address>("/users/addresses/", {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAddress(id: string | number, data: UpdateAddressData): Promise<Address> {
    return await this.makeRequest<Address>(`/users/addresses/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string | number): Promise<void> {
    await this.makeRequest(`/users/addresses/${id}/`, {
      method: 'DELETE',
    });
  }

  async getCards(): Promise<PaymentCard[]> {
    return await this.makeRequest<PaymentCard[]>("/users/cards/");
  }

  async getCard(id: string | number): Promise<PaymentCard> {
    return await this.makeRequest<PaymentCard>(`/users/cards/${id}/`);
  }

  async createCard(data: CreateCardData): Promise<PaymentCard> {
    return await this.makeRequest<PaymentCard>("/users/cards/", {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCard(id: string | number, data: UpdateCardData): Promise<PaymentCard> {
    return await this.makeRequest<PaymentCard>(`/users/cards/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCard(id: string | number): Promise<void> {
    await this.makeRequest(`/users/cards/${id}/`, {
      method: 'DELETE',
    });
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      return await this.makeRequest<{ message: string }>("/users/password/change/", {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      if (error.status === 401) {
        try {
          await this.refreshToken();
          return await this.makeRequest<{ message: string }>("/users/password/change/", {
            method: 'PATCH',
            body: JSON.stringify(data),
          });
        } catch (refreshError) {
          console.error('Token yenileme başarısız:', refreshError);
          throw error; 
        }
      }
      throw error; 
    }
  }

  async getProducts(): Promise<Product[]> {
    return await this.makeRequest<Product[]>("/products/products/", {}, true);
  }

  async getProduct(id: string): Promise<Product> {
    return await this.makeRequest<Product>(`/products/products/${id}/`, {}, true);
  }

  async getOrders(): Promise<Order[]> {
    const candidateEndpoints = [
      "/orders/",
      "/users/orders/",
    ];
    let lastError: any = null;
    for (const endpoint of candidateEndpoints) {
      try {
        return await this.makeRequest<Order[]>(endpoint);
      } catch (e: any) {
        lastError = e;
        if (e && typeof e === 'object' && 'status' in e && e.status !== 404) {
          throw e;
        }
      }
    }
    throw lastError || new Error('Sipariş endpointi bulunamadı');
  }

  async createOrder(data: CreateOrderData): Promise<Order> {
    return await this.makeRequest<Order>("/orders/", {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getOrder(id: string): Promise<Order> {
    return await this.makeRequest<Order>(`/orders/${id}/`);
  }

  async cancelOrder(id: string): Promise<Order> {
    return await this.makeRequest<Order>(`/orders/${id}/cancel/`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'cancelled' }),
    });
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  clearTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Cart Methods
  async getCartItems(): Promise<any[]> {
    try {
      const response = await this.makeRequest<any[]>('/cart/');
      return response;
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  }

  async addToCart(productId: number, quantity: number): Promise<any> {
    try {
      const response = await this.makeRequest<any>('/cart/add', {
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
        }),
      });
      return response;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItem(productId: number, quantity: number): Promise<any> {
    try {
      const response = await this.makeRequest<any>('/cart/update', {
        method: 'PUT',
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
        }),
      });
      return response;
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeFromCart(productId: number): Promise<any> {
    try {
      const response = await this.makeRequest<any>('/cart/remove', {
        method: 'DELETE',
        body: JSON.stringify({
          product_id: productId,
        }),
      });
      return response;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // User Profile Methods
  async updateUserProfile(data: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  }): Promise<any> {
    try {
      const response = await this.makeRequest<any>('/users/me/', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  async updateUserProfileWithPhoto(
    profileData: {
      first_name?: string;
      last_name?: string;
      phone_number?: string;
    },
    photoFile?: File
  ): Promise<any> {
    try {
      const formData = new FormData();
      
      // Text verilerini ekle
      if (profileData.first_name) {
        formData.append('first_name', profileData.first_name);
      }
      if (profileData.last_name) {
        formData.append('last_name', profileData.last_name);
      }
      if (profileData.phone_number) {
        formData.append('phone_number', profileData.phone_number);
      }
      
      // Fotoğraf dosyasını ekle
      if (photoFile) {
        formData.append('pro_photo', photoFile);
      }

      const token = localStorage.getItem('access_token');
      const headers: HeadersInit = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}/users/me/`, {
        method: 'PATCH',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorBody);
        } catch {
          errorData = { detail: errorBody };
        }

        throw {
          message: errorData.message || errorData.detail || 'Bir hata oluştu',
          errors: errorData.errors || errorData.field_errors || {},
          status: response.status,
        };
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating user profile with photo:', error);
      throw error;
    }
  }
}

export const clientApi = new ClientApi();
