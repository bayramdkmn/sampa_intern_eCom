"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { clientApi } from "@/services/ClientApi";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  size?: string;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // Sepet değiştiğinde LocalStorage'a kaydet
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = async (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => {
    try {
      // Önce API'ye gönder
      const productId = parseInt(item.id);
      const quantity = item.quantity || 1;

      await clientApi.addToCart(productId, quantity);

      // API başarılı olursa local state'i güncelle
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (i) => i.id === item.id && i.color === item.color
        );

        if (existingItem) {
          return prevItems.map((i) =>
            i.id === item.id && i.color === item.color
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        } else {
          return [...prevItems, { ...item, quantity }];
        }
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      // API hatası durumunda sadece local state'e ekle (offline mode)
      setCartItems((prevItems) => {
        const existingItem = prevItems.find(
          (i) => i.id === item.id && i.color === item.color
        );

        if (existingItem) {
          return prevItems.map((i) =>
            i.id === item.id && i.color === item.color
              ? { ...i, quantity: i.quantity + (item.quantity || 1) }
              : i
          );
        } else {
          return [...prevItems, { ...item, quantity: item.quantity || 1 }];
        }
      });
    }
  };

  const removeFromCart = async (id: string) => {
    try {
      // Önce API'den sil
      const productId = parseInt(id);
      await clientApi.removeFromCart(productId);

      // API başarılı olursa local state'i güncelle
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing from cart:", error);
      // API hatası durumunda sadece local state'den sil
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) return;

    try {
      // Önce API'yi güncelle
      const productId = parseInt(id);
      await clientApi.updateCartItem(productId, quantity);

      // API başarılı olursa local state'i güncelle
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    } catch (error) {
      console.error("Error updating cart item:", error);
      // API hatası durumunda sadece local state'i güncelle
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
