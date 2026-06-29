export type ApiValidationIssue = {
  path: string;
  message: string;
  code?: string;
};

type ApiValidationPayload = {
  message?: string;
  issues?: Array<{
    path?: string | string[];
    message?: string;
    code?: string;
  }>;
};

export function normalizeApiIssuePath(path: string | string[] | undefined): string {
  if (Array.isArray(path)) {
    return path.join(".");
  }

  return path ?? "";
}

export function translatePasswordFieldValidationIssue(issue: {
  path?: string | string[];
  message?: string;
  code?: string;
}): string {
  const path = normalizeApiIssuePath(issue.path);

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

export function parseApiValidationIssues(body: unknown): ApiValidationIssue[] | null {
  const payload = (body ?? {}) as ApiValidationPayload;

  if (payload.message !== "Validation failed" || !Array.isArray(payload.issues)) {
    return null;
  }

  return payload.issues.map((issue) => ({
    path: normalizeApiIssuePath(issue.path),
    message: translatePasswordFieldValidationIssue(issue),
    code: issue.code,
  }));
}
