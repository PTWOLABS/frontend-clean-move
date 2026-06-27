import { toast } from "sonner";
import type { UseFormSetError } from "react-hook-form";

import { ApiError } from "@/shared/api/httpClient";
import type { PasswordSettingsFormValues } from "@/features/settings/schemas/password-settings-schema";

import {
  parsePasswordUpdateError,
  type PasswordUpdateError,
  type PasswordValidationIssue,
} from "./parse-password-update-error";

const PASSWORD_FORM_FIELDS = new Set(["currentPassword", "newPassword"]);

function applyValidationIssues(
  issues: PasswordValidationIssue[],
  setError: UseFormSetError<PasswordSettingsFormValues>,
) {
  let appliedCount = 0;

  for (const issue of issues) {
    if (!PASSWORD_FORM_FIELDS.has(issue.path)) {
      continue;
    }

    setError(issue.path as keyof PasswordSettingsFormValues, {
      type: "server",
      message: issue.message,
    });
    appliedCount += 1;
  }

  return appliedCount;
}

type HandlePasswordUpdateErrorOptions = {
  setError: UseFormSetError<PasswordSettingsFormValues>;
  onUnauthorized: () => void;
};

function handleParsedPasswordUpdateError(
  parsed: PasswordUpdateError,
  { setError, onUnauthorized }: HandlePasswordUpdateErrorOptions,
) {
  switch (parsed.kind) {
    case "validation": {
      const appliedCount = applyValidationIssues(parsed.issues, setError);

      if (appliedCount > 0) {
        toast.error("Verifique os dados informados.");
        return;
      }

      toast.error("Verifique os dados informados.");
      return;
    }

    case "wrong_current":
      setError("currentPassword", {
        type: "server",
        message: parsed.message,
      });
      return;

    case "unauthorized":
      onUnauthorized();
      return;

    case "rate_limit":
      toast.error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      return;

    case "not_found":
      toast.error(parsed.message);
      return;

    case "business":
    case "unknown":
      toast.error(parsed.message);
      return;
  }
}

export function handlePasswordUpdateError(
  error: unknown,
  options: HandlePasswordUpdateErrorOptions,
) {
  if (!(error instanceof ApiError)) {
    toast.error("Não foi possível atualizar a senha. Tente novamente mais tarde.");
    return;
  }

  handleParsedPasswordUpdateError(
    parsePasswordUpdateError(error.statusCode, error.payload),
    options,
  );
}
