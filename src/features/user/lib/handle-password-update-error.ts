import { toast } from "sonner";
import type { UseFormSetError } from "react-hook-form";

import { ApiError } from "@/shared/api/httpClient";
import type {
  PasswordConfirmationCodeFormValues,
  PasswordSettingsFormValues,
} from "@/features/settings/schemas/password-settings-schema";

import {
  getPasswordFieldErrorFromParsed,
  parsePasswordUpdateError,
  type PasswordUpdateError,
  type PasswordValidationIssue,
} from "./parse-password-update-error";

const PASSWORD_FORM_FIELDS = new Set(["currentPassword", "newPassword"]);
const CONFIRMATION_FORM_FIELDS = new Set(["confirmationCode"]);

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

function applyConfirmationValidationIssues(
  issues: PasswordValidationIssue[],
  setError: UseFormSetError<PasswordConfirmationCodeFormValues>,
) {
  let appliedCount = 0;

  for (const issue of issues) {
    if (!CONFIRMATION_FORM_FIELDS.has(issue.path)) {
      continue;
    }

    setError(issue.path as keyof PasswordConfirmationCodeFormValues, {
      type: "server",
      message: issue.message,
    });
    appliedCount += 1;
  }

  return appliedCount;
}

type HandlePasswordUpdateErrorOptions = {
  setError?: UseFormSetError<PasswordSettingsFormValues>;
  setConfirmationError?: UseFormSetError<PasswordConfirmationCodeFormValues>;
  onUnauthorized: () => void;
  onPasswordFieldError?: (error: PasswordUpdateError) => void;
};

function handleParsedPasswordUpdateError(
  parsed: PasswordUpdateError,
  {
    setError,
    setConfirmationError,
    onUnauthorized,
    onPasswordFieldError,
  }: HandlePasswordUpdateErrorOptions,
) {
  switch (parsed.kind) {
    case "validation": {
      const passwordIssues = parsed.issues.filter((issue) => PASSWORD_FORM_FIELDS.has(issue.path));
      const confirmationIssues = parsed.issues.filter((issue) =>
        CONFIRMATION_FORM_FIELDS.has(issue.path),
      );

      if (passwordIssues.length > 0) {
        if (setError) {
          applyValidationIssues(passwordIssues, setError);
        } else if (onPasswordFieldError) {
          onPasswordFieldError(parsed);
          return;
        }

        toast.error("Verifique os dados informados.");
        return;
      }

      if (confirmationIssues.length > 0 && setConfirmationError) {
        applyConfirmationValidationIssues(confirmationIssues, setConfirmationError);
        toast.error("Verifique o código informado.");
        return;
      }

      toast.error("Verifique os dados informados.");
      return;
    }

    case "wrong_current":
    case "same_as_current": {
      if (setError) {
        setError(parsed.field, {
          type: "server",
          message: parsed.message,
        });
        return;
      }

      onPasswordFieldError?.(parsed);
      return;
    }

    case "invalid_confirmation_code": {
      if (setConfirmationError) {
        setConfirmationError("confirmationCode", {
          type: "server",
          message: parsed.message,
        });
        return;
      }

      onPasswordFieldError?.(parsed);
      return;
    }

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

export { getPasswordFieldErrorFromParsed };
