import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/password-reset/components/forgot-password-form";
import { ForgotPasswordHeader } from "@/features/password-reset/components/forgot-password-header";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
  description: "Solicite um link para redefinir sua senha CleanMove.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <ForgotPasswordHeader />
      <ForgotPasswordForm />
    </>
  );
}
