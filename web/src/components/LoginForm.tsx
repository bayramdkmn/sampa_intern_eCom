"use client";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { authService, LoginData } from "@/services/authService";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setIsLoading(true);

    try {
      const loginData: LoginData = {
        email: email,
        password: password,
      };

      console.log("🔍 Login payload:", loginData);

      const response = await authService.login(loginData);

      console.log("🔍 Login Response:", response);

      const accessToken =
        (response as any).access_token || (response as any).access;
      const refreshToken =
        (response as any).refresh_token || (response as any).refresh || "";
      if (accessToken) {
        authService.saveTokens(accessToken, refreshToken);
      }

      let userData;
      if (response.user) {
        userData = {
          id: response.user.id || response.user.pk || "temp-id",
          firstName: response.user.first_name || response.user.name || "User",
          lastName: response.user.last_name || "",
          email: response.user.email || email,
          phoneNumber: response.user.phone_number,
          profileImage: response.user.profile_image,
        };
      } else if (response.username || response.email) {
        userData = {
          id: response.id || response.pk || "temp-id",
          firstName: response.first_name || response.name || "User",
          lastName: response.last_name || "",
          email: response.email || email,
          phoneNumber: response.phone_number,
          profileImage: response.profile_image,
        };
      } else {
        userData = {
          id: "temp-id",
          firstName: email,
          lastName: "",
          email: email,
          phoneNumber: undefined,
          profileImage: undefined,
        };
      }

      console.log("👤 User Data:", userData);
      login(userData);

      router.push("/");
    } catch (error: any) {
      console.error("Giriş hatası:", error);

      let errorMessage = "Giriş sırasında bir hata oluştu";

      if (error.errors && Object.keys(error.errors).length > 0) {
        const firstError = Object.values(error.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        } else if (typeof firstError === "string") {
          errorMessage = firstError;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.detail) {
        errorMessage = error.detail;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row justify-between items-center px-4 sm:px-6 lg:px-12 xl:px-30 3xl:px-60 gap-8 lg:gap-20">
      {/* Logo - Responsive sizing */}
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
