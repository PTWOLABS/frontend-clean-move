"use client";

import { useState } from "react";

import { useRequestPasswordReset } from "../hooks/use-request-password-reset";
import type { ForgotPasswordFormValues } from "../schemas/forgot-password-schema";
import { ForgotPasswordForm } from "./forgot-password-form";
import { ForgotPasswordHeader } from "./forgot-password-header";

export function ForgotPasswordScreen() {
  const { mutate, isPending, isSuccess, reset } = useRequestPasswordReset();
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [showResendForm, setShowResendForm] = useState(false);

  const showSuccess = isSuccess && !showResendForm;

  const handleSubmit = (data: ForgotPasswordFormValues) => {
    mutate(data, {
      onSuccess: () => {
        setSubmittedEmail(data.email);
        setShowResendForm(false);
      },
    });
  };

  const handleResendClick = () => {
    setShowResendForm(true);
    reset();
  };

  return (
    <>
      <ForgotPasswordHeader isSuccess={showSuccess} />
      <ForgotPasswordForm
        onSubmit={handleSubmit}
        isPending={isPending}
        isSuccess={showSuccess}
        onResendClick={handleResendClick}
        showResendReminder={showResendForm}
        defaultEmail={submittedEmail}
      />
    </>
  );
}
