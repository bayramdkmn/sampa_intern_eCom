import OrdersComponent from "@/components/OrdersComponent";
import { serverApi } from "@/services/ServerApi";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Order } from "@/types/api";

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
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    redirect("/login");
  }

  let orders: Order[] = [];
  let error = null;

  try {
    orders = await serverApi.getOrders();
  } catch (err) {
    console.error("❌ Server-side: Sipariş yükleme hatası:", err);
    error =
      err instanceof Error ? err.message : "Siparişler yüklenirken hata oluştu";

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
