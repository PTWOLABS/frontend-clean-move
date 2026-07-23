import { describe, expect, it } from "vitest";

import { ApiError } from "@/shared/api/httpClient";

import {
  APPROVE_QUOTE_ERROR_FEEDBACK,
  resolveApproveQuoteErrorFeedback,
  type ApproveQuoteErrorCode,
} from "./approve-quote-error-feedback";

const documentedCodes = [
  "VALIDATION_ERROR",
  "QUOTE_INVALID_SCHEDULE_INTERVAL",
  "QUOTE_INVALID_RESOLUTION_ACTION",
  "QUOTE_ALREADY_CONVERTED",
  "QUOTE_SERVICE_NAME_UNAVAILABLE",
  "QUOTE_DUPLICATE_SERVICE_RESOLUTION",
  "QUOTE_SERVICE_ITEM_NOT_FOUND",
  "QUOTE_CANNOT_BE_APPROVED_FOR_PROSPECT",
  "QUOTE_VEHICLE_SNAPSHOT_MISSING",
  "QUOTE_VEHICLE_SNAPSHOT_INCOMPLETE",
  "QUOTE_CUSTOMER_ADDRESS_INCOMPLETE",
  "INVALID_QUOTE_INPUT",
  "QUOTE_APPROVAL_RESOLUTION_REQUIRED",
  "QUOTE_APPROVAL_CONFLICTS_CHANGED",
  "FORBIDDEN",
  "QUOTE_NOT_FOUND",
  "ESTABLISHMENT_NOT_FOUND",
  "CUSTOMER_NOT_FOUND",
  "VEHICLE_NOT_FOUND",
  "SERVICE_NOT_FOUND",
  "RESOURCE_NOT_FOUND",
  "INTERNAL_ERROR",
] satisfies ApproveQuoteErrorCode[];

const statusByCode: Record<ApproveQuoteErrorCode, number> = {
  VALIDATION_ERROR: 400,
  QUOTE_INVALID_SCHEDULE_INTERVAL: 400,
  QUOTE_INVALID_RESOLUTION_ACTION: 400,
  QUOTE_ALREADY_CONVERTED: 400,
  QUOTE_SERVICE_NAME_UNAVAILABLE: 400,
  QUOTE_DUPLICATE_SERVICE_RESOLUTION: 400,
  QUOTE_SERVICE_ITEM_NOT_FOUND: 400,
  QUOTE_CANNOT_BE_APPROVED_FOR_PROSPECT: 400,
  QUOTE_VEHICLE_SNAPSHOT_MISSING: 400,
  QUOTE_VEHICLE_SNAPSHOT_INCOMPLETE: 400,
  QUOTE_CUSTOMER_ADDRESS_INCOMPLETE: 400,
  INVALID_QUOTE_INPUT: 400,
  QUOTE_APPROVAL_RESOLUTION_REQUIRED: 409,
  QUOTE_APPROVAL_CONFLICTS_CHANGED: 409,
  FORBIDDEN: 403,
  QUOTE_NOT_FOUND: 404,
  ESTABLISHMENT_NOT_FOUND: 404,
  CUSTOMER_NOT_FOUND: 404,
  VEHICLE_NOT_FOUND: 404,
  SERVICE_NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

describe("approve quote error feedback", () => {
  it("maps every supported POST /quotes/:quoteId/approve error code", () => {
    expect(Object.keys(APPROVE_QUOTE_ERROR_FEEDBACK).sort()).toEqual([...documentedCodes].sort());
  });

  it.each(documentedCodes)("resolves %s through the approve-quote mapping", (code) => {
    const statusCode = statusByCode[code];

    expect(
      resolveApproveQuoteErrorFeedback(new ApiError({ statusCode, payload: { statusCode, code } })),
    ).toMatchObject({
      id: `approve-quote-${code}`,
      ...APPROVE_QUOTE_ERROR_FEEDBACK[code],
      statusCode,
      code,
    });
  });

  it.each([
    [
      "",
      "Não foi possível identificar o orçamento solicitado. Atualize a página e tente novamente.",
    ],
    [
      "quoteId",
      "Não foi possível identificar o orçamento solicitado. Atualize a página e tente novamente.",
    ],
    ["startsAt", "Informe uma data de início válida para aprovar o orçamento."],
    ["endsAt", "Informe uma data de término válida para aprovar o orçamento."],
    ["customerResolution.action", "Revise a resolução do cliente antes de aprovar o orçamento."],
    ["vehicleResolution.action", "Revise a resolução do veículo antes de aprovar o orçamento."],
    [
      "serviceResolutions.0.action",
      "Revise as resoluções dos serviços antes de aprovar o orçamento.",
    ],
    ["unknownField", "Verifique o período e as resoluções antes de aprovar o orçamento."],
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

    const expectedFeedback = {
      code: "VALIDATION_ERROR",
      description,
      ...(field ? { validationErrors: [{ field, code: "INVALID_FORMAT" }] } : {}),
    };

    expect(resolveApproveQuoteErrorFeedback(error)).toMatchObject(expectedFeedback);
  });

  it("keeps shared feedback for transversal errors without an approve code", () => {
    expect(resolveApproveQuoteErrorFeedback(new ApiError({ statusCode: 401 }))).toEqual({
      id: "approve-quote-401",
      title: "Sua sessão expirou.",
      description: "Atualize a página e faça login novamente para continuar.",
      statusCode: 401,
    });
  });
});
