import { parseApiValidationIssues, type ApiValidationIssue } from "./parse-api-validation-issues";
import {
  translateInvalidCurrentPasswordMessage,
  translateInvalidPasswordConfirmationCodeMessage,
  translatePasswordBusinessMessage,
  translateSameAsCurrentPasswordMessage,
} from "./translate-password-api-message";

export type PasswordValidationIssue = ApiValidationIssue;

export type PasswordFieldError = {
  field: "currentPassword" | "newPassword" | "confirmationCode";
  message: string;
};

export type PasswordUpdateError =
  | { kind: "validation"; issues: PasswordValidationIssue[] }
  | { kind: "wrong_current"; message: string; field: "currentPassword" }
  | { kind: "same_as_current"; message: string; field: "newPassword" }
  | { kind: "invalid_confirmation_code"; message: string; field: "confirmationCode" }
  | { kind: "business"; message: string }
  | { kind: "unauthorized" }
  | { kind: "not_found"; message: string }
  | { kind: "rate_limit" }
  | { kind: "unknown"; message: string };

type PasswordUpdateErrorPayload = {
  message?: string;
  code?: string;
  field?: string;
};

export function parsePasswordUpdateError(status: number, body: unknown): PasswordUpdateError {
  const payload = (body ?? {}) as PasswordUpdateErrorPayload;

  if (status === 401) {
    return { kind: "unauthorized" };
  }

  if (status === 429) {
    return { kind: "rate_limit" };
  }

  if (status === 404) {
    return {
      kind: "not_found",
      message: payload.message ?? "Usuário não encontrado.",
    };
  }

  if (status === 400) {
    if (payload.code === "INVALID_CURRENT_PASSWORD") {
      return {
        kind: "wrong_current",
        message: translateInvalidCurrentPasswordMessage(),
        field: "currentPassword",
      };
    }

    if (payload.code === "SAME_AS_CURRENT_PASSWORD") {
      return {
        kind: "same_as_current",
        message: translateSameAsCurrentPasswordMessage(),
        field: "newPassword",
      };
    }

    if (payload.code === "INVALID_PASSWORD_CONFIRMATION_CODE") {
      return {
        kind: "invalid_confirmation_code",
        message: translateInvalidPasswordConfirmationCodeMessage(),
        field: "confirmationCode",
      };
    }

    const issues = parseApiValidationIssues(body);

    if (issues) {
      return {
        kind: "validation",
        issues,
      };
    }

    return {
      kind: "business",
      message: translatePasswordBusinessMessage(
        payload.message ?? "Não foi possível atualizar a senha.",
      ),
    };
  }

  return {
    kind: "unknown",
    message: payload.message ?? "Não foi possível atualizar a senha. Tente novamente mais tarde.",
  };
}

export function getPasswordFieldErrorFromParsed(
  parsed: PasswordUpdateError,
): PasswordFieldError | null {
  switch (parsed.kind) {
    case "wrong_current":
      return { field: parsed.field, message: parsed.message };
    case "same_as_current":
      return { field: parsed.field, message: parsed.message };
    case "invalid_confirmation_code":
      return { field: parsed.field, message: parsed.message };
    case "validation": {
      const passwordFieldIssue = parsed.issues.find((issue) =>
        ["currentPassword", "newPassword", "confirmationCode"].includes(issue.path),
      );

      if (!passwordFieldIssue) {
        return null;
      }

      return {
        field: passwordFieldIssue.path as PasswordFieldError["field"],
        message: passwordFieldIssue.message,
      };
    }
    default:
      return null;
  }
}
