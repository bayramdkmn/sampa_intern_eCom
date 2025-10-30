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

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  const addToCart = async (
    item: Omit<CartItem, "quantity"> & { quantity?: number }
  ) => {
    try {
      const productId = parseInt(item.id);
      const quantity = item.quantity || 1;

      await clientApi.addToCart(productId, quantity);

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
      const productId = parseInt(id);
      await clientApi.removeFromCart(productId); // sadece tamamen SİL
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error removing from cart:", error);
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const current = cartItems.find((item) => item.id === id);
    const productId = parseInt(id);
    if (!current) return;
    try {
      if (quantity < 1) {
        await removeFromCart(id);
      } else if (quantity > current.quantity) {
        // arttırmak için addToCart fonksiyonunu kullan
        await clientApi.addToCart(productId, quantity - current.quantity);
      } else if (quantity < current.quantity) {
        // azaltmak için fark kadar decreaseCartItem çağır
        for (let i = 0; i < current.quantity - quantity; i++) {
          await clientApi.decreaseCartItem(productId);
        }
      }
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    } catch (error) {
      console.error("Error updating cart item:", error);
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
