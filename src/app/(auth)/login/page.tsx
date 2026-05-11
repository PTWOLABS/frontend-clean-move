import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";
import { LoginHeader } from "@/features/auth/components/login-header";

export const metadata: Metadata = {
  title: "Login",
  description: "Acesse sua conta CleanMove.",
};

export default function LoginPage() {
  return (
    <>
      <LoginHeader />
      <LoginForm />
    </>
  );
}
