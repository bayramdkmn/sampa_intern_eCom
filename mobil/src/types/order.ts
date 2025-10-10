import { CartItem } from './product';

export interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

export interface BaseOrder {
  id: string;
  items: CartItem[];
  total: number;
  shippingCost: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  orderNumber?: string;
  finalTotal?: number;
  date?: string;
  deliveryAddress?: string;
  address?: string;
  paymentMethod?: string;
  products?: OrderItem[];
}

export interface StoreOrder {
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

export interface ScreenOrder extends StoreOrder {
  orderNumber: string;
  date: string;
  address: string;
  products: OrderItem[];
}
