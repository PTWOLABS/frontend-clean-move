"use client";

import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { ApiError } from "@/shared/api/httpClient";

type DashboardQueryErrorFeedbackParams = {
  resourceKey: string;
  resourceLabel: string;
  error: unknown;
};

export type DashboardQueryErrorFeedback = {
  title: string;
  description: string;
  statusCode?: number;
};

export function getDashboardQueryErrorFeedback(
  resourceLabel: string,
  error: unknown,
): DashboardQueryErrorFeedback {
  const genericFeedback = {
    title: `Não foi possível carregar ${resourceLabel}.`,
    description: "Tente novamente em alguns instantes.",
  } satisfies DashboardQueryErrorFeedback;

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
      };
    case 401:
      return {
        title: "Sua sessão expirou.",
        description: "Atualize a página e faça login novamente se necessário para continuar.",
        statusCode: error.statusCode,
      };
    case 403:
      return {
        title: `Acesso negado em ${resourceLabel}.`,
        description:
          "Seu usuário não tem permissão para acessar as métricas deste estabelecimento.",
        statusCode: error.statusCode,
      };
    case 404:
      return {
        title: "Estabelecimento não encontrado.",
        description: "Não encontramos um perfil de estabelecimento vinculado à sua conta.",
        statusCode: error.statusCode,
      };
    case 500:
      return {
        title: `Falha ao carregar ${resourceLabel}.`,
        description:
          "O servidor falhou ao ler as métricas do dashboard. Tente novamente em instantes.",
        statusCode: error.statusCode,
      };
    default:
      return {
        ...genericFeedback,
        statusCode: error.statusCode,
      };
  }
}

export function useDashboardQueryErrorFeedback({
  resourceKey,
  resourceLabel,
  error,
}: DashboardQueryErrorFeedbackParams) {
  const feedback = useMemo(() => {
    if (!error) {
      return null;
    }

    return getDashboardQueryErrorFeedback(resourceLabel, error);
  }, [error, resourceLabel]);

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
