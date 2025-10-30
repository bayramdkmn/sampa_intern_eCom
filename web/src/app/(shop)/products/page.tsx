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

export default async function ProductsListPage({
  searchParams,
}: {
  searchParams: { q?: string; new?: string };
}) {
  let products: Product[] = [];
  let error = null;

  try {
    products = await serverApi.getProducts();
  } catch (err) {
    console.error("❌ Server-side: Ürün yükleme hatası:", err);
    error =
      err instanceof Error ? err.message : "Ürünler yüklenirken hata oluştu";
  }

  const initialSearchQuery =
    typeof searchParams?.q === "string" ? searchParams.q : "";
  const showNewArrivals = typeof searchParams?.new === "string";

  return (
    <ProductsListComponent
      products={products}
      loading={false}
      error={error}
      initialSearchQuery={initialSearchQuery}
      showNewArrivals={showNewArrivals}
    />
  );
}
