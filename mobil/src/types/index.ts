// Navigation Types
export type RootStackParamList = {
  MainTabs: undefined;
  ProductDetail: { productId: string };
  Orders: undefined;
  Favorites: undefined;
  Addresses: undefined;
  PaymentMethods: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  WelcomeSuccess: { userName: string };
};

export type MainTabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Profile: undefined;
};

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  inStock: boolean;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  icon: string;
  productCount: number;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
}

// Address Types
export interface Address {
  id: string;
  title: string; // Ev, İş, vb.
  fullName: string;
  phone: string;
  city: string;
  district: string;
  fullAddress: string;
  isDefault?: boolean;
}

// Payment Method Types
export interface PaymentMethod {
  id: string;
  cardNumber: string; // Son 4 hane için maskeli
  cardHolderName: string;
  expiryDate: string; // MM/YY formatında
  cardType: "visa" | "mastercard" | "amex" | "other";
  isDefault?: boolean;
}

// Order Types
export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  shippingCost: number;
  finalTotal: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  deliveryAddress?: string;
  paymentMethod?: string;
}

// API Response Types (Backend entegrasyonu için)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

