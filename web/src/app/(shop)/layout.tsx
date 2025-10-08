import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-gray-100">
      <Navbar />
      <main className="w-full flex-1 bg-gray-100">{children}</main>
      <Footer />
    </div>
  );
}
