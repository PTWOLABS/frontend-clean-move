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
    case 400:
      return {
        id,
        title: `Não foi possível ${mutationTypeLabel} ${resourceLabel}.`,
        description: "Verifique se os dados enviados estão corretos.",
        statusCode: error.statusCode,
        ...override?.badRequest,
      };
    case 401:
      return {
        id,
        title: "Sua sessão expirou.",
        description: "Atualize a página e faça login novamente se necessário para continuar.",
        statusCode: error.statusCode,
        ...override?.unauthorized,
      };
    case 403:
      return {
        id,
        title: `Acesso negado em ${resourceLabel}.`,
        description: `Seu usuário não tem permissão para ${mutationTypeLabel} esse recurso.`,
        statusCode: error.statusCode,
        ...override?.forbidden,
      };
    case 404:
      return {
        id,
        title: "Usuário sem permissão.",
        description: `Não enconstramos um perfil com as devidas permissões para ${mutationTypeLabel} este recurso.`,
        statusCode: error.statusCode,
        ...override?.notFound,
      };
    case 500:
      return {
        id,
        title: `Falha ao carregar ${resourceLabel}.`,
        description: `O servidor falhou ao tentar ${mutationTypeLabel} este recurso. Tente novamente em instantes.`,
        statusCode: error.statusCode,
        ...override?.badRequest,
      };
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
