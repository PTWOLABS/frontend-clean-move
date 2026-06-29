import { toast } from "sonner";
import type { UseFormSetError } from "react-hook-form";

import { ApiError } from "@/shared/api/httpClient";
import { parseApiValidationIssues } from "@/features/user/lib/parse-api-validation-issues";

import type { ResetPasswordFormValues } from "../schemas/reset-password-schema";

const RESET_PASSWORD_FORM_FIELDS = new Set(["newPassword", "confirmPassword"]);

function applyResetValidationIssues(
  issues: ReturnType<typeof parseApiValidationIssues>,
  setError: UseFormSetError<ResetPasswordFormValues>,
) {
  if (!issues) {
    return 0;
  }

  let appliedCount = 0;

  for (const issue of issues) {
    if (!RESET_PASSWORD_FORM_FIELDS.has(issue.path)) {
      continue;
    }

    setError(issue.path as keyof ResetPasswordFormValues, {
      type: "server",
      message: issue.message,
    });
    appliedCount += 1;
  }

  return appliedCount;
}

export function handlePasswordResetConfirmError(
  error: unknown,
  setError: UseFormSetError<ResetPasswordFormValues>,
) {
  if (!(error instanceof ApiError)) {
    toast.error("Não foi possível redefinir a senha. Tente novamente mais tarde.");
    return;
  }

  if (error.statusCode === 429) {
    toast.error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
    return;
  }

  if (error.statusCode === 400) {
    const issues = parseApiValidationIssues(error.payload);
    const appliedCount = applyResetValidationIssues(issues, setError);

    if (appliedCount > 0) {
      toast.error("Verifique os dados informados.");
      return;
    }

    toast.error(
      error.message || "Não foi possível redefinir a senha. Verifique os dados informados.",
    );
    return;
  }

  toast.error("Não foi possível redefinir a senha. Tente novamente mais tarde.");
}
