import ProfileComponent from "@/components/ProfileComponent";
import { serverApi } from "@/services/ServerApi";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { User, Address, PaymentCard } from "@/types/api";

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
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");

  if (!authToken) {
    redirect("/login");
  }

  let user: User | null = null;
  let userAddresses: Address[] = [];
  let userCards: PaymentCard[] = [];
  let error = null;

  try {
    user = await serverApi.getUserProfile();
    try {
      userAddresses = await serverApi.getAddresses();
    } catch (err) {
      console.error("❌ Adresler yüklenemedi:", err);
    }
    try {
      userCards = await serverApi.getPaymentCards();
    } catch (err) {
      console.error("❌ Kartlar yüklenemedi:", err);
    }
  } catch (err) {
    console.error("❌ Server-side: Profil verileri yükleme hatası:", err);
    error =
      err instanceof Error
        ? err.message
        : "Profil verileri yüklenirken hata oluştu";

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
