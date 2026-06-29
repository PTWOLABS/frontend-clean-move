import { parseApiValidationIssues, type ApiValidationIssue } from "./parse-api-validation-issues";
import {
  translateInvalidCurrentPasswordMessage,
  translatePasswordBusinessMessage,
} from "./translate-password-api-message";

export type PasswordValidationIssue = ApiValidationIssue;

export type PasswordUpdateError =
  | { kind: "validation"; issues: PasswordValidationIssue[] }
  | { kind: "wrong_current"; message: string; field: "currentPassword" }
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
