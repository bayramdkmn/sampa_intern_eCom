import ProductDetailComponent from "@/components/ProductDetailComponent";
import { serverApi } from "@/services/ServerApi";
import { Metadata } from "next";
import { Product } from "@/types/api";
import { notFound } from "next/navigation";

// Generate metadata for each product page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const product = await serverApi.getProduct(id);

    return {
      title: `${product.name} - Sampa Connect`,
      description:
        product.description ||
        `${product.name} ürününü Sampa Connect'te keşfedin. Kaliteli ve uygun fiyatlı ürünler.`,
      keywords: [
        product.name,
        product.category || "",
        "sampa connect",
        "e-ticaret",
      ],
      openGraph: {
        title: `${product.name} - Sampa Connect`,
        description: product.description || `${product.name} ürününü keşfedin.`,
        type: "website",
        images: product.image ? [{ url: product.image }] : [],
      },
    };
  } catch (error) {
    return {
      title: "Ürün Bulunamadı - Sampa Connect",
      description: "Aradığınız ürün bulunamadı.",
    };
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Server-side'da ürün detaylarını çek
  let product: Product | null = null;
  let error = null;

  try {
    console.log("🔄 Server-side: Ürün detayları yükleniyor...", id);
    product = await serverApi.getProduct(id);
    console.log(
      "✅ Server-side: Ürün detayları başarıyla yüklendi:",
      product.name
    );
  } catch (err) {
    console.error("❌ Server-side: Ürün detay yükleme hatası:", err);
    error =
      err instanceof Error
        ? err.message
        : "Ürün detayları yüklenirken hata oluştu";

    // Ürün bulunamadıysa 404 sayfasına yönlendir
    if (err instanceof Error && err.message.includes("404")) {
      notFound();
    }
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductDetailComponent product={product} loading={false} error={error} />
  );
}
