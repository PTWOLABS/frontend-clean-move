import {
  resolveApiErrorFeedback,
  type ApiErrorFeedback,
} from "@/shared/lib/resolve-api-error-feedback";

export type CreateQuoteErrorCode =
  | "VALIDATION_ERROR"
  | "QUOTE_SERVICE_INACTIVE"
  | "INVALID_QUOTE_INPUT"
  | "FORBIDDEN"
  | "ESTABLISHMENT_NOT_FOUND"
  | "CUSTOMER_NOT_FOUND"
  | "VEHICLE_NOT_FOUND"
  | "SERVICE_NOT_FOUND"
  | "RESOURCE_NOT_FOUND"
  | "INTERNAL_ERROR";

export const CREATE_QUOTE_ERROR_FEEDBACK = {
  VALIDATION_ERROR: {
    title: "Revise os dados do orçamento.",
    description: "Revise os dados informados antes de continuar.",
  },
  QUOTE_SERVICE_INACTIVE: {
    title: "Serviço indisponível.",
    description: "Um dos serviços selecionados está inativo. Remova-o ou escolha outro serviço.",
  },
  INVALID_QUOTE_INPUT: {
    title: "Revise os dados do orçamento.",
    description:
      "Verifique cliente, veículo, serviços, condições de pagamento e validade antes de continuar.",
  },
  FORBIDDEN: {
    title: "Sem permissão para criar orçamentos.",
    description: "Solicite essa permissão a um administrador do estabelecimento.",
  },
  ESTABLISHMENT_NOT_FOUND: {
    title: "Estabelecimento não encontrado.",
    description:
      "Atualize a página e tente novamente. Se o problema persistir, entre em contato com o suporte.",
  },
  CUSTOMER_NOT_FOUND: {
    title: "Cliente não encontrado.",
    description:
      "O cliente selecionado não existe mais ou não pertence a este estabelecimento. Selecione outro cliente.",
  },
  VEHICLE_NOT_FOUND: {
    title: "Veículo não encontrado.",
    description:
      "O veículo selecionado não existe mais ou não pertence ao cliente informado. Selecione outro veículo.",
  },
  SERVICE_NOT_FOUND: {
    title: "Serviço não encontrado.",
    description: "Um dos serviços selecionados não existe mais. Revise os serviços do orçamento.",
  },
  RESOURCE_NOT_FOUND: {
    title: "Responsável pelo estabelecimento não encontrado.",
    description: "Entre em contato com o suporte para verificar os dados do estabelecimento.",
  },
  INTERNAL_ERROR: {
    title: "Não foi possível criar o orçamento.",
    description: "O servidor apresentou uma falha. Tente novamente em alguns instantes.",
  },
} satisfies Record<CreateQuoteErrorCode, ApiErrorFeedback>;

const CREATE_QUOTE_FALLBACK: ApiErrorFeedback = {
  title: "Não foi possível criar o orçamento.",
  description: "Tente novamente em alguns instantes.",
};

function getCreateQuoteValidationDescription(field?: string) {
  if (!field) return CREATE_QUOTE_ERROR_FEEDBACK.VALIDATION_ERROR.description;

  if (field === "customerId" || field === "customer" || field.startsWith("customer.")) {
    return "Revise os dados do cliente antes de continuar.";
  }

  if (field === "vehicleId" || field === "vehicle" || field.startsWith("vehicle.")) {
    return "Revise os dados do veículo antes de continuar.";
  }

  if (field === "serviceItems" || field.startsWith("serviceItems.")) {
    return "Revise os serviços do orçamento antes de continuar.";
  }

  if (field === "paymentOptions" || field.startsWith("paymentOptions.")) {
    return "Revise as condições de pagamento antes de continuar.";
  }

  if (field === "expiresAt" || field === "termsAndConditions") {
    return "Revise a validade e os termos do orçamento antes de continuar.";
  }

  if (field === "description") {
    return "Revise a descrição do orçamento antes de continuar.";
  }

  return CREATE_QUOTE_ERROR_FEEDBACK.VALIDATION_ERROR.description;
}

export function resolveCreateQuoteErrorFeedback(error: unknown) {
  const feedback = resolveApiErrorFeedback<CreateQuoteErrorCode>({
    error,
    idPrefix: "create-quote",
    fallback: CREATE_QUOTE_FALLBACK,
    feedbackByCode: CREATE_QUOTE_ERROR_FEEDBACK,
  });

  if (feedback.code !== "VALIDATION_ERROR") return feedback;

  return {
    ...feedback,
    description: getCreateQuoteValidationDescription(feedback.validationErrors?.[0]?.field),
  };
}
