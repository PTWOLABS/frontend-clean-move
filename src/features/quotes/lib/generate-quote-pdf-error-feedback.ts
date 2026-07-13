import {
  resolveApiErrorFeedback,
  type ApiErrorFeedback,
} from "@/shared/lib/resolve-api-error-feedback";

export type GenerateQuotePdfErrorCode =
  | "VALIDATION_ERROR"
  | "FORBIDDEN"
  | "ESTABLISHMENT_NOT_FOUND"
  | "QUOTE_NOT_FOUND"
  | "INTERNAL_ERROR";

export const GENERATE_QUOTE_PDF_ERROR_FEEDBACK = {
  VALIDATION_ERROR: {
    title: "Orçamento inválido.",
    description:
      "Não foi possível identificar o orçamento solicitado. Atualize a página e tente novamente.",
  },
  FORBIDDEN: {
    title: "Sem permissão para gerar o PDF.",
    description: "Solicite essa permissão a um administrador do estabelecimento.",
  },
  ESTABLISHMENT_NOT_FOUND: {
    title: "Estabelecimento não encontrado.",
    description:
      "Atualize a página e tente novamente. Se o problema persistir, entre em contato com o suporte.",
  },
  QUOTE_NOT_FOUND: {
    title: "Orçamento não encontrado.",
    description: "Ele não existe mais ou não pertence a este estabelecimento.",
  },
  INTERNAL_ERROR: {
    title: "Não foi possível gerar o PDF.",
    description: "O servidor apresentou uma falha. Tente novamente em alguns instantes.",
  },
} satisfies Record<GenerateQuotePdfErrorCode, ApiErrorFeedback>;

const GENERATE_QUOTE_PDF_FALLBACK: ApiErrorFeedback = {
  title: "Não foi possível gerar o PDF.",
  description: "Tente novamente em alguns instantes.",
};

export function resolveGenerateQuotePdfErrorFeedback(error: unknown) {
  return resolveApiErrorFeedback<GenerateQuotePdfErrorCode>({
    error,
    idPrefix: "generate-quote-pdf",
    fallback: GENERATE_QUOTE_PDF_FALLBACK,
    feedbackByCode: GENERATE_QUOTE_PDF_ERROR_FEEDBACK,
  });
}
