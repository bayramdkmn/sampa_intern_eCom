export { clientApi, ClientApi } from './ClientApi';
export { serverApi, ServerApi } from './ServerApi';
export { authService } from './authService';
export { productService } from './productService';

export type {
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
  OrderItem,
  OrderStatus,
  AuthResponse,
  RegisterData,
  LoginData,
  ChangePasswordData,
  ApiError,
  ValidationError,
  ApiResponse,
  PaginationParams,
  PaginatedResponse
} from '../types/api';
