import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen flex justify-end items-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/login_background.png')" }}
    >
      <div className="absolute inset-0 bg-black/25" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
