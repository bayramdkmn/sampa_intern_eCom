// API Response Types
export interface User {
  id: string | number;
  pk?: string | number;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  phone_number?: string;
  profile_image?: string;
  pro_photo?: string;
  date_joined?: string;
  is_active?: boolean;
}

export interface UserProfile extends User {
  addresses: Address[];
  payment_cards: PaymentCard[];
}

export interface Address {
  id: string;
  user: string;
  title: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_line: string; // Backend'de address_line kullanılıyor
  address_line_1?: string; // Eski format için fallback
  address_line_2?: string;
  city: string;
  district: string; // Backend'de district kullanılıyor
  state_province?: string; // Eski format için fallback
  postal_code: string;
  country: string;
  phone_number?: string;
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  title: string;
  first_name: string;
  last_name: string;
  company?: string;
  address_line: string; // Backend'de address_line kullanılıyor
  address_line_1?: string; // Eski format için fallback
  address_line_2?: string;
  city: string;
  district: string; // Backend'de district kullanılıyor
  state_province?: string; // Eski format için fallback
  postal_code: string;
  country: string;
  phone_number?: string;
  is_default?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {
  id?: string;
}

export interface PaymentCard {
  id: string;
  user: string;
  card_holder_name: string;
  card_number: string; // Masked
  expiry_month: string;
  expiry_year: string;
  brand: string; // visa, mastercard, etc.
  is_default?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCardData {
  card_holder_name: string;
  card_number: string;
  expiry_month: string;
  expiry_year: string;
  cvv: string;
  brand?: string;
  is_default?: boolean;
  is_primary?: boolean; // Backend'de is_primary kullanılıyor
}

export interface UpdateCardData extends Partial<CreateCardData> {
  id?: string; // id'yi optional yap
  is_primary?: boolean; // Backend'de is_primary kullanılıyor
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: string;
  discount_price?: string;
  stock: number;
  rating_average: string;
  rating_count: number;
  image?: string;
  images?: string[];
  slug: string;
  category?: string;
  brand?: string;
  isActive: boolean;
  main_window_display: boolean;
  created_at: string;
  updated_at: string;
  stock_updated_at?: string;
}

export interface ProductListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Product[];
}

export interface Order {
  id: string;
  user: string;
  order_number: string;
  status: OrderStatus;
  total_amount: string;
  shipping_address: Address;
  billing_address?: Address;
  payment_method?: PaymentCard;
  items: OrderItem[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order: string;
  product: Product;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface CreateOrderData {
  shipping_address: string; // Address ID
  billing_address?: string; // Address ID
  payment_method?: string; // Card ID
  notes?: string;
  items: {
    product_id: number;
    quantity: number;
    price: string; // Backend price bekliyor ve bu toplam fiyat olmalı
  }[];
  total_amount: string;
}

export interface OrderListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Order[];
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

// Auth Types
export interface AuthResponse {
  user?: User;
  access_token?: string;
  refresh_token?: string;
  access?: string;
  refresh?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// API Error Types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// API Response Wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  page_size?: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  color?: string;
  size?: string;
}

export interface CartResponse {
  items: CartItem[];
  total_price: string;
  total_items: number;
}

export interface AddToCartData {
  product_id: number;
  quantity: number;
  color?: string;
  size?: string;
}

