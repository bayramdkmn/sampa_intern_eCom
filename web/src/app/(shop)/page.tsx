import ProductsSliderComponent from "@/components/ProductsSliderComponent";
import { serverApi } from "@/services/ServerApi";
import { Metadata } from "next";
import { Product } from "@/types/api";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sampa Connect - Öne Çıkan Ürünler",
  description:
    "Sampa Connect'te en popüler ve öne çıkan ürünleri keşfedin. Kaliteli ürünler, uygun fiyatlar.",
  keywords: ["e-ticaret", "ürünler", "sampa connect", "online alışveriş"],
  openGraph: {
    title: "Sampa Connect - Öne Çıkan Ürünler",
    description: "Sampa Connect'te en popüler ve öne çıkan ürünleri keşfedin.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ShopHomePage() {
  let products: Product[] = [];
  let error: string | null = null;

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
    <div className="w-full h-full">
      <Link href="/products" aria-label="Ürünlere git" className="block">
        <div className="relative w-full overflow-hidden aspect-[21/9] md:aspect-[21/6] my-2 cursor-pointer">
          <Image
            src="/banner.jpg"
            alt="Sampa Connect Banner"
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      </Link>

      <ProductsSliderComponent
        products={products}
        loading={false}
        error={error}
      />
    </div>
  );
}
