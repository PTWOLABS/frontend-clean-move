import { toast } from "sonner";
import type { UseFormSetError } from "react-hook-form";

import { ApiError } from "@/shared/api/httpClient";

import { isInvalidPasswordResetTokenError } from "../hooks/use-confirm-password-reset";
import type { ResetPasswordFormValues } from "../schemas/reset-password-schema";
import { getPasswordResetConfirmFeedbackError } from "./password-reset-mutation-feedback";

const RESET_PASSWORD_FORM_FIELDS = new Set(["newPassword", "confirmPassword"]);

function applyResetFieldErrors(
  fieldErrors: Record<string, string>,
  setError: UseFormSetError<ResetPasswordFormValues>,
) {
  for (const [field, message] of Object.entries(fieldErrors)) {
    if (!RESET_PASSWORD_FORM_FIELDS.has(field)) {
      continue;
    }

    setError(field as keyof ResetPasswordFormValues, {
      type: "server",
      message,
    });
  }
}

export function handlePasswordResetConfirmError(
  error: unknown,
  setError: UseFormSetError<ResetPasswordFormValues>,
) {
  if (isInvalidPasswordResetTokenError(error)) {
    return;
  }

  if (error instanceof ApiError && error.statusCode === 429) {
    toast.error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
    return;
  }

  const feedback = getPasswordResetConfirmFeedbackError(error);

  if (feedback.fieldErrors) {
    applyResetFieldErrors(feedback.fieldErrors, setError);
  }

  toast.error(feedback.title, {
    id: feedback.id,
    description: feedback.description,
  });
}
