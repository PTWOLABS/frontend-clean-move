"use client";

import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";
import { useEffect, useMemo } from "react";

type QueryErrorFeedbackParams = {
  resourceKey: string;
  resourceLabel: string;
  error: unknown;
  override?: QueryFeedbackErrorOverride;
};

export type QueryErrorFeedback = {
  title: string;
  description: string;
  statusCode?: number;
};

export type QueryFeedbackErrorOverride = {
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

export function getQueryFeedbackError(
  resourceLabel: string,
  error: unknown,
  override?: QueryFeedbackErrorOverride,
): QueryErrorFeedback {
  const genericFeedback = {
    title: `Não foi possível carregar ${resourceLabel}.`,
    description: "Tente novamente em alguns instantes.",
  } satisfies QueryErrorFeedback;

  if (!(error instanceof ApiError)) {
    return genericFeedback;
  }

  switch (error.statusCode) {
    case 400:
      return {
        title: `Não foi possível carregar ${resourceLabel}.`,
        description:
          "Os filtros enviados são inválidos. Revise o período selecionado e tente novamente.",
        statusCode: error.statusCode,
        ...override?.badRequest,
      };
    case 401:
      return {
        title: "Sua sessão expirou.",
        description: "Atualize a página e faça login novamente se necessário para continuar.",
        statusCode: error.statusCode,
        ...override?.unauthorized,
      };
    case 403:
      return {
        title: `Acesso negado em ${resourceLabel}.`,
        description: "Seu usuário não tem permissão para acessar esse recurso.",
        statusCode: error.statusCode,
        ...override?.forbidden,
      };
    case 404:
      return {
        title: "Usuário sem permissão.",
        description:
          "Não enconstramos um perfil com as devidas permissões para acessar este recuros.",
        statusCode: error.statusCode,
        ...override?.notFound,
      };
    case 500:
      return {
        title: `Falha ao carregar ${resourceLabel}.`,
        description: "O servidor falhou ao ler este recurso. Tente novamente em instantes.",
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

export function useQueryFeedbackError({
  error,
  resourceKey,
  resourceLabel,
  override,
}: QueryErrorFeedbackParams) {
  console.log("ERRO AQUI:", error);
  const feedback = useMemo(() => {
    if (!error) {
      return null;
    }

    return getQueryFeedbackError(resourceLabel, error, override);
  }, [error, resourceLabel, override]);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    toast.error(feedback.title, {
      id: `dashboard-${resourceKey}-${feedback.statusCode ?? "unknown"}`,
      description: feedback.description,
    });
  }, [feedback, resourceKey]);

  return feedback;
}
