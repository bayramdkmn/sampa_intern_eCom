"use client";
import ProductsComponent from "@/components/ProductsComponent";

export default function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  return <ProductsComponent id={id} />;
}
