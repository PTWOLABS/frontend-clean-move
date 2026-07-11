import { describe, expect, it } from "vitest";

import { ApiError } from "@/shared/api/httpClient";

import {
  CREATE_QUOTE_ERROR_FEEDBACK,
  resolveCreateQuoteErrorFeedback,
  type CreateQuoteErrorCode,
} from "./create-quote-error-feedback";

const documentedCodes = [
  "VALIDATION_ERROR",
  "QUOTE_SERVICE_INACTIVE",
  "INVALID_QUOTE_INPUT",
  "FORBIDDEN",
  "ESTABLISHMENT_NOT_FOUND",
  "CUSTOMER_NOT_FOUND",
  "VEHICLE_NOT_FOUND",
  "SERVICE_NOT_FOUND",
  "RESOURCE_NOT_FOUND",
  "INTERNAL_ERROR",
] satisfies CreateQuoteErrorCode[];

const statusByCode: Record<CreateQuoteErrorCode, number> = {
  VALIDATION_ERROR: 400,
  QUOTE_SERVICE_INACTIVE: 400,
  INVALID_QUOTE_INPUT: 400,
  FORBIDDEN: 403,
  ESTABLISHMENT_NOT_FOUND: 404,
  CUSTOMER_NOT_FOUND: 404,
  VEHICLE_NOT_FOUND: 404,
  SERVICE_NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

const expectedFeedbackByCode: Record<CreateQuoteErrorCode, { title: string; description: string }> =
  {
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
  };

describe("create quote error feedback", () => {
  it("maps exactly every documented POST /quotes error code", () => {
    expect(Object.keys(CREATE_QUOTE_ERROR_FEEDBACK).sort()).toEqual([...documentedCodes].sort());
  });

  it.each(documentedCodes)("resolves %s through the create-quote mapping", (code) => {
    const statusCode = statusByCode[code];
    const error = new ApiError({
      statusCode,
      message: "Technical backend message",
      payload: { statusCode, code, message: "Technical backend message" },
    });

    expect(resolveCreateQuoteErrorFeedback(error)).toEqual({
      id: `create-quote-${code}`,
      ...expectedFeedbackByCode[code],
      statusCode,
      code,
    });
  });

  it.each([
    ["customer.name", "Revise os dados do cliente antes de continuar."],
    ["vehicle.brand", "Revise os dados do veículo antes de continuar."],
    ["serviceItems.0.priceInCents", "Revise os serviços do orçamento antes de continuar."],
    ["paymentOptions.0.method", "Revise as condições de pagamento antes de continuar."],
    ["expiresAt", "Revise a validade e os termos do orçamento antes de continuar."],
    ["description", "Revise a descrição do orçamento antes de continuar."],
    ["unknownField", "Revise os dados informados antes de continuar."],
  ])("describes the affected validation area for %s", (field, description) => {
    const error = new ApiError({
      statusCode: 400,
      message: "Validation failed",
      payload: {
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        errors: [{ field, code: "INVALID_FORMAT" }],
      },
    });

    expect(resolveCreateQuoteErrorFeedback(error)).toMatchObject({
      code: "VALIDATION_ERROR",
      description,
      validationErrors: [{ field, code: "INVALID_FORMAT" }],
    });
  });

  it("uses only the first validation area when multiple fields fail", () => {
    const error = new ApiError({
      statusCode: 400,
      payload: {
        code: "VALIDATION_ERROR",
        errors: [
          { field: "paymentOptions.0.method", code: "INVALID_FORMAT" },
          { field: "customer.name", code: "REQUIRED" },
        ],
      },
    });

    expect(resolveCreateQuoteErrorFeedback(error).description).toBe(
      "Revise as condições de pagamento antes de continuar.",
    );
  });

  it("uses the operation fallback for an undocumented code", () => {
    const error = new ApiError({
      statusCode: 400,
      payload: { code: "UNEXPECTED_QUOTE_ERROR" },
    });

    expect(resolveCreateQuoteErrorFeedback(error)).toEqual({
      id: "create-quote-UNEXPECTED_QUOTE_ERROR",
      title: "Não foi possível criar o orçamento.",
      description: "Tente novamente em alguns instantes.",
      statusCode: 400,
      code: "UNEXPECTED_QUOTE_ERROR",
    });
  });

  it("keeps the shared fallback for transversal errors without a quote code", () => {
    const error = new ApiError({ statusCode: 429, message: "Too Many Requests" });

    expect(resolveCreateQuoteErrorFeedback(error)).toEqual({
      id: "create-quote-429",
      title: "Muitas tentativas.",
      description: "Aguarde alguns instantes antes de tentar novamente.",
      statusCode: 429,
    });
  });
});
