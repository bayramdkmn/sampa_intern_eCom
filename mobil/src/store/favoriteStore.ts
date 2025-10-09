import { create } from "zustand";
import { Product } from "../types";

interface FavoriteState {
  // State
  favorites: Product[];
  
  // Actions
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>()((set, get) => ({
  // Initial State
  favorites: [],

  // ❤️ Favorilere Ürün Ekle
  addToFavorites: (product: Product) => {
    const { favorites } = get();
    
    // Ürün zaten favorilerdeyse ekleme
    if (favorites.find(p => p.id === product.id)) {
      return;
    }
    
    set({ favorites: [...favorites, product] });
  },

  // 💔 Favorilerden Ürün Çıkar
  removeFromFavorites: (productId: string) => {
    const { favorites } = get();
    set({ favorites: favorites.filter(p => p.id !== productId) });
  },

  // ✨ Ürün Favorilerde mi Kontrol Et
  isFavorite: (productId: string) => {
    const { favorites } = get();
    return favorites.some(p => p.id === productId);
  },

  // 🗑️ Tüm Favorileri Temizle
  clearFavorites: () => {
    set({ favorites: [] });
  },
}));

// 🎯 KULLANIM ÖRNEĞİ:
// 
// import { useFavoriteStore } from '../store/favoriteStore';
// 
// function ProductDetailScreen() {
//   const { addToFavorites, removeFromFavorites, isFavorite } = useFavoriteStore();
//   const isProductFavorite = isFavorite(product.id);
//   
//   const handleToggleFavorite = () => {
//     if (isProductFavorite) {
//       removeFromFavorites(product.id);
//     } else {
//       addToFavorites(product);
//     }
//   };
//   
//   return (
//     <TouchableOpacity onPress={handleToggleFavorite}>
//       <Text>{isProductFavorite ? '❤️' : '🤍'}</Text>
//     </TouchableOpacity>
//   );
// }
// 
// function FavoritesScreen() {
//   const { favorites } = useFavoriteStore();
//   
//   return (
//     <FlatList
//       data={favorites}
//       renderItem={({ item }) => <ProductCard product={item} />}
//     />
//   );
// }

