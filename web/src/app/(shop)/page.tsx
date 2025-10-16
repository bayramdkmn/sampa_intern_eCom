import ProductsSliderComponent from "@/components/ProductsSliderComponent";
import { serverApi } from "@/services/ServerApi";
import { Metadata } from "next";
import { Product } from "@/types/api";

// SEO Metadata - Server-side rendered
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
    <div className="w-full">
      <section className="grid gap-6 md:grid-cols-2 px-4 py-6">
        <div className="rounded-lg border border-black/10 p-6">
          <h1 className="mb-2 text-black text-2xl font-semibold">
            Welcome to Sampa Connect
          </h1>
          <p className="text-sm text-black/70">
            Küçük ölçekli e-ticaret uygulaması iskeleti hazır. Ürünler sayfasına
            giderek listeyi görebilir, sepet akışı için navigasyonu
            kullanabilirsiniz.
          </p>
        </div>
      </section>

      <ProductsSliderComponent
        products={products}
        loading={false}
        error={error}
      />
    </div>
  );
}
