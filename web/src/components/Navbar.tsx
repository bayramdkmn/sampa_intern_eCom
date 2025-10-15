"use client";

import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";

export default function Navbar() {
  const { getTotalItems } = useCart();
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  const getInitials = () => {
    if (!user) return "";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(
      0
    )}`.toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white text-black flex flex-row justify-between items-center px-4 py-4 border-b border-black/10">
      <Link href="/" className="flex flex-row cursor-pointer">
        <img src="/sampa-logo.png" alt="logo" width={50} height={50} />
      </Link>

      <div className="hidden lg:flex flex-row gap-10 items-center">
        <Link
          href="/"
          className="cursor-pointer hover:text-blue-500 hover:scale-105 transition-all duration-300"
        >
          Home
        </Link>
        <Link
          href="/products"
          className="cursor-pointer hover:text-blue-500 hover:scale-105 transition-all duration-300"
        >
          Shop
        </Link>
        <Link
          href="/new-arrivals"
          className="cursor-pointer hover:text-blue-500 hover:scale-105 transition-all duration-300"
        >
          New Arrivals
        </Link>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 bg-white focus-within:ring-2 focus-within:ring-blue-500/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4 text-black/60"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Search for products..."
            className="w-52 text-sm outline-none placeholder:text-black/40"
          />
        </div>

        <Link
          href="/basket"
          className="hidden md:flex rounded-full border border-black/10 p-2 hover:bg-black/5 transition-colors relative"
          aria-label="Sepet"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <circle cx="9" cy="20" r="1.5" />
            <circle cx="17" cy="20" r="1.5" />
            <path d="M3 4h2l1.6 8.1a2 2 0 0 0 2 1.9h7.7a2 2 0 0 0 2-1.6L20 8H7" />
          </svg>
          {getTotalItems() > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {getTotalItems()}
            </span>
          )}
        </Link>

        {isLoading ? (
          <div className="flex items-center gap-2 rounded-full border border-black/10 px-2 md:px-3 py-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="hidden md:inline text-sm text-gray-500">
              Loading...
            </span>
          </div>
        ) : isAuthenticated ? (
          <div className="relative">
            <button
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="flex items-center gap-2 rounded-full border border-black/10 px-2 md:px-3 py-2 hover:bg-black/5 transition-colors cursor-pointer"
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  {getInitials()}
                </div>
              )}
              <span className="hidden md:inline text-sm font-medium">
                {user?.firstName}
              </span>
            </button>

            {isModalOpen && (
              <div
                ref={modalRef}
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-black/10 py-2 z-50"
              >
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-sm font-medium">Profili Görüntüle</span>
                </Link>

                <Link
                  href="/orders"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-black/5 transition-colors"
                  onClick={() => setIsModalOpen(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M16 8v-4a4 4 0 0 0-8 0v4M3 10h18l-2 12H5L3 10z" />
                  </svg>
                  <span className="text-sm font-medium">Siparişlerim</span>
                </Link>

                <div className="border-t border-black/10 my-2"></div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left text-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="text-sm font-medium">Çıkış Yap</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 rounded-full border border-black/10 px-2 md:px-3 py-2 hover:bg-black/5 transition-colors cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="hidden md:inline text-sm font-medium">Login</span>
          </Link>
        )}
      </div>
    </div>
  );
}
