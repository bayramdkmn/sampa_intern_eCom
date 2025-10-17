"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@/app/types/User";
import { authService } from "@/services/authService";
import { showToast, toastMessages } from "@/utils/toast";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sayfa yüklendiğinde authentication state'ini kontrol et
    const initAuth = () => {
      try {
        const savedUser = localStorage.getItem("user");
        const accessToken = localStorage.getItem("access_token");

        console.log("🔍 Auth Init - User:", savedUser ? "exists" : "null");
        console.log("🔍 Auth Init - Token:", accessToken ? "exists" : "null");

        if (savedUser && accessToken) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log(
            "✅ User loaded from localStorage:",
            parsedUser.firstName
          );
        } else {
          setUser(null);
          console.log("❌ No valid auth data found");
        }
      } catch (error) {
        console.error("❌ Auth init error:", error);
        setUser(null);
        // Hatalı verileri temizle
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = (userData: User) => {
    console.log("🚀 Login called with user:", userData);
    console.log("🖼️ Profile image in userData:", userData.profileImage);
    setUser(userData);
    // User bilgisini localStorage'a kaydet
    localStorage.setItem("user", JSON.stringify(userData));
    console.log("✅ User saved to localStorage:", {
      firstName: userData.firstName,
      profileImage: userData.profileImage,
      phoneNumber: userData.phoneNumber,
    });
  };

  const logout = async () => {
    console.log("🚪 Logout called");
    try {
      await authService.logout();
      showToast.success(toastMessages.logoutSuccess);
    } catch (error) {
      console.error("❌ Logout API error:", error);
      showToast.error("Çıkış yapılırken bir hata oluştu");
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      console.log("✅ All auth data cleared");
      try {
        await fetch("/api/auth/clear-cookie", { method: "POST" });
        console.log("✅ HttpOnly cookies cleared via API route");
      } catch (e) {
        console.error("Cookie clear error:", e);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
