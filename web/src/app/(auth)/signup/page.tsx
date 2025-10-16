import SignupForm from "@/components/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sampa | Sign Up",
  description: "Create a new account to start shopping",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function SignupPage() {
  return <SignupForm />;
}
