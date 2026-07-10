import { describe, expect, it } from "vitest";

import { ApiError } from "@/shared/api/httpClient";

import { resolveApiErrorFeedback } from "./resolve-api-error-feedback";

const fallback = {
  title: "Não foi possível criar o orçamento.",
  description: "Tente novamente em alguns instantes.",
};

describe("resolveApiErrorFeedback", () => {
  it("resolves feedback by the stable API error code", () => {
    const error = new ApiError({
      statusCode: 404,
      message: "Backend technical message",
      payload: {
        statusCode: 404,
        code: "CUSTOMER_NOT_FOUND",
        message: "Backend technical message",
      },
    });

    const result = resolveApiErrorFeedback({
      error,
      idPrefix: "create-quote",
      fallback,
      feedbackByCode: {
        CUSTOMER_NOT_FOUND: {
          title: "Cliente não encontrado.",
          description: "Selecione outro cliente para continuar.",
        },
      },
      feedbackByStatus: {
        404: {
          title: "Fallback de status.",
          description: "Este feedback não deve ser usado.",
        },
      },
    });

    expect(result).toEqual({
      id: "create-quote-CUSTOMER_NOT_FOUND",
      title: "Cliente não encontrado.",
      description: "Selecione outro cliente para continuar.",
      statusCode: 404,
      code: "CUSTOMER_NOT_FOUND",
    });
  });

  it("normalizes validation issues and keeps the first message for each field", () => {
    const error = new ApiError({
      statusCode: 400,
      message: "Validation failed",
      payload: {
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        errors: [
          { field: "customerId", code: "REQUIRED" },
          { field: "customerId", code: "INVALID_FORMAT" },
          { field: "serviceItems", code: "MIN_ITEMS" },
          { field: 1, code: "REQUIRED" },
          { field: "expiresAt", code: null },
        ],
      },
    });

    const result = resolveApiErrorFeedback({
      error,
      idPrefix: "create-quote",
      fallback,
      feedbackByCode: {},
    });

    expect(result).toEqual({
      id: "create-quote-VALIDATION_ERROR",
      title: "Revise os dados informados.",
      description: "Corrija os campos destacados antes de continuar.",
      statusCode: 400,
      code: "VALIDATION_ERROR",
      validationErrors: [
        { field: "customerId", code: "REQUIRED" },
        { field: "customerId", code: "INVALID_FORMAT" },
        { field: "serviceItems", code: "MIN_ITEMS" },
      ],
      fieldErrors: {
        customerId: "Campo obrigatório.",
        serviceItems: "Informe pelo menos um item.",
      },
    });
  });

  it("allows validation messages to be overridden by normalized code", () => {
    const error = new ApiError({
      statusCode: 400,
      payload: {
        code: "VALIDATION_ERROR",
        errors: [{ field: "serviceItems", code: "MIN_ITEMS" }],
      },
    });

    const result = resolveApiErrorFeedback({
      error,
      idPrefix: "create-quote",
      fallback,
      feedbackByCode: {},
      validationMessages: {
        MIN_ITEMS: "Adicione ao menos um serviço.",
      },
    });

    expect(result.fieldErrors).toEqual({
      serviceItems: "Adicione ao menos um serviço.",
    });
  });

  it("treats prototype-like validation field names as regular fields", () => {
    const error = new ApiError({
      statusCode: 400,
      payload: {
        code: "VALIDATION_ERROR",
        errors: [
          { field: "constructor", code: "REQUIRED" },
          { field: "__proto__", code: "INVALID_VALUE" },
        ],
      },
    });

    const result = resolveApiErrorFeedback({
      error,
      idPrefix: "create-quote",
      fallback,
      feedbackByCode: {},
    });

    expect(result.fieldErrors?.constructor).toBe("Campo obrigatório.");
    expect(result.fieldErrors?.__proto__).toBe("Valor inválido.");
    expect(Object.hasOwn(result.fieldErrors ?? {}, "__proto__")).toBe(true);
  });

  it("does not resolve inherited properties as code feedback", () => {
    const error = new ApiError({
      statusCode: 418,
      payload: { code: "constructor" },
    });

    const result = resolveApiErrorFeedback({
      error,
      idPrefix: "create-quote",
      fallback,
      feedbackByCode: {},
    });

    expect(result).toEqual({
      id: "create-quote-constructor",
      ...fallback,
      statusCode: 418,
      code: "constructor",
    });
  });

  it("uses transversal HTTP feedback when the payload has no mapped code", () => {
    const error = new ApiError({
      statusCode: 429,
      message: "ThrottlerException: Too Many Requests",
      payload: "unexpected payload",
    });

    const result = resolveApiErrorFeedback({
      error,
      idPrefix: "create-quote",
      fallback,
      feedbackByCode: {},
    });

    expect(result).toEqual({
      id: "create-quote-429",
      title: "Muitas tentativas.",
      description: "Aguarde alguns instantes antes de tentar novamente.",
      statusCode: 429,
    });
  });

  it("allows transversal HTTP feedback to be overridden", () => {
    const error = new ApiError({ statusCode: 403, message: "Forbidden" });

    const result = resolveApiErrorFeedback({
      error,
      idPrefix: "create-quote",
      fallback,
      feedbackByCode: {},
      feedbackByStatus: {
        403: {
          title: "Sem acesso a orçamentos.",
          description: "Solicite a permissão necessária.",
        },
      },
    });

    expect(result.title).toBe("Sem acesso a orçamentos.");
    expect(result.description).toBe("Solicite a permissão necessária.");
  });

  it("uses the operation fallback for unknown API and non-API errors", () => {
    const apiResult = resolveApiErrorFeedback({
      error: new ApiError({ statusCode: 418, message: "Technical message" }),
      idPrefix: "create-quote",
      fallback,
      feedbackByCode: {},
    });
    const unknownResult = resolveApiErrorFeedback({
      error: new Error("Network failure"),
      idPrefix: "create-quote",
      fallback,
      feedbackByCode: {},
    });

    expect(apiResult).toEqual({
      id: "create-quote-418",
      ...fallback,
      statusCode: 418,
    });
    expect(unknownResult).toEqual({
      id: "create-quote-unknown",
      ...fallback,
    });
  });
});
