import { create } from "zustand";
import { Product, Category } from "../types";
import { api } from "../services/api";
import type { Product as ApiProduct } from "../types/api";

const mapApiProductToLocalProduct = (apiProduct: ApiProduct): Product => ({
  id: apiProduct.id.toString(),
  name: apiProduct.name,
  description: apiProduct.description || "",
  price: parseFloat(apiProduct.price),
  originalPrice: apiProduct.discount_price 
    ? parseFloat(apiProduct.discount_price) 
    : undefined,
  image: apiProduct.image || apiProduct.images?.[0] || "https://via.placeholder.com/400",
  images: apiProduct.images || (apiProduct.image ? [apiProduct.image] : []),
  category: apiProduct.category || "Diğer",
  brand: apiProduct.brand,
  rating: parseFloat(apiProduct.rating_average) || 0,
  reviewCount: apiProduct.rating_count || 0,
  inStock: apiProduct.stock > 0,
  stock: apiProduct.stock,
  slug: apiProduct.slug,
});

interface ProductState {
  // State
  products: Product[];
  categories: Category[];
  selectedCategory: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  setSelectedCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  getFilteredProducts: () => Product[];
  clearError: () => void;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  // Initial State
  products: [],
  categories: [],
  selectedCategory: null,
  searchQuery: "",
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ isLoading: true, error: null });

      const apiProducts = await api.getProducts();
      const localProducts = apiProducts.map(mapApiProductToLocalProduct);

      set({ products: localProducts, isLoading: false });
    } catch (error: any) {
      console.error('Ürünler yüklenirken hata:', error);
      set({
        error: error.message || "Ürünler yüklenirken hata oluştu",
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });


      const mockCategories: Category[] = [
        { id: "1", name: "Elektronik", icon: "📱", productCount: 1245 },
        { id: "2", name: "Moda", icon: "👔", productCount: 3542 },
        { id: "3", name: "Ev & Yaşam", icon: "🏠", productCount: 892 },
        { id: "4", name: "Spor", icon: "⚽", productCount: 567 },
        { id: "5", name: "Kitap", icon: "📚", productCount: 2341 },
        { id: "6", name: "Oyuncak", icon: "🧸", productCount: 445 },
        { id: "7", name: "Kozmetik", icon: "💄", productCount: 723 },
        { id: "8", name: "Bilgisayar", icon: "💻", productCount: 856 },
      ];

      set({ categories: mockCategories, isLoading: false });
    } catch (error) {
      set({
        error: "Kategoriler yüklenirken hata oluştu",
        isLoading: false,
      });
    }
  },

  fetchProductById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const existingProduct = get().products.find((p) => p.id === id);
      if (existingProduct) {
        set({ isLoading: false });
        return existingProduct;
      }

      const apiProduct = await api.getProduct(id);
      const localProduct = mapApiProductToLocalProduct(apiProduct);

      set((state) => ({
        products: [...state.products, localProduct],
        isLoading: false,
      }));

      return localProduct;
    } catch (error: any) {
      console.error('Ürün yüklenirken hata:', error);
      set({
        error: error.message || "Ürün yüklenirken hata oluştu",
        isLoading: false,
      });
      return null;
    }
  },

  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategory: categoryId });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  getFilteredProducts: () => {
    const { products, selectedCategory, searchQuery } = get();

    let filtered = products;

    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  },

  clearError: () => {
    set({ error: null });
  },
}));
