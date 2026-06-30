"use client";

import { useRequestPasswordReset } from "../hooks/use-request-password-reset";
import { ForgotPasswordForm } from "./forgot-password-form";
import { ForgotPasswordHeader } from "./forgot-password-header";

export function ForgotPasswordScreen() {
  const { mutate, isPending, isSuccess, reset } = useRequestPasswordReset();

  return (
    <>
      <ForgotPasswordHeader isSuccess={isSuccess} />
      <ForgotPasswordForm
        mutate={mutate}
        isPending={isPending}
        isSuccess={isSuccess}
        reset={reset}
      />
    </>
  );
}
