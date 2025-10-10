import { create } from "zustand";
import { Product } from "../types";

interface FavoriteState {
  favorites: Product[];
  
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>()((set, get) => ({
  favorites: [],

  addToFavorites: (product: Product) => {
    const { favorites } = get();
    
    if (favorites.find(p => p.id === product.id)) {
      return;
    }
    
    set({ favorites: [...favorites, product] });
  },

  removeFromFavorites: (productId: string) => {
    const { favorites } = get();
    set({ favorites: favorites.filter(p => p.id !== productId) });
  },

  isFavorite: (productId: string) => {
    const { favorites } = get();
    return favorites.some(p => p.id === productId);
  },

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

