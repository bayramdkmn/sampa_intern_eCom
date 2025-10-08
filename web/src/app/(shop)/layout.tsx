import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/contexts/CartContext";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <div className="min-h-dvh flex flex-col bg-gray-100">
        <Navbar />
        <main className="w-full flex-1 bg-gray-100">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
