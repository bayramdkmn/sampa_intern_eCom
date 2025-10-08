"use client";

import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import PersonalInformation from "./profileMaterials/PersonalInformation";

const ProfileComponent = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-black mb-6">Profil</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4 mb-6">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt="Profile"
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold">
              {user.firstName.charAt(0)}
              {user.lastName.charAt(0)}
            </div>
          )}
          <div className="w-full">
            <PersonalInformation user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileComponent;
