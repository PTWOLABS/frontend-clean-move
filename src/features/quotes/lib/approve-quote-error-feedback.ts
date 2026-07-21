import {
  isRecord,
  resolveApiErrorFeedback,
  type ApiErrorFeedback,
} from "@/shared/lib/resolve-api-error-feedback";
import { ApiError } from "@/shared/api/httpClient";
import type { ApproveQuoteErrorCode } from "../types/quote-approval";

export type { ApproveQuoteErrorCode } from "../types/quote-approval";

export const APPROVE_QUOTE_ERROR_FEEDBACK = {
  VALIDATION_ERROR: {
    title: "Revise os dados da aprovação.",
    description: "Verifique o período e as resoluções antes de aprovar o orçamento.",
  },
  QUOTE_INVALID_SCHEDULE_INTERVAL: {
    title: "Período inválido.",
    description: "A data de término deve ser posterior à data de início.",
  },
  QUOTE_INVALID_RESOLUTION_ACTION: {
    title: "Resolução inválida.",
    description: "Refaça a análise de aprovação e selecione uma resolução válida.",
  },
  QUOTE_SERVICE_NAME_UNAVAILABLE: {
    title: "Nome de serviço indisponível.",
    description: "Escolha outro nome para o serviço antes de aprovar o orçamento.",
  },
  QUOTE_DUPLICATE_SERVICE_RESOLUTION: {
    title: "Serviço resolvido mais de uma vez.",
    description: "Revise as resoluções dos serviços e tente aprovar novamente.",
  },
  QUOTE_SERVICE_ITEM_NOT_FOUND: {
    title: "Serviço do orçamento não encontrado.",
    description: "Refaça a análise de aprovação antes de tentar novamente.",
  },
  QUOTE_CANNOT_BE_APPROVED_FOR_PROSPECT: {
    title: "Cliente precisa ser resolvido.",
    description: "Vincule ou crie o cliente antes de aprovar o orçamento.",
  },
  QUOTE_VEHICLE_SNAPSHOT_MISSING: {
    title: "Dados do veículo ausentes.",
    description: "Revise a resolução do veículo antes de aprovar o orçamento.",
  },
  QUOTE_VEHICLE_SNAPSHOT_INCOMPLETE: {
    title: "Dados do veículo incompletos.",
    description: "Informe marca e modelo do veículo antes de aprovar o orçamento.",
  },
  QUOTE_CUSTOMER_ADDRESS_INCOMPLETE: {
    title: "Endereço do cliente incompleto.",
    description: "Revise os dados do cliente antes de aprovar o orçamento.",
  },
  INVALID_QUOTE_INPUT: {
    title: "Orçamento inválido.",
    description: "Revise os dados do orçamento antes de aprovar.",
  },
  QUOTE_ALREADY_CONVERTED: {
    title: "Orçamento já convertido.",
    description: "Este orçamento já virou um agendamento e não pode ser aprovado novamente.",
  },
  QUOTE_APPROVAL_RESOLUTION_REQUIRED: {
    title: "Existem conflitos pendentes.",
    description: "Revise os conflitos encontrados na análise antes de aprovar o orçamento.",
  },
  QUOTE_APPROVAL_CONFLICTS_CHANGED: {
    title: "Os conflitos mudaram.",
    description: "Refaça a análise de aprovação e envie as resoluções atualizadas.",
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
  CUSTOMER_NOT_FOUND: {
    title: "Cliente não encontrado.",
    description: "O cliente vinculado não existe mais. Refaça a análise de aprovação.",
  },
  VEHICLE_NOT_FOUND: {
    title: "Veículo não encontrado.",
    description: "O veículo vinculado não existe mais ou não pertence ao cliente resolvido.",
  },
  SERVICE_NOT_FOUND: {
    title: "Serviço não encontrado.",
    description: "Um dos serviços vinculados não existe mais. Refaça a análise de aprovação.",
  },
  RESOURCE_NOT_FOUND: {
    title: "Recurso não encontrado.",
    description: "Uma dependência do orçamento não está mais disponível.",
  },
  INTERNAL_ERROR: {
    title: "Não foi possível aprovar o orçamento.",
    description: "O servidor apresentou uma falha. Tente novamente em alguns instantes.",
  },
} satisfies Record<ApproveQuoteErrorCode, ApiErrorFeedback>;

const APPROVE_QUOTE_FALLBACK: ApiErrorFeedback = {
  title: "Não foi possível aprovar o orçamento.",
  description: "Tente novamente em alguns instantes.",
};

function getFirstValidationField(error: unknown, fallbackField?: string) {
  if (
    !(error instanceof ApiError) ||
    !isRecord(error.payload) ||
    !Array.isArray(error.payload.errors)
  ) {
    return fallbackField;
  }

  const firstError = error.payload.errors[0];

  if (!isRecord(firstError) || typeof firstError.field !== "string") {
    return fallbackField;
  }

  return firstError.field;
}

function getApproveQuoteValidationDescription(field?: string) {
  if (field === "" || field === "quoteId") {
    return "Não foi possível identificar o orçamento solicitado. Atualize a página e tente novamente.";
  }

  if (field === "startsAt") {
    return "Informe uma data de início válida para aprovar o orçamento.";
  }

  if (field === "endsAt") {
    return "Informe uma data de término válida para aprovar o orçamento.";
  }

  if (field === "customerResolution" || field?.startsWith("customerResolution.")) {
    return "Revise a resolução do cliente antes de aprovar o orçamento.";
  }

  if (field === "vehicleResolution" || field?.startsWith("vehicleResolution.")) {
    return "Revise a resolução do veículo antes de aprovar o orçamento.";
  }

  if (field === "serviceResolutions" || field?.startsWith("serviceResolutions.")) {
    return "Revise as resoluções dos serviços antes de aprovar o orçamento.";
  }

  return APPROVE_QUOTE_ERROR_FEEDBACK.VALIDATION_ERROR.description;
}

export function resolveApproveQuoteErrorFeedback(error: unknown) {
  const feedback = resolveApiErrorFeedback<ApproveQuoteErrorCode>({
    error,
    idPrefix: "approve-quote",
    fallback: APPROVE_QUOTE_FALLBACK,
    feedbackByCode: APPROVE_QUOTE_ERROR_FEEDBACK,
  });

  if (feedback.code !== "VALIDATION_ERROR") return feedback;

  return {
    ...feedback,
    description: getApproveQuoteValidationDescription(
      getFirstValidationField(error, feedback.validationErrors?.[0]?.field),
    ),
  };
}
