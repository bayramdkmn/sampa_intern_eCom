import ProductDetailComponent from "@/components/ProductDetailComponent";
import { serverApi } from "@/services/ServerApi";
import { Metadata } from "next";
import { Product } from "@/types/api";
import { notFound } from "next/navigation";

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

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  let product: Product | null = null;
  let error = null;

  try {
    product = await serverApi.getProduct(id);
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Ürün detayları yüklenirken hata oluştu";

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
