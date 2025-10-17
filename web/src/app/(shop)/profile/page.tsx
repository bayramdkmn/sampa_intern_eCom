import ProfileComponent from "@/components/ProfileComponent";
import { serverApi } from "@/services/ServerApi";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User, Address, PaymentCard } from "@/types/api";

// SEO Metadata - Server-side rendered
export const metadata: Metadata = {
  title: "Sampa Connect - Profilim",
  description:
    "Profil bilgilerinizi görüntüleyin ve güncelleyin. Kişisel bilgiler, adresler, ödeme yöntemleri ve şifre ayarları.",
  keywords: [
    "profil",
    "hesap",
    "kişisel bilgiler",
    "adresler",
    "ödeme",
    "sampa connect",
  ],
  openGraph: {
    title: "Sampa Connect - Profilim",
    description: "Profil bilgilerinizi görüntüleyin ve güncelleyin.",
    type: "website",
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
  // Cookie'den auth token kontrolü
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    redirect("/login");
  }

  // Server-side'da kullanıcı verilerini çek
  let user: User | null = null;
  let userAddresses: Address[] = [];
  let userCards: PaymentCard[] = [];
  let error = null;

  try {
    console.log("🔄 Server-side: Profil verileri yükleniyor...");

    // Kullanıcı bilgilerini çek
    user = await serverApi.getUserProfile();
    console.log("✅ Kullanıcı bilgileri yüklendi:", user.first_name);

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

    console.log("✅ Server-side: Profil verileri başarıyla yüklendi");
  } catch (err) {
    console.error("❌ Server-side: Profil verileri yükleme hatası:", err);
    error =
      err instanceof Error
        ? err.message
        : "Profil verileri yüklenirken hata oluştu";

    // Auth hatası varsa login'e yönlendir
    if (
      err instanceof Error &&
      (err.message.includes("401") || err.message.includes("unauthorized"))
    ) {
      redirect("/login");
    }
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="select-none">
      <ProfileComponent
        initialUser={user}
        initialAddresses={userAddresses}
        initialCards={userCards}
        loading={false}
        error={error}
      />
    </div>
  );
}
