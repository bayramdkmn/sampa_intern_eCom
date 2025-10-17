"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import PersonalInformation from "./profileMaterials/PersonalInformation";
import ShippingAdressesInformation from "./profileMaterials/ShippingAdressesInformation";
import PaymentMethodsInformation from "./profileMaterials/PaymentMethodsInformation";
import PasswordInformation from "./profileMaterials/PasswordInformation";
import { User as ApiUser, Address, PaymentCard } from "@/types/api";
import type { User as UiUser } from "@/app/types/User";

interface ProfileComponentProps {
  initialUser: ApiUser;
  initialAddresses: Address[];
  initialCards: PaymentCard[];
  loading?: boolean;
  error?: string | null;
}

const ProfileComponent = ({
  initialUser,
  initialAddresses,
  initialCards,
  loading = false,
  error = null,
}: ProfileComponentProps) => {
  const { isAuthenticated, isLoading, user: authUser } = useAuth();
  const router = useRouter();

  // Profil fotoğrafı URL'sini oluştur
  const getProfileImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return null;

    // Eğer tam URL ise olduğu gibi döndür
    if (imagePath.startsWith("http")) {
      return imagePath;
    }

    // Eğer /media/ ile başlıyorsa base URL ile birleştir (api kısmını çıkar)
    if (imagePath.startsWith("/media/")) {
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      // API URL'den /api kısmını çıkar
      const cleanBaseURL = baseURL.replace("/api", "");
      return `${cleanBaseURL}${imagePath}`;
    }

    return imagePath;
  };

  // Server-side'dan gelen verileri state'e aktar
  const profileImageSource =
    (initialUser as any).profileImage ||
    initialUser.profile_image ||
    (initialUser as any).pro_photo;

  console.log("🔍 ProfileComponent - API'den gelen initialUser:", initialUser);
  console.log(
    "🔍 ProfileComponent - Profile image source:",
    profileImageSource
  );
  console.log(
    "🔍 ProfileComponent - Final profile image URL:",
    getProfileImageUrl(profileImageSource)
  );

  // initialUser'dan base user objesi oluştur (server-side'dan gelen)
  const baseUser: UiUser | null = initialUser
    ? {
        id: String(initialUser.id || initialUser.pk || ""),
        firstName:
          (initialUser as any).firstName ||
          initialUser.first_name ||
          initialUser.name ||
          "",
        lastName: (initialUser as any).lastName || initialUser.last_name || "",
        email: initialUser.email,
        phoneNumber:
          (initialUser as any).phoneNumber || initialUser.phone_number,
        profileImage: getProfileImageUrl(profileImageSource) || undefined,
      }
    : null;

  // authUser varsa (kullanıcı client-side'da güncelleme yaptıysa) onu kullan
  // ama eksik bilgileri baseUser'dan tamamla
  const profileUser = authUser
    ? {
        ...baseUser,
        ...authUser,
        // Eksik field'ları baseUser'dan al
        phoneNumber: authUser.phoneNumber || baseUser?.phoneNumber,
        profileImage: authUser.profileImage || baseUser?.profileImage,
      }
    : baseUser;
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [cards, setCards] = useState<PaymentCard[]>(initialCards);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="w-full container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-600">Profil bilgileri yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ Hata: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="w-full container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="text-gray-600">Giriş yapmanız gerekiyor...</div>
      </div>
    );
  }

  return (
    <div className="w-full container mx-auto px-4 py-8 flex flex-col gap-10">
      <div className="bg-white rounded-lg shadow  p-6">
        <div className="flex items-center gap-4 mb-6">
          <PersonalInformation user={profileUser as UiUser} />
        </div>
      </div>
      <ShippingAdressesInformation
        user={profileUser as UiUser}
        initialAddresses={addresses}
        onAddressesUpdate={setAddresses}
      />
      <PaymentMethodsInformation
        user={profileUser as UiUser}
        initialCards={cards}
      />
      <PasswordInformation />
    </div>
  );
};

export default ProfileComponent;
