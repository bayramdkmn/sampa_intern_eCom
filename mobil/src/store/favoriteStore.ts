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
