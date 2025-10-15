import { API_ENDPOINTS } from '@/config/api';

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user?: {
    id?: string;
    pk?: string;
    username?: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    phone_number?: string;
    profile_image?: string;
  };
  id?: string;
  pk?: string;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone_number?: string;
  profile_image?: string;
  access_token?: string;
  refresh_token?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

class AuthService {
  async getAddresses(): Promise<any[]> {
    return await this.makeRequest<any[]>(API_ENDPOINTS.USER.ADDRESSES, {
      method: 'GET',
    });
  }

  async getAddress(id: string | number): Promise<any> {
    return await this.makeRequest<any>(API_ENDPOINTS.USER.ADDRESS_DETAIL(id), {
      method: 'GET',
    });
  }

  async createAddress(data: any): Promise<any> {
    return await this.makeRequest<any>(API_ENDPOINTS.USER.ADDRESSES, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteAddress(id: string | number): Promise<void> {
    await this.makeRequest(API_ENDPOINTS.USER.ADDRESS_DETAIL(id), {
      method: 'DELETE',
    });
  }

  async getCards(): Promise<any[]> {
    return await this.makeRequest<any[]>(API_ENDPOINTS.USER.CARDS, {
      method: 'GET',
    });
  }

  async deleteCard(id: string | number): Promise<void> {
    await this.makeRequest(API_ENDPOINTS.USER.CARD_DETAIL(id), {
      method: 'DELETE',
    });
  }

  async createCard(data: any): Promise<any> {
    return await this.makeRequest<any>(API_ENDPOINTS.USER.CARDS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<any> {
    try {
      return await this.makeRequest<any>(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    } catch (error: any) {
      if (error.status === 401) {
        try {
          await this.refreshToken();
          return await this.makeRequest<any>(API_ENDPOINTS.USER.CHANGE_PASSWORD, {
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
  private async makeRequest<T>(
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
      console.log('🚀 API Request:', {
        endpoint,
        method: config.method,
        headers: config.headers,
        body: config.body
      });

      const response = await fetch(endpoint, config);
      

      const methodUpper = String(config.method || 'GET').toUpperCase();
      const isNoContent = response.status === 204 || methodUpper === 'DELETE';

      let data: any = undefined;
      if (!isNoContent) {
        const contentType = response.headers.get('content-type') || '';
        const hasJson = contentType.includes('application/json');
        if (hasJson) {
          try {
            data = await response.json();
            console.log('📡 API Response Data:', data);
          } catch (e) {
            const text = await response.text();
            console.log('📡 API Response Text:', text);
            data = text ? { detail: text } : undefined;
          }
        } else {
          const text = await response.text();
          if (text) {
            console.log('📡 API Response Text:', text);
            data = { detail: text };
          }
        }
      }

      if (!response.ok) {
        console.log('❌ API Error Response:', {
          status: response.status,
          data: data
        });
        
        throw {
          message: (data && (data.message || data.detail || data.error)) || 'Bir hata oluştu',
          errors: (data && (data.errors || data.field_errors)) || {},
          status: response.status,
        } as ApiError & { status: number };
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

  async register(data: RegisterData): Promise<AuthResponse> {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
    } as Record<string, any>;

    console.log('🚀 Register payload:', payload);

    for (const endpoint of API_ENDPOINTS.AUTH.REGISTER) {
      try {
        console.log(`🎯 Endpoint deneniyor: ${endpoint}`);
        
        const response = await this.makeRequest<AuthResponse>(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
        }, true); // skipAuth = true for register
        
        console.log(`✅ Endpoint: ${endpoint} başarılı!`, response);
        return response;
        
      } catch (error: any) {
        console.log(`❌ Endpoint: ${endpoint} başarısız:`, {
          status: error.status,
          message: error.message,
          error: error
        });
        
        if (error.status && error.status >= 500) {
          throw error;
        }
        
        if (endpoint === API_ENDPOINTS.AUTH.REGISTER[API_ENDPOINTS.AUTH.REGISTER.length - 1]) {
          throw new Error(`Tüm endpoint'ler başarısız oldu. Son hata: ${error.message}`);
        }
      }
    }
    
    throw new Error('Tüm endpoint\'ler başarısız oldu');
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const payload = {
      email: data.email,
      password: data.password,
    };

    console.log('🚀 Login payload:', payload);

    for (const endpoint of API_ENDPOINTS.AUTH.LOGIN) {
      try {
        console.log(`🎯 Login endpoint deneniyor: ${endpoint}`);
        
        const response = await this.makeRequest<AuthResponse>(endpoint, {
          method: 'POST',
          body: JSON.stringify(payload),
        }, true); // skipAuth = true for login
        
        console.log(`✅ Login endpoint: ${endpoint} başarılı!`, response);
        return response;
        
      } catch (error: any) {
        console.log(`❌ Login endpoint: ${endpoint} başarısız:`, {
          status: error.status,
          message: error.message,
          error: error
        });
        
        if (error.status && error.status >= 500) {
          throw error;
        }
        
        if (endpoint === API_ENDPOINTS.AUTH.LOGIN[API_ENDPOINTS.AUTH.LOGIN.length - 1]) {
          throw new Error(`Tüm login endpoint'leri başarısız oldu. Son hata: ${error.message}`);
        }
      }
    }
    
    throw new Error('Tüm login endpoint\'leri başarısız oldu');
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await this.makeRequest(API_ENDPOINTS.AUTH.LOGOUT, {
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
      API_ENDPOINTS.AUTH.REFRESH,
      {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    localStorage.setItem('access_token', response.access_token);
    return response;
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
}

export const authService = new AuthService();
