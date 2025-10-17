import LoginForm from "@/components/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sampa | Login",
  description: "Sign in to your account to continue shopping",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function LoginPage() {
  return <LoginForm />;
}
