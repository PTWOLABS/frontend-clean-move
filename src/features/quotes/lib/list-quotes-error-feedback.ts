import {
  resolveApiErrorFeedback,
  type ApiErrorFeedback,
} from "@/shared/lib/resolve-api-error-feedback";

export type ListQuotesErrorCode =
  | "VALIDATION_ERROR"
  | "FORBIDDEN"
  | "ESTABLISHMENT_NOT_FOUND"
  | "INTERNAL_ERROR";

export const LIST_QUOTES_ERROR_FEEDBACK = {
  VALIDATION_ERROR: {
    title: "Revise os filtros informados.",
    description: "Verifique os filtros de busca e tente novamente.",
  },
  FORBIDDEN: {
    title: "Sem permissão para consultar orçamentos.",
    description: "Solicite essa permissão a um administrador do estabelecimento.",
  },
  ESTABLISHMENT_NOT_FOUND: {
    title: "Estabelecimento não encontrado.",
    description:
      "Atualize a página e tente novamente. Se o problema persistir, entre em contato com o suporte.",
  },
  INTERNAL_ERROR: {
    title: "Não foi possível carregar os orçamentos.",
    description: "O servidor apresentou uma falha. Tente novamente em alguns instantes.",
  },
} satisfies Record<ListQuotesErrorCode, ApiErrorFeedback>;

const LIST_QUOTES_FALLBACK: ApiErrorFeedback = {
  title: "Não foi possível carregar os orçamentos.",
  description: "Tente novamente em alguns instantes.",
};

export function resolveListQuotesErrorFeedback(error: unknown) {
  return resolveApiErrorFeedback<ListQuotesErrorCode>({
    error,
    idPrefix: "list-quotes",
    fallback: LIST_QUOTES_FALLBACK,
    feedbackByCode: LIST_QUOTES_ERROR_FEEDBACK,
  });
}
