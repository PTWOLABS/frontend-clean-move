export type PasswordValidationIssue = {
  path: string;
  message: string;
  code?: string;
};

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
  issues?: Array<{
    path?: string | string[];
    message?: string;
    code?: string;
  }>;
};

function normalizeIssuePath(path: string | string[] | undefined): string {
  if (Array.isArray(path)) {
    return path.join(".");
  }

  return path ?? "";
}

function translatePasswordValidationIssue(issue: {
  path?: string | string[];
  message?: string;
  code?: string;
}): string {
  const path = normalizeIssuePath(issue.path);

  if (issue.code === "too_small" && path === "newPassword") {
    return "A senha deve ter pelo menos 8 caracteres.";
  }

  if (issue.code === "too_big" && path === "newPassword") {
    return "A senha deve ter no máximo 72 caracteres.";
  }

  if (issue.code === "invalid_type") {
    if (path === "newPassword") {
      return "Informe a nova senha.";
    }

    if (path === "currentPassword") {
      return "Informe sua senha atual.";
    }
  }

  return issue.message ?? "Valor inválido.";
}

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
        message:
          payload.message ??
          "A senha atual informada está incorreta. Verifique e tente novamente.",
        field: "currentPassword",
      };
    }

    if (payload.message === "Validation failed" && Array.isArray(payload.issues)) {
      return {
        kind: "validation",
        issues: payload.issues.map((issue) => ({
          path: normalizeIssuePath(issue.path),
          message: translatePasswordValidationIssue(issue),
          code: issue.code,
        })),
      };
    }

    return {
      kind: "business",
      message: payload.message ?? "Não foi possível atualizar a senha.",
    };
  }

  return {
    kind: "unknown",
    message: payload.message ?? "Não foi possível atualizar a senha. Tente novamente mais tarde.",
  };
}
