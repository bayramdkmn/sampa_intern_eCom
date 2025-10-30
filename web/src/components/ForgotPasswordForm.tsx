"use client";
import Link from "next/link";
import { useState } from "react";
import { clientApi } from "@/services/ClientApi";
import { showToast } from "@/utils/toast";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "code" | "reset" | "success">(
    "email"
  );
  const [email, setEmail] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const handleSendMail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await clientApi.makeRequest<{
        message: string;
        code: string;
      }>(
        "/users/password-reset/request/",
        {
          method: "POST",
          body: JSON.stringify({ email }),
        },
        true
      );
      showToast.success("Doğrulama kodu e-posta adresine gönderildi.");
      setSentCode(result.code);
      setStep("code");
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
      showToast.error(err.message || "Bir hata oluştu.");
    }
    setLoading(false);
  };

  const handleCheckCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (codeInput === sentCode) {
      setStep("reset");
    } else {
      setError("Girilen kod yanlış.");
      showToast.error("Girilen kod yanlış.");
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (newPassword !== newPasswordConfirm) {
      setError("Şifreler uyuşmuyor.");
      showToast.warning("Şifreler uyuşmuyor.");
      setLoading(false);
      return;
    }
    try {
      const result = await clientApi.makeRequest<{ message: string }>(
        "/users/password-reset/confirm/",
        {
          method: "POST",
          body: JSON.stringify({
            email,
            code: sentCode,
            new_password: newPassword,
            new_password_confirm: newPasswordConfirm,
          }),
        },
        true
      );
      showToast.success("Şifreniz başarıyla değiştirildi.");
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
      showToast.error(err.message || "Bir hata oluştu.");
    }
    setLoading(false);
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
        {step === "email" && (
          <>
            <div className="text-center mb-6 lg:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Şifre Sıfırlama
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Şifre yenileme kodu almak için e‑posta adresinizi yazın.
              </p>
            </div>
            <form onSubmit={handleSendMail} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded mb-2">
                  {error}
                </div>
              )}
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                disabled={loading}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                disabled={loading}
              >
                {loading ? "Gönderiliyor..." : "Kodu Gönder"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Şifrenizi hatırlıyor musunuz?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Giriş Yap
                </Link>
              </p>
            </div>
          </>
        )}
        {step === "code" && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Kodu Doğrula
              </h2>
              <p className="text-gray-600 mb-4">
                E‑posta adresinize gönderilen kodu girin.
              </p>
            </div>
            <form onSubmit={handleCheckCode} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded mb-2">
                  {error}
                </div>
              )}
              <input
                id="resetCode"
                type="text"
                required
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Doğrulama Kodu"
                disabled={loading}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                disabled={loading}
              >
                Doğrula
              </button>
            </form>
          </>
        )}
        {step === "reset" && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Yeni Şifre Belirle
              </h2>
              <p className="text-gray-600 mb-4">Yeni şifrenizi girin.</p>
            </div>
            <form onSubmit={handleReset} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-200 text-red-600 px-4 py-2 rounded mb-2">
                  {error}
                </div>
              )}
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Yeni Şifre"
                disabled={loading}
              />
              <input
                id="newPasswordConfirm"
                type="password"
                required
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Yeni Şifre (Tekrar)"
                disabled={loading}
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
                disabled={loading}
              >
                {loading ? "Kaydediliyor..." : "Şifreyi Sıfırla"}
              </button>
            </form>
          </>
        )}
        {step === "success" && (
          <div className="text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Şifre Başarıyla Değiştirildi
            </h2>
            <p className="text-gray-600 mb-6">
              Yeni şifrenizle giriş yapabilirsiniz.
            </p>
            <Link
              href="/login"
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            >
              Giriş Yap
            </Link>
          </div>
        )}
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
