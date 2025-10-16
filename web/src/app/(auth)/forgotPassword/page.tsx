import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sampa | Forgot Password",
  description: "Reset your password",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
