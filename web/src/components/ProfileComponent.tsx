"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import PersonalInformation from "./profileMaterials/PersonalInformation";
import ShippingAdressesInformation from "./profileMaterials/ShippingAdressesInformation";
import PaymentMethodsInformation from "./profileMaterials/PaymentMethodsInformation";
import PasswordInformation from "./profileMaterials/PasswordInformation";

const ProfileComponent = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="w-full container mx-auto px-4 py-8 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-600">Profil bilgileri yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!user) {
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
          <PersonalInformation user={user} />
        </div>
      </div>
      <ShippingAdressesInformation user={user} />
      <PaymentMethodsInformation user={user} />
      <PasswordInformation />
    </div>
  );
};

export default ProfileComponent;
