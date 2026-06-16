"use client";

import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";

type MutationErrorFeedbackParams = {
  resourceKey: string;
  resourceLabel: string;
  error: unknown;
  mutationType: "create" | "update" | "delete";
  override?: MutationFeedbackErrorOverride;
};

export type MutationErrorFeedback = {
  id: string;
  title: string;
  description: string;
  statusCode?: number;
  issues?: MutationFeedbackErrorIssue[];
  fieldErrors?: Record<string, string>;
};

export type MutationFeedbackErrorIssue = {
  path?: string;
  message: string;
};

type MutationFeedbackErrorOverrideValue = {
  title?: string;
  message: string;
};

export type MutationFeedbackErrorMessageMatcher = {
  match: string | RegExp | ((message: string, error: ApiError) => boolean);
  title?: string;
  message: string;
  field?: string;
  statusCode?: number | number[];
};

export type MutationFeedbackErrorOverride = {
  badRequest?: MutationFeedbackErrorOverrideValue;
  validation?: MutationFeedbackErrorOverrideValue;
  unauthorized?: MutationFeedbackErrorOverrideValue;
  forbidden?: MutationFeedbackErrorOverrideValue;
  notFound?: MutationFeedbackErrorOverrideValue;
  conflict?: MutationFeedbackErrorOverrideValue;
  serverError?: MutationFeedbackErrorOverrideValue;
  messages?: MutationFeedbackErrorMessageMatcher[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeIssuePath(path: unknown) {
  if (Array.isArray(path)) {
    return path.filter((item) => typeof item === "string" || typeof item === "number").join(".");
  }

  if (typeof path === "string") {
    return path;
  }

  return undefined;
}

function getApiErrorIssues(error: ApiError): MutationFeedbackErrorIssue[] {
  if (!isRecord(error.payload) || !Array.isArray(error.payload.issues)) {
    return [];
  }

  return error.payload.issues.flatMap((issue) => {
    if (!isRecord(issue) || typeof issue.message !== "string") {
      return [];
    }

    return [
      {
        path: normalizeIssuePath(issue.path),
        message: issue.message,
      },
    ];
  });
}

function getFieldErrors(issues: MutationFeedbackErrorIssue[]) {
  return issues.reduce<Record<string, string>>((fieldErrors, issue) => {
    if (issue.path && !fieldErrors[issue.path]) {
      fieldErrors[issue.path] = issue.message;
    }

    return fieldErrors;
  }, {});
}

function hasFieldErrors(fieldErrors: Record<string, string>) {
  return Object.keys(fieldErrors).length > 0;
}

function matchesStatusCode(statusCode: number, matcherStatusCode?: number | number[]) {
  if (matcherStatusCode === undefined) {
    return true;
  }

  return Array.isArray(matcherStatusCode)
    ? matcherStatusCode.includes(statusCode)
    : matcherStatusCode === statusCode;
}

function matchesMessage(
  message: string,
  error: ApiError,
  matcher: MutationFeedbackErrorMessageMatcher,
) {
  if (typeof matcher.match === "string") {
    return message.includes(matcher.match);
  }

  if (matcher.match instanceof RegExp) {
    return matcher.match.test(message);
  }

  return matcher.match(message, error);
}

function getMatchedMessageFeedback({
  id,
  error,
  issues,
  fieldErrors,
  matchers,
}: {
  id: string;
  error: ApiError;
  issues: MutationFeedbackErrorIssue[];
  fieldErrors: Record<string, string>;
  matchers?: MutationFeedbackErrorMessageMatcher[];
}): MutationErrorFeedback | null {
  if (!matchers?.length) {
    return null;
  }

  const messagesToMatch = [error.message, ...issues.map((issue) => issue.message)];

  const matchedMatcher = matchers.find((matcher) => {
    if (!matchesStatusCode(error.statusCode, matcher.statusCode)) {
      return false;
    }

    return messagesToMatch.some((message) => matchesMessage(message, error, matcher));
  });

  if (!matchedMatcher) {
    return null;
  }

  const matchedFieldErrors = {
    ...fieldErrors,
    ...(matchedMatcher.field ? { [matchedMatcher.field]: matchedMatcher.message } : {}),
  };

  return {
    id,
    title: matchedMatcher.title ?? "Não foi possível concluir a operação.",
    description: matchedMatcher.message,
    statusCode: error.statusCode,
    issues,
    ...(hasFieldErrors(matchedFieldErrors) ? { fieldErrors: matchedFieldErrors } : {}),
  };
}

export function getMutationFeedbackError(
  resourceLabel: string,
  resourceKey: string,
  error: unknown,
  mutationType: "create" | "update" | "delete",
  override?: MutationFeedbackErrorOverride,
): MutationErrorFeedback {
  const mutationTypeLabel =
    mutationType === "create" ? "criar" : mutationType === "update" ? "atualizar" : "deletar";

  const genericFeedback = {
    id: `${mutationTypeLabel}-${resourceLabel}-${resourceKey}-genericError`,
    title: `Não foi possível ${mutationTypeLabel} ${resourceLabel}.`,
    description: "Tente novamente em alguns instantes.",
  } satisfies MutationErrorFeedback;

  if (!(error instanceof ApiError)) {
    return genericFeedback;
  }

  const id = `${mutationTypeLabel}-${resourceLabel}-${resourceKey}-${error.statusCode ?? "unknown"}`;
  const issues = getApiErrorIssues(error);
  const fieldErrors = getFieldErrors(issues);
  const matchedMessageFeedback = getMatchedMessageFeedback({
    id,
    error,
    issues,
    fieldErrors,
    matchers: override?.messages,
  });

  if (matchedMessageFeedback) {
    return matchedMessageFeedback;
  }

  switch (error.statusCode) {
    case 400: {
      const isValidationError = error.message === "Validation failed" && issues.length > 0;
      const badRequest = isValidationError
        ? (override?.validation ?? override?.badRequest)
        : override?.badRequest;

      return {
        id,
        title: badRequest?.title ?? `Não foi possível ${mutationTypeLabel} ${resourceLabel}.`,
        description:
          badRequest?.message ??
          (isValidationError
            ? "Revise os dados informados antes de continuar."
            : "Verifique se os dados enviados estão corretos."),
        statusCode: error.statusCode,
        issues,
        ...(hasFieldErrors(fieldErrors) ? { fieldErrors } : {}),
      };
    }
    case 401: {
      const unauthorized = override?.unauthorized;
      return {
        id,
        title: unauthorized?.title ?? "Sua sessão expirou.",
        description:
          unauthorized?.message ??
          "Atualize a página e faça login novamente se necessário para continuar.",
        statusCode: error.statusCode,
      };
    }
    case 403: {
      const forbidden = override?.forbidden;
      return {
        id,
        title: forbidden?.title ?? `Acesso negado em ${resourceLabel}.`,
        description:
          forbidden?.message ??
          `Seu usuário não tem permissão para ${mutationTypeLabel} esse recurso.`,
        statusCode: error.statusCode,
      };
    }
    case 404: {
      const notFound = override?.notFound;
      return {
        id,
        title: notFound?.title ?? "Usuário sem permissão.",
        description:
          notFound?.message ??
          `Não encontramos um perfil com as devidas permissões para ${mutationTypeLabel} este recurso.`,
        statusCode: error.statusCode,
      };
    }
    case 409: {
      const conflict = override?.conflict;
      return {
        id,
        title: conflict?.title ?? `Não foi possível ${mutationTypeLabel} ${resourceLabel}.`,
        description: conflict?.message ?? "Já existe um recurso cadastrado com esses dados.",
        statusCode: error.statusCode,
      };
    }
    case 500: {
      const serverError = override?.serverError ?? override?.badRequest;
      return {
        id,
        title: serverError?.title ?? `Falha ao carregar ${resourceLabel}.`,
        description:
          serverError?.message ??
          `O servidor falhou ao tentar ${mutationTypeLabel} este recurso. Tente novamente em instantes.`,
        statusCode: error.statusCode,
      };
    }
    default:
      return {
        ...genericFeedback,
        statusCode: error.statusCode,
        issues,
        ...(hasFieldErrors(fieldErrors) ? { fieldErrors } : {}),
      };
  }
}

export function useMutationFeedbackError({
  error,
  resourceKey,
  resourceLabel,
  mutationType,
  override,
}: MutationErrorFeedbackParams) {
  const feedback = useMemo(() => {
    if (!error) {
      return null;
    }

    return getMutationFeedbackError(resourceLabel, resourceKey, error, mutationType, override);
  }, [error, resourceLabel, override, resourceKey, mutationType]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    toast.error(feedback.title, {
      id: feedback.id,
      description: feedback.description,
    });
  }, [feedback, resourceKey]);

  return feedback;
}
