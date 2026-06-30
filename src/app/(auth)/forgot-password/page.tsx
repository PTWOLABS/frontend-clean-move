import type { Metadata } from "next";

import { ForgotPasswordScreen } from "@/features/password-reset/components/forgot-password-screen";

export const metadata: Metadata = {
  title: "Esqueci minha senha",
  description: "Solicite um link para redefinir sua senha CleanMove.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordScreen />;
}
