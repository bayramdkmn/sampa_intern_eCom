"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();

  const links = useMemo(
    () => [
      { href: "/", label: "Anasayfa" },
      { href: "/products", label: "Ürünler" },
      { href: "/cart", label: "Sepet" },
      { href: "/auth/login", label: "Giriş" },
    ],
    []
  );

  return (
    <div className="bg-white text-black flex-row flex justify-between px-4 py-4">
      <div className="flex flex-row gap-32 items-center justify-center">
        <div className="flex flex-row pl-10">
          <img src="/sampa-logo.png" alt="logo" width={50} height={50} />
        </div>
        <div className="gap-10 flex flex-row">
          <div className=" hover:text-blue-500 hover:scale-105 transition-all duration-300">
            Home
          </div>
          <div className=" hover:text-blue-500 hover:scale-105 transition-all duration-300">
            Shop
          </div>
          <div className=" hover:text-blue-500 hover:scale-105 transition-all duration-300">
            New Arrivals
          </div>
          <div className=" hover:text-blue-500 hover:scale-125 transition-all duration-300">
            Sale
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
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
            placeholder="Ürün ara..."
            className="w-52 text-sm outline-none placeholder:text-black/40"
          />
        </div>
        <Link
          href="/basket"
          className="rounded-full border border-black/10 p-2 hover:bg-black/5 transition-colors"
          aria-label="Mesajlar"
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
        </Link>
        <Link
          href="/profile"
          className="flex items-center gap-2 rounded-full border border-black/10 px-2 py-1 hover:bg-black/5 transition-colors"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/10 text-sm font-medium">
            B
          </span>
        </Link>
      </div>
    </div>
  );
}
