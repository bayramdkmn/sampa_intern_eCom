import { create } from "zustand";
import { Product, Category } from "../types";

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
}

export const useProductStore = create<ProductState>()((set, get) => ({
  // Initial State
  products: [],
  categories: [],
  selectedCategory: null,
  searchQuery: "",
  isLoading: false,
  error: null,

  // 📦 Ürünleri API'den Çek
  // Redux'ta: dispatch(fetchProducts()) ve saga/thunk kullanırsın
  // Zustand'da: await fetchProducts() - Direkt async/await!
  fetchProducts: async () => {
    try {
      set({ isLoading: true, error: null });

      // TODO: Gerçek API çağrısı
      // const response = await fetch('YOUR_API/products');
      // const data = await response.json();

      // Şimdilik mock data
      const mockProducts: Product[] = [
        {
          id: "1",
          name: "Premium Kablosuz Kulaklık",
          description: "Aktif gürültü önleme özellikli",
          price: 1299,
          image: "https://via.placeholder.com/400",
          category: "elektronik",
          rating: 4.8,
          inStock: true,
        },
        {
          id: "2",
          name: "Akıllı Saat Pro",
          description: "Sağlık takibi ve bildirimler",
          price: 2499,
          image: "https://via.placeholder.com/400",
          category: "elektronik",
          rating: 4.5,
          inStock: true,
        },
        {
          id: "3",
          name: "Dizüstü Bilgisayar",
          description: "16GB RAM, 512GB SSD",
          price: 15999,
          image: "https://via.placeholder.com/400",
          category: "bilgisayar",
          rating: 4.9,
          inStock: true,
        },
        {
          id: "4",
          name: "Bluetooth Hoparlör",
          description: "Su geçirmez, 20 saat pil",
          price: 549,
          image: "https://via.placeholder.com/400",
          category: "elektronik",
          rating: 4.6,
          inStock: true,
        },
        {
          id: "5",
          name: "Wireless Mouse",
          description: "Ergonomik tasarım",
          price: 299,
          image: "https://via.placeholder.com/400",
          category: "bilgisayar",
          rating: 4.4,
          inStock: true,
        },
      ];

      set({ products: mockProducts, isLoading: false });
    } catch (error) {
      set({
        error: "Ürünler yüklenirken hata oluştu",
        isLoading: false,
      });
    }
  },

  // 📱 Kategorileri API'den Çek
  fetchCategories: async () => {
    try {
      set({ isLoading: true, error: null });

      // TODO: Gerçek API çağrısı
      // const response = await fetch('YOUR_API/categories');
      // const data = await response.json();

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

  // 🔍 ID'ye Göre Ürün Bul
  fetchProductById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      // TODO: Gerçek API çağrısı
      // const response = await fetch(`YOUR_API/products/${id}`);
      // const data = await response.json();

      const product = get().products.find((p) => p.id === id) || null;

      set({ isLoading: false });
      return product;
    } catch (error) {
      set({
        error: "Ürün yüklenirken hata oluştu",
        isLoading: false,
      });
      return null;
    }
  },

  // 🏷️ Kategori Seç
  setSelectedCategory: (categoryId: string | null) => {
    set({ selectedCategory: categoryId });
  },

  // 🔎 Arama Sorgusu Ayarla
  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  },

  // 🎯 Filtrelenmiş Ürünleri Al
  // Redux'ta selector kullanırsın
  // Zustand'da direkt fonksiyon!
  getFilteredProducts: () => {
    const { products, selectedCategory, searchQuery } = get();

    let filtered = products;

    // Kategoriye göre filtrele
    if (selectedCategory) {
      filtered = filtered.filter(
        (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Arama sorgusuna göre filtrele
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  },
}));

// 🎯 KULLANIM ÖRNEĞİ:
// 
// import { useProductStore } from '../store/productStore';
// 
// function HomeScreen() {
//   const { products, fetchProducts, isLoading } = useProductStore();
//   
//   useEffect(() => {
//     fetchProducts();
//   }, []);
//   
//   if (isLoading) return <ActivityIndicator />;
//   
//   return (
//     <FlatList
//       data={products}
//       renderItem={({ item }) => <ProductCard product={item} />}
//     />
//   );
// }
// 
// function CategoriesScreen() {
//   const { 
//     setSelectedCategory, 
//     setSearchQuery, 
//     getFilteredProducts 
//   } = useProductStore();
//   
//   const filteredProducts = getFilteredProducts();
//   
//   return (
//     <View>
//       <TextInput onChangeText={setSearchQuery} placeholder="Ara..." />
//       {filteredProducts.map(p => <Text>{p.name}</Text>)}
//     </View>
//   );
// }

