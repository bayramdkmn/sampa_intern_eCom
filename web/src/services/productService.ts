import { clientApi } from './ClientApi';
import { Product } from '../types/api';

class ProductService {
  async getProducts(): Promise<Product[]> {
    return await clientApi.getProducts();
  }

  async getProduct(id: string): Promise<Product> {
    return await clientApi.getProduct(id);
  }
}

export const productService = new ProductService();
