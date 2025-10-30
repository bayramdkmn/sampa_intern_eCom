"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { LoginData, AuthResponse } from "@/services";
import { showToast, toastMessages } from "@/utils/toast";
import { clientApi } from "@/services/ClientApi";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedEmail && savedRememberMe) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setIsLoading(true);

    try {
      const loginData: LoginData = {
        email: email,
        password: password,
      };


      const response: AuthResponse = await authService.login(loginData);


      const accessToken = response.access_token || response.access;
      const refreshToken = response.refresh_token || response.refresh || "";

      if (accessToken) {
        authService.saveTokens(accessToken, refreshToken);

        try {
          await fetch("/api/auth/set-cookie", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              access_token: accessToken,
              refresh_token: refreshToken,
            }),
          });
        } catch (e) {
          console.error("Cookie set error:", e);
        }
      }

      const getProfileImageUrl = (imagePath: string | null | undefined) => {
        if (!imagePath) return undefined;

        if (imagePath.startsWith("http")) {
          return imagePath;
        }

        if (imagePath.startsWith("/media/")) {
          const baseURL =
            process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
          const cleanBaseURL = baseURL.replace("/api", "");
          return `${cleanBaseURL}${imagePath}`;
        }

        return imagePath;
      };

      let userData;

      try {
        const userProfile = await clientApi.getUserProfile();

        const profileImagePath =
          userProfile.profile_image || (userProfile as any).pro_photo;
        userData = {
          id: String(userProfile.id || userProfile.pk || "temp-id"),
          firstName: userProfile.first_name || userProfile.name || "User",
          lastName: userProfile.last_name || "",
          email: userProfile.email || email,
          phoneNumber: userProfile.phone_number,
          profileImage: getProfileImageUrl(profileImagePath),
        };
      } catch (profileError) {
        console.error(
          "⚠️ Failed to fetch user profile, using response.user fallback:",
          profileError
        );

        if (response.user) {
          const profileImagePath =
            response.user.profile_image || (response.user as any).pro_photo;
          userData = {
            id: response.user.id || response.user.pk || "temp-id",
            firstName: response.user.first_name || response.user.name || "User",
            lastName: response.user.last_name || "",
            email: response.user.email || email,
            phoneNumber: response.user.phone_number,
            profileImage: getProfileImageUrl(profileImagePath),
          };
        } else {
          userData = {
            id: "temp-id",
            firstName: email.split("@")[0] || "User",
            lastName: "",
            email: email,
            phoneNumber: undefined,
            profileImage: undefined,
          };
        }
      }

      login(userData);

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberMe");
      }

      showToast.success(toastMessages.loginSuccess);

      router.push("/");
    } catch (error: unknown) {
      let errorMessage = "Giriş sırasında bir hata oluştu";

      if (error && typeof error === "object") {
        const apiError = error as {
          errors?: Record<string, string[]>;
          message?: string;
          detail?: string;
        };

        if (apiError.errors && Object.keys(apiError.errors).length > 0) {
          const firstError = Object.values(apiError.errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMessage = firstError[0];
          } else if (typeof firstError === "string") {
            errorMessage = firstError;
          }
        } else if (apiError.message) {
          errorMessage = apiError.message;
        } else if (apiError.detail) {
          errorMessage = apiError.detail;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setError(errorMessage);
      showToast.error(toastMessages.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center px-4 sm:px-6 lg:px-12 xl:px-30 3xl:px-60 gap-8 lg:gap-20">
      <div className="w-full lg:w-3/5 flex justify-center lg:justify-start">
        <img
          src="/sampaConnect-logo.png"
          alt="Sampa Logo"
          className="aspect-auto object-contain max-w-[200px] sm:max-w-[300px] lg:max-w-full"
        />
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 lg:p-10 bg-white rounded-2xl shadow-2xl">
        <div className="text-center mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Tekrar Hoş Geldiniz
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Hesabınıza giriş yapın
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              E-posta
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Şifre
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="flex lg:flex-row flex-col items-center gap-4 justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600">Beni hatırla</span>
            </label>
            <Link
              href="/forgotPassword"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Şifremi unuttum?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Giriş Yapılıyor...
              </div>
            ) : (
              "Giriş Yap"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Hesabınız yok mu?{" "}
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Kayıt Ol
            </Link>
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
}
