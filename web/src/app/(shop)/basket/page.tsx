import React from "react";
import BasketComponent from "@/components/BasketComponent";
import { Metadata } from "next";

// SEO Metadata - Server-side rendered
export const metadata: Metadata = {
  title: "Sampa Connect - Sepetim",
  description:
    "Sepetinizdeki ürünleri görüntüleyin ve siparişinizi tamamlayın. Güvenli ve hızlı alışveriş deneyimi.",
  keywords: ["sepet", "alışveriş", "sipariş", "sampa connect", "e-ticaret"],
  openGraph: {
    title: "Sampa Connect - Sepetim",
    description:
      "Sepetinizdeki ürünleri görüntüleyin ve siparişinizi tamamlayın.",
    type: "website",
  },
};

export default function BasketPage() {
  return <BasketComponent />;
}
