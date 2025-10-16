import OrdersComponent from "@/components/OrdersComponent";
import { serverApi } from "@/services/ServerApi";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Order } from "@/types/api";

// SEO Metadata - Server-side rendered
export const metadata: Metadata = {
  title: "Sampa Connect - Siparişlerim",
  description:
    "Siparişlerinizi görüntüleyin ve takip edin. Sipariş durumları, detaylar ve geçmiş siparişleriniz.",
  keywords: [
    "siparişler",
    "sipariş takibi",
    "sipariş geçmişi",
    "sampa connect",
    "e-ticaret",
  ],
  openGraph: {
    title: "Sampa Connect - Siparişlerim",
    description: "Siparişlerinizi görüntüleyin ve takip edin.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
  // Cookie'den auth token kontrolü
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    redirect("/login");
  }

  // Server-side'da sipariş verilerini çek
  let orders: Order[] = [];
  let error = null;

  try {
    console.log("🔄 Server-side: Siparişler yükleniyor...");
    orders = await serverApi.getOrders();
    console.log(
      "✅ Server-side: Siparişler başarıyla yüklendi:",
      orders.length,
      "sipariş"
    );
  } catch (err) {
    console.error("❌ Server-side: Sipariş yükleme hatası:", err);
    error =
      err instanceof Error ? err.message : "Siparişler yüklenirken hata oluştu";

    // Auth hatası varsa login'e yönlendir
    if (
      err instanceof Error &&
      (err.message.includes("401") || err.message.includes("unauthorized"))
    ) {
      redirect("/login");
    }
  }

  return (
    <OrdersComponent initialOrders={orders} loading={false} error={error} />
  );
}
