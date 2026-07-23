import { describe, expect, it } from "vitest";

import { ApiError } from "@/shared/api/httpClient";

import {
  ANALYZE_QUOTE_APPROVAL_ERROR_FEEDBACK,
  resolveAnalyzeQuoteApprovalErrorFeedback,
  type AnalyzeQuoteApprovalErrorCode,
} from "./analyze-quote-approval-error-feedback";

const documentedCodes = [
  "VALIDATION_ERROR",
  "QUOTE_INVALID_SCHEDULE_INTERVAL",
  "QUOTE_ALREADY_CONVERTED",
  "FORBIDDEN",
  "QUOTE_NOT_FOUND",
  "ESTABLISHMENT_NOT_FOUND",
  "INTERNAL_ERROR",
] satisfies AnalyzeQuoteApprovalErrorCode[];

const statusByCode: Record<AnalyzeQuoteApprovalErrorCode, number> = {
  VALIDATION_ERROR: 400,
  QUOTE_INVALID_SCHEDULE_INTERVAL: 400,
  QUOTE_ALREADY_CONVERTED: 400,
  FORBIDDEN: 403,
  QUOTE_NOT_FOUND: 404,
  ESTABLISHMENT_NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

describe("analyze quote approval error feedback", () => {
  it("maps exactly every documented POST /quotes/:quoteId/approval-analysis error code", () => {
    expect(Object.keys(ANALYZE_QUOTE_APPROVAL_ERROR_FEEDBACK).sort()).toEqual(
      [...documentedCodes].sort(),
    );
  });

  it.each(documentedCodes)("resolves %s through the analyze-quote-approval mapping", (code) => {
    const statusCode = statusByCode[code];

    expect(
      resolveAnalyzeQuoteApprovalErrorFeedback(
        new ApiError({ statusCode, payload: { statusCode, code } }),
      ),
    ).toMatchObject({
      id: `analyze-quote-approval-${code}`,
      ...ANALYZE_QUOTE_APPROVAL_ERROR_FEEDBACK[code],
      statusCode,
      code,
    });
  });

  it.each([
    [
      "quoteId",
      "Não foi possível identificar o orçamento solicitado. Atualize a página e tente novamente.",
    ],
    ["startsAt", "Informe uma data de início válida para analisar a aprovação."],
    ["endsAt", "Informe uma data de término válida para analisar a aprovação."],
    ["unknownField", "Verifique o orçamento e o período informado antes de continuar."],
  ])("describes the affected validation field for %s", (field, description) => {
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

    expect(resolveAnalyzeQuoteApprovalErrorFeedback(error)).toMatchObject({
      code: "VALIDATION_ERROR",
      description,
      validationErrors: [{ field, code: "INVALID_FORMAT" }],
    });
  });

  it("uses the generic validation message when the quoteId field is empty in the API payload", () => {
    const error = new ApiError({
      statusCode: 400,
      message: "Validation failed",
      payload: {
        statusCode: 400,
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        errors: [{ field: "", code: "INVALID_FORMAT" }],
      },
    });

    expect(resolveAnalyzeQuoteApprovalErrorFeedback(error)).toEqual({
      id: "analyze-quote-approval-VALIDATION_ERROR",
      ...ANALYZE_QUOTE_APPROVAL_ERROR_FEEDBACK.VALIDATION_ERROR,
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  });

  it("keeps the shared feedback for transversal errors without a quote code", () => {
    expect(resolveAnalyzeQuoteApprovalErrorFeedback(new ApiError({ statusCode: 401 }))).toEqual({
      id: "analyze-quote-approval-401",
      title: "Sua sessão expirou.",
      description: "Atualize a página e faça login novamente para continuar.",
      statusCode: 401,
    });
  });

  it("uses the analysis fallback for undocumented codes", () => {
    expect(
      resolveAnalyzeQuoteApprovalErrorFeedback(
        new ApiError({ statusCode: 400, payload: { code: "UNEXPECTED_QUOTE_ERROR" } }),
      ),
    ).toEqual({
      id: "analyze-quote-approval-UNEXPECTED_QUOTE_ERROR",
      title: "Não foi possível analisar a aprovação.",
      description: "Tente novamente em alguns instantes.",
      statusCode: 400,
      code: "UNEXPECTED_QUOTE_ERROR",
    });
  });
});
