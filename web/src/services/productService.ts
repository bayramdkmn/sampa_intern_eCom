import { API_ENDPOINTS } from '@/config/api';

export interface Product {
  id: number;
  rating_average: string;
  rating_count: number;
  name: string;
  description?: string;
  price: string;
  stock: number;
  created_at: string;
  image: string | null;
  isActive: boolean;
  main_window_display: boolean;
  discount_price: string | null;
  slug: string;
  category: string | null;
  brand: string | null;
}

class ProductService {
  async getProducts(): Promise<Product[]> {
    const response = await fetch(API_ENDPOINTS.PRODUCTS.LIST);
    
    if (!response.ok) {
      throw new Error(`Ürünler yüklenirken hata oluştu: ${response.status}`);
    }
    
    const products = await response.json();
    console.log('Ürünler API\'den geldi:', products);
    return products;
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(API_ENDPOINTS.PRODUCTS.DETAIL(id));
    
    if (!response.ok) {
      throw new Error(`Ürün yüklenirken hata oluştu: ${response.status}`);
    }
    
    const product = await response.json();
    console.log('Tek ürün API\'den geldi:', product);
    return product;
  }
}

export const productService = new ProductService();
