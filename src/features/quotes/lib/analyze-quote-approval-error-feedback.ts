import {
  resolveApiErrorFeedback,
  type ApiErrorFeedback,
} from "@/shared/lib/resolve-api-error-feedback";

export type AnalyzeQuoteApprovalErrorCode =
  | "VALIDATION_ERROR"
  | "QUOTE_INVALID_SCHEDULE_INTERVAL"
  | "QUOTE_ALREADY_CONVERTED"
  | "FORBIDDEN"
  | "QUOTE_NOT_FOUND"
  | "ESTABLISHMENT_NOT_FOUND"
  | "INTERNAL_ERROR";

export const ANALYZE_QUOTE_APPROVAL_ERROR_FEEDBACK = {
  VALIDATION_ERROR: {
    title: "Revise os dados da análise.",
    description: "Verifique o orçamento e o período informado antes de continuar.",
  },
  QUOTE_INVALID_SCHEDULE_INTERVAL: {
    title: "Período inválido.",
    description: "A data de término deve ser posterior à data de início.",
  },
  QUOTE_ALREADY_CONVERTED: {
    title: "Orçamento já convertido.",
    description: "Este orçamento já virou um agendamento e não pode ser aprovado novamente.",
  },
  FORBIDDEN: {
    title: "Sem permissão para aprovar orçamentos.",
    description: "Solicite essa permissão a um administrador do estabelecimento.",
  },
  QUOTE_NOT_FOUND: {
    title: "Orçamento não encontrado.",
    description: "Ele não existe mais ou não pertence a este estabelecimento.",
  },
  ESTABLISHMENT_NOT_FOUND: {
    title: "Estabelecimento não encontrado.",
    description:
      "Atualize a página e tente novamente. Se o problema persistir, entre em contato com o suporte.",
  },
  INTERNAL_ERROR: {
    title: "Não foi possível analisar a aprovação.",
    description: "O servidor apresentou uma falha. Tente novamente em alguns instantes.",
  },
} satisfies Record<AnalyzeQuoteApprovalErrorCode, ApiErrorFeedback>;

const ANALYZE_QUOTE_APPROVAL_FALLBACK: ApiErrorFeedback = {
  title: "Não foi possível analisar a aprovação.",
  description: "Tente novamente em alguns instantes.",
};

function getAnalyzeQuoteApprovalValidationDescription(field?: string) {
  if (field === "quoteId") {
    return "Não foi possível identificar o orçamento solicitado. Atualize a página e tente novamente.";
  }

  if (field === "startsAt") {
    return "Informe uma data de início válida para analisar a aprovação.";
  }

  if (field === "endsAt") {
    return "Informe uma data de término válida para analisar a aprovação.";
  }

  return ANALYZE_QUOTE_APPROVAL_ERROR_FEEDBACK.VALIDATION_ERROR.description;
}

export function resolveAnalyzeQuoteApprovalErrorFeedback(error: unknown) {
  const feedback = resolveApiErrorFeedback<AnalyzeQuoteApprovalErrorCode>({
    error,
    idPrefix: "analyze-quote-approval",
    fallback: ANALYZE_QUOTE_APPROVAL_FALLBACK,
    feedbackByCode: ANALYZE_QUOTE_APPROVAL_ERROR_FEEDBACK,
  });

  if (feedback.code !== "VALIDATION_ERROR") return feedback;

  return {
    ...feedback,
    description: getAnalyzeQuoteApprovalValidationDescription(
      feedback.validationErrors?.[0]?.field,
    ),
  };
}
