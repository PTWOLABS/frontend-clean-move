import type { Metadata } from "next";

import { ResetPasswordForm } from "@/features/password-reset/components/reset-password-form";
import { ResetPasswordHeader } from "@/features/password-reset/components/reset-password-header";
import { ResetPasswordInvalidToken } from "@/features/password-reset/components/reset-password-invalid-token";

export const metadata: Metadata = {
  title: "Redefinir senha",
  description: "Defina uma nova senha para sua conta CleanMove.",
};

type ResetPasswordPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const { token } = await searchParams;

  if (!token?.trim()) {
    return <ResetPasswordInvalidToken />;
  }

  return (
    <>
      <ResetPasswordHeader />
      <ResetPasswordForm token={token.trim()} />
    </>
  );
}
