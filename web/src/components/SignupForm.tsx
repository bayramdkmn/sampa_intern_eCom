"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authService, RegisterData } from "@/services/authService";

export default function SignupForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Şifre kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor!");
      return;
    }

    // Şifre uzunluk kontrolü
    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır!");
      return;
    }

    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
      };

      const response = await authService.register(registerData);

      console.log("🔍 Register Response:", response);

      // Token'ları kaydet; yoksa otomatik login dene
      const accessTokenDirect =
        (response as any).access_token || (response as any).access;
      const refreshTokenDirect =
        (response as any).refresh_token || (response as any).refresh || "";
      if (accessTokenDirect) {
        authService.saveTokens(accessTokenDirect, refreshTokenDirect);
      } else {
        try {
          const loginResp = await authService.login({
            email: registerData.email,
            password: registerData.password,
          });
          const accessFromLogin =
            (loginResp as any).access_token || (loginResp as any).access;
          const refreshFromLogin =
            (loginResp as any).refresh_token ||
            (loginResp as any).refresh ||
            "";
          if (accessFromLogin) {
            authService.saveTokens(accessFromLogin, refreshFromLogin);
          }
        } catch (e) {
          // otomatik login başarısız olabilir; kullanıcı daha sonra giriş yapabilir
        }
      }

      // User bilgilerini AuthContext'e kaydet - response yapısını kontrol et
      let userData;
      if (response.user) {
        userData = {
          id: response.user.id || response.user.pk || "temp-id",
          firstName: response.user.first_name || response.user.name || "User",
          lastName: response.user.last_name || "",
          email: response.user.email || registerData.email,
          phoneNumber: response.user.phone_number,
          profileImage: response.user.profile_image,
        };
      } else if (response.username || response.email) {
        // Eğer user objesi yoksa, response'un kendisi user bilgilerini içeriyor olabilir
        userData = {
          id: response.id || response.pk || "temp-id",
          firstName: response.first_name || response.name || "User",
          lastName: response.last_name || "",
          email: response.email || registerData.email,
          phoneNumber: response.phone_number,
          profileImage: response.profile_image,
        };
      } else {
        // Fallback - en azından email ile user oluştur
        userData = {
          id: "temp-id",
          firstName: registerData.first_name || "User",
          lastName: "",
          email: registerData.email,
          phoneNumber: undefined,
          profileImage: undefined,
        };
      }

      console.log("👤 User Data:", userData);
      login(userData);

      router.push("/");
    } catch (error: any) {
      console.error("Kayıt hatası:", error);

      let errorMessage = "Kayıt sırasında bir hata oluştu";

      if (error.errors && Object.keys(error.errors).length > 0) {
        // Django'dan gelen field hatalarını göster
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
            Hesap Oluştur
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Başlamak için kayıt olun
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ad
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                required
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ahmet"
              />
            </div>
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Soyad
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                required
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Yılmaz"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              E-posta Adresi
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Şifre Tekrar
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              required
              className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-600">
              I agree to the{" "}
              <Link href="/terms" className="text-blue-600 hover:text-blue-700">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                className="text-blue-600 hover:text-blue-700"
              >
                Privacy Policy
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Kayıt Olunuyor...
              </div>
            ) : (
              "Hesap Oluştur"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Zaten hesabınız var mı?{" "}
            <Link
              href="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Giriş Yap
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
