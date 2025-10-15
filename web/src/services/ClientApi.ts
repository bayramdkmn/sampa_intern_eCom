import { CookieKeys } from "../utils/cookie-keys";
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
  ProductListResponse,
  Order,
  OrderListResponse,
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

    // Get token from localStorage for client-side requests
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
      throw error;
    }
  }

  // Auth Methods
  async login(data: LoginData): Promise<AuthResponse> {
    const payload = {
      email: data.email,
      password: data.password,
    };

    console.log('🚀 Login payload:', payload);

    const response = await this.makeRequest<AuthResponse>("/users/login/", {
      method: 'POST',
      body: JSON.stringify(payload),
    }, true); // skipAuth = true for login

    // Save tokens to localStorage
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
    }, true); // skipAuth = true for register

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

  // User Methods
  async getUserProfile(): Promise<UserProfile> {
    return await this.makeRequest<UserProfile>("/user/profile/");
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    return await this.makeRequest<User>("/user/update/", {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Address Methods
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

  // Payment Card Methods
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

  // Password Methods
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

  // Product Methods
  async getProducts(): Promise<Product[]> {
    return await this.makeRequest<Product[]>("/products/products/");
  }

  async getProduct(id: string): Promise<Product> {
    return await this.makeRequest<Product>(`/products/products/${id}/`);
  }

  // Order Methods
  async getOrders(): Promise<Order[]> {
    return await this.makeRequest<Order[]>("/orders/");
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

  // Token Management
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
}

export const clientApi = new ClientApi();
