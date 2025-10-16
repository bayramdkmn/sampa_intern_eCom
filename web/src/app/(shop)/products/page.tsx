import ProductsListComponent from "@/components/ProductsListComponent";
import { serverApi } from "@/services/ServerApi";
import { Metadata } from "next";
import { Product } from "@/types/api";

// SEO Metadata - Server-side rendered
export const metadata: Metadata = {
  title: "Sampa Connect - Ürünler",
  description:
    "Sampa Connect'te tüm ürünleri keşfedin. Elektronik, giyim, ev & bahçe kategorilerinde binlerce ürün.",
  keywords: [
    "ürünler",
    "e-ticaret",
    "elektronik",
    "giyim",
    "sampa connect",
    "alışveriş",
  ],
  openGraph: {
    title: "Sampa Connect - Ürünler",
    description: "Sampa Connect'te tüm ürünleri keşfedin.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsListPage() {
  let products: Product[] = [];
  let error = null;

  try {
    console.log("🔄 Server-side: Ürünler yükleniyor...");
    products = await serverApi.getProducts();
    console.log(
      "✅ Server-side: Ürünler başarıyla yüklendi:",
      products.length,
      "ürün"
    );
  } catch (err) {
    console.error("❌ Server-side: Ürün yükleme hatası:", err);
    error =
      err instanceof Error ? err.message : "Ürünler yüklenirken hata oluştu";
  }

  return (
    <ProductsListComponent products={products} loading={false} error={error} />
  );
}
