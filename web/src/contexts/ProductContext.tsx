"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { productService } from "@/services/productService";
import { Product } from "@/types/api";

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  fetchProduct: (id: string) => Promise<Product | null>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedProducts = await productService.getProducts();
      setProducts(fetchedProducts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ürünler yüklenirken hata oluştu";
      console.error("❌ ProductContext: Ürün yükleme hatası:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchProduct = async (id: string): Promise<Product | null> => {
    setLoading(true);
    setError(null);
    try {
      const product = await productService.getProduct(id);
      return product;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Ürün yüklenirken hata oluştu";
      console.error("❌ ProductContext: Ürün yükleme hatası:", errorMessage);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        fetchProducts,
        fetchProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
}
