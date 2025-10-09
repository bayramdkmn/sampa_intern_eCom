"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import PersonalInformation from "./profileMaterials/PersonalInformation";
import ShippingAdressesInformation from "./profileMaterials/ShippingAdressesInformation";
import PaymentMethodsInformation from "./profileMaterials/PaymentMethodsInformation";
import PasswordInformation from "./profileMaterials/PasswordInformation";

const ProfileComponent = () => {
  const { user } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!user) {
  //     router.push("/login");
  //   }
  // }, [user, router]);

  if (!user) return null;

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
