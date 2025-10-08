import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ShopLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col bg-white">
      <Navbar />
      <main className="mx-auto w-full flex-1 px-4 py-6 bg-gray-400">
        {children}
      </main>
      <Footer />
    </div>
  );
}
