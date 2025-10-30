process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import { cookies } from "next/headers";
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
  Order,
  CreateOrderData,
  AuthResponse,
  RegisterData,
  LoginData,
  ChangePasswordData,
  ApiError
} from "../types/api";

export class ServerApi {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  }

  private async fetchInstance(options?: RequestInit) {
    const cookieStore = await cookies();
    const authToken = cookieStore.get(CookieKeys.AUTH);
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (authToken) {
      headers.Authorization = `Bearer ${authToken.value}`;
    }

    return async (endpoint: string, init?: RequestInit) => {
      const url = `${this.baseURL}${endpoint}`;
      const fetchOptions: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...(options?.headers || {}),
        },
        next: { revalidate: 300 },
        ...init,
      };

      const response = await fetch(url, fetchOptions);

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
        } as ApiError;
      }

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      
      if (isJson) {
        const data = await response.json();
        return data;
      } else {
        const text = await response.text();
        return text;
      }
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/users/login/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.access_token) {
        const cookieStore = await cookies();
        cookieStore.set({
          name: CookieKeys.AUTH,
          value: response.access_token,
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        });

        if (response.refresh_token) {
          cookieStore.set({
            name: CookieKeys.REFRESH,
            value: response.refresh_token,
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          });
        }
      }

      return response;
    } catch (err) {
      console.error("Login error:", err);
      throw err;
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/users/register/", {
        method: "POST",
        body: JSON.stringify(data),
      });

      return response;
    } catch (err) {
      console.error("Register error:", err);
      throw err;
    }
  }

  async logout(): Promise<void> {
    try {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get(CookieKeys.REFRESH);
      
      if (refreshToken) {
        const fetchReq = await this.fetchInstance();
        await fetchReq("/users/logout/", {
          method: "POST",
          body: JSON.stringify({ refresh: refreshToken.value }),
        });
      }

      cookieStore.delete(CookieKeys.AUTH);
      cookieStore.delete(CookieKeys.REFRESH);
      cookieStore.delete(CookieKeys.USER);
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  async refreshToken(): Promise<{ access_token: string }> {
    try {
      const cookieStore = await cookies();
      const refreshToken = cookieStore.get(CookieKeys.REFRESH);
      
      if (!refreshToken) {
        throw new Error('Refresh token bulunamadı');
      }

      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/users/refresh/", {
        method: "POST",
        body: JSON.stringify({ refresh_token: refreshToken.value }),
      });

      cookieStore.set({
        name: CookieKeys.AUTH,
        value: response.access_token,
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });

      return response;
    } catch (err) {
      console.error("Token refresh error:", err);
      throw err;
    }
  }

  async getUserProfile(): Promise<UserProfile> {
    try {
      const fetchReq = await this.fetchInstance();
      const candidateEndpoints = [
        "/users/me/",
        "/users/profile/",
        "/user/profile/",
      ];

      let lastError: unknown = null;
      for (const endpoint of candidateEndpoints) {
        try {
          const response = await fetchReq(endpoint);
          return response;
        } catch (e: any) {
          lastError = e;
          if (e && typeof e === 'object' && 'status' in e && e.status !== 404) {
            throw e;
          }
        }
      }
      throw lastError || new Error('Profil endpointi bulunamadı');
    } catch (err) {
      console.error("Error fetching user profile:", err);
      throw err;
    }
  }

  async updateUserProfile(data: Partial<User>): Promise<User> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/users/update/", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    } catch (err) {
      console.error("Error updating user profile:", err);
      throw err;
    }
  }

  async getAddresses(): Promise<Address[]> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/users/addresses/");
      return response;
    } catch (err) {
      console.error("Error fetching addresses:", err);
      throw err;
    }
  }

  async getPaymentCards(): Promise<PaymentCard[]> {
    try {
      const fetchReq = await this.fetchInstance();
      const candidateEndpoints = [
        "/users/payment-cards/",
        "/users/cards/",
      ];
      let lastError: unknown = null;
      for (const endpoint of candidateEndpoints) {
        try {
          const response = await fetchReq(endpoint);
          return response;
        } catch (e: any) {
          lastError = e;
          if (e && typeof e === 'object' && 'status' in e && e.status !== 404) {
            throw e;
          }
        }
      }
      throw lastError || new Error('Kart endpointi bulunamadı');
    } catch (err) {
      console.error("Error fetching payment cards:", err);
      throw err;
    }
  }

  async getAddress(id: string | number): Promise<Address> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq(`/users/addresses/${id}/`);
      return response;
    } catch (err) {
      console.error("Error fetching address:", err);
      throw err;
    }
  }

  async createAddress(data: CreateAddressData): Promise<Address> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/users/addresses/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (err) {
      console.error("Error creating address:", err);
      throw err;
    }
  }

  async updateAddress(id: string | number, data: UpdateAddressData): Promise<Address> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq(`/users/addresses/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    } catch (err) {
      console.error("Error updating address:", err);
      throw err;
    }
  }

  async deleteAddress(id: string | number): Promise<void> {
    try {
      const fetchReq = await this.fetchInstance();
      await fetchReq(`/users/addresses/${id}/`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting address:", err);
      throw err;
    }
  }

  async getCards(): Promise<PaymentCard[]> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/users/cards/");
      return response;
    } catch (err) {
      console.error("Error fetching cards:", err);
      throw err;
    }
  }

  async getCard(id: string | number): Promise<PaymentCard> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq(`/users/cards/${id}/`);
      return response;
    } catch (err) {
      console.error("Error fetching card:", err);
      throw err;
    }
  }

  async createCard(data: CreateCardData): Promise<PaymentCard> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/users/cards/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (err) {
      console.error("Error creating card:", err);
      throw err;
    }
  }

  async updateCard(id: string | number, data: UpdateCardData): Promise<PaymentCard> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq(`/users/cards/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    } catch (err) {
      console.error("Error updating card:", err);
      throw err;
    }
  }

  async deleteCard(id: string | number): Promise<void> {
    try {
      const fetchReq = await this.fetchInstance();
      await fetchReq(`/users/cards/${id}/`, {
        method: "DELETE",
      });
    } catch (err) {
      console.error("Error deleting card:", err);
      throw err;
    }
  }

  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/users/password/change/", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    } catch (err: any) {
      if (err.status === 401) {
        try {
          await this.refreshToken();
          const fetchReq = await this.fetchInstance();
          const response = await fetchReq("/users/password/change/", {
            method: "PATCH",
            body: JSON.stringify(data),
          });
          return response;
        } catch (refreshError) {
          console.error('Token yenileme başarısız:', refreshError);
          throw err;
        }
      }
      console.error("Error changing password:", err);
      throw err;
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/products/products/");
      return response;
    } catch (err) {
      console.error("Error fetching products:", err);
      throw err;
    }
  }

  async getProduct(id: string): Promise<Product> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq(`/products/products/${id}/`);
      return response;
    } catch (err) {
      console.error("Error fetching product:", err);
      throw err;
    }
  }

  async getOrders(): Promise<Order[]> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/orders/my-orders/");
      return response;
    } catch (err) {
      console.error("Error fetching orders:", err);
      throw err;
    }
  }

  async createOrder(data: CreateOrderData): Promise<Order> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/orders/", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (err) {
      console.error("Error creating order:", err);
      throw err;
    }
  }

  async getOrder(id: string): Promise<Order> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq(`/orders/${id}/`);
      return response;
    } catch (err) {
      console.error("Error fetching order:", err);
      throw err;
    }
  }

  // Cart Methods
  async getCartItems(): Promise<any[]> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/cart/");
      return response;
    } catch (err) {
      console.error("Error fetching cart items:", err);
      throw err;
    }
  }

  async addToCart(productId: number, quantity: number): Promise<any> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/cart/add", {
        method: "POST",
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
        }),
      });
      return response;
    } catch (err) {
      console.error("Error adding to cart:", err);
      throw err;
    }
  }

  async updateCartItem(productId: number, quantity: number): Promise<any> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/cart/update", {
        method: "PUT",
        body: JSON.stringify({
          product_id: productId,
          quantity: quantity,
        }),
      });
      return response;
    } catch (err) {
      console.error("Error updating cart item:", err);
      throw err;
    }
  }

  async removeFromCart(productId: number): Promise<any> {
    try {
      const fetchReq = await this.fetchInstance();
      const response = await fetchReq("/cart/remove", {
        method: "DELETE",
        body: JSON.stringify({
          product_id: productId,
        }),
      });
      return response;
    } catch (err) {
      console.error("Error removing from cart:", err);
      throw err;
    }
  }
}

export const serverApi = new ServerApi();
