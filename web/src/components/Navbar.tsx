"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <div className="bg-white text-black flex-row flex justify-between px-4 py-4">
      <div className="flex flex-row gap-32 items-center justify-center">
        <Link href="/" className="flex flex-row pl-10 cursor-pointer">
          <img src="/sampa-logo.png" alt="logo" width={50} height={50} />
        </Link>
        <div className="gap-10 flex flex-row">
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
            placeholder="Search for products..."
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
          href="/login"
          className="flex items-center gap-2 rounded-full border border-black/10 px-3 py-2 hover:bg-black/5 transition-colors"
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
          <span className="text-sm font-medium">Login</span>
        </Link>
      </div>
    </div>
  );
}
