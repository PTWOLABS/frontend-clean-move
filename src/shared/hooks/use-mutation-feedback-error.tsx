"use client";

import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { useEffect, useMemo } from "react";

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
};

export type MutationFeedbackErrorOverride = {
  badRequest?: {
    title?: string;
    message: string;
  };
  unauthorized?: {
    title?: string;
    message: string;
  };
  forbidden?: {
    title?: string;
    message: string;
  };
  notFound?: {
    title?: string;
    message: string;
  };
};

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

  switch (error.statusCode) {
    case 400: {
      const badRequest = override?.badRequest;
      return {
        id,
        title: badRequest?.title ?? `Não foi possível ${mutationTypeLabel} ${resourceLabel}.`,
        description: badRequest?.message ?? "Verifique se os dados enviados estão corretos.",
        statusCode: error.statusCode,
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
          `Não enconstramos um perfil com as devidas permissões para ${mutationTypeLabel} este recurso.`,
        statusCode: error.statusCode,
      };
    }
    case 500: {
      const serverError = override?.badRequest;
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
