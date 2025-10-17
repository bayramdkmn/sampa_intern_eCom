import CheckOutComponent from "@/components/CheckOutComponent";
import { serverApi } from "@/services/ServerApi";
import { Metadata } from "next";
import { cookies } from "next/headers";

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

// SEO Metadata - Server-side rendered
export const metadata: Metadata = {
  title: "Sampa Connect - Checkout",
  description:
    "Güvenli ödeme ile siparişinizi tamamlayın. Hızlı ve güvenli checkout süreci.",
  keywords: ["checkout", "ödeme", "sipariş", "sampa connect", "e-ticaret"],
  openGraph: {
    title: "Sampa Connect - Checkout",
    description: "Güvenli ödeme ile siparişinizi tamamlayın.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CheckOutPage() {
  // Server-side'da kullanıcı verilerini çek
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userAddresses: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userCards: any[] = [];
  let cartItems: OrderItem[] = [];

  try {
    console.log("🔄 Server-side: Checkout verileri yükleniyor...");

    // Cookie'den auth token kontrolü
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token");

    if (authToken) {
      // Kullanıcının adreslerini çek
      try {
        userAddresses = await serverApi.getAddresses();
        console.log("✅ Kullanıcı adresleri yüklendi:", userAddresses.length);
      } catch (err) {
        console.log("⚠️ Adresler yüklenemedi:", err);
      }

      // Kullanıcının kartlarını çek
      try {
        userCards = await serverApi.getPaymentCards();
        console.log("✅ Kullanıcı kartları yüklendi:", userCards.length);
      } catch (err) {
        console.log("⚠️ Kartlar yüklenemedi:", err);
      }
    }

    // Sepet verilerini çek (örnek veriler)
    cartItems = [
      { id: 1, name: "Eco-Friendly Water Bottle", quantity: 2, price: 30.0 },
      { id: 2, name: "Organic Cotton T-Shirt", quantity: 1, price: 25.0 },
      { id: 3, name: "Reusable Shopping Bag", quantity: 3, price: 15.0 },
    ];

    console.log("✅ Server-side: Checkout verileri başarıyla yüklendi");
  } catch (err) {
    console.error("❌ Server-side: Checkout verileri yükleme hatası:", err);
  }

  return (
    <CheckOutComponent
      initialOrderItems={cartItems}
      userAddresses={userAddresses}
      userCards={userCards}
    />
  );
}
