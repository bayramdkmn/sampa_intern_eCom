export interface OrderProduct {
  id: string;
  name: string;
  image: string;
  color: string;
  size?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  total: number;
  status: "Shipped" | "Delivered" | "Processing" | "Cancelled";
  products: OrderProduct[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
}

