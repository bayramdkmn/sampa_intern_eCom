// Legacy authService - now using new ClientApi system
import { clientApi } from './ClientApi';
import { 
  RegisterData, 
  LoginData, 
  AuthResponse, 
  ApiError,
  Address,
  PaymentCard,
  ChangePasswordData
} from '../types/api';

class AuthService {
  // Address methods - now using ClientApi
  async getAddresses(): Promise<Address[]> {
    return await clientApi.getAddresses();
  }

  async getAddress(id: string | number): Promise<Address> {
    return await clientApi.getAddress(id);
  }

  async createAddress(data: any): Promise<Address> {
    return await clientApi.createAddress(data);
  }

  async deleteAddress(id: string | number): Promise<void> {
    await clientApi.deleteAddress(id);
  }

  // Card methods - now using ClientApi
  async getCards(): Promise<PaymentCard[]> {
    return await clientApi.getCards();
  }

  async deleteCard(id: string | number): Promise<void> {
    await clientApi.deleteCard(id);
  }

  async createCard(data: any): Promise<PaymentCard> {
    return await clientApi.createCard(data);
  }

  // Password methods - now using ClientApi
  async changePassword(data: ChangePasswordData): Promise<{ message: string }> {
    return await clientApi.changePassword(data);
  }
  // Legacy makeRequest method - now using ClientApi internally
  // This method is kept for backward compatibility but delegates to ClientApi

  // Auth methods - now using ClientApi
  async register(data: RegisterData): Promise<AuthResponse> {
    return await clientApi.register(data);
  }

  async login(data: LoginData): Promise<AuthResponse> {
    return await clientApi.login(data);
  }

  async logout(): Promise<void> {
    return await clientApi.logout();
  }

  async refreshToken(): Promise<{ access_token: string }> {
    return await clientApi.refreshToken();
  }

  // Token management methods - now using ClientApi
  saveTokens(accessToken: string, refreshToken: string): void {
    clientApi.saveTokens(accessToken, refreshToken);
  }

  clearTokens(): void {
    clientApi.clearTokens();
  }

  getAccessToken(): string | null {
    return clientApi.getAccessToken();
  }
}

export const authService = new AuthService();
