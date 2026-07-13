import { describe, expect, it } from "vitest";

import { ApiError } from "@/shared/api/httpClient";

import {
  GENERATE_QUOTE_PDF_ERROR_FEEDBACK,
  resolveGenerateQuotePdfErrorFeedback,
  type GenerateQuotePdfErrorCode,
} from "./generate-quote-pdf-error-feedback";

const documentedCodes = [
  "VALIDATION_ERROR",
  "FORBIDDEN",
  "ESTABLISHMENT_NOT_FOUND",
  "QUOTE_NOT_FOUND",
  "INTERNAL_ERROR",
] satisfies GenerateQuotePdfErrorCode[];

const statusByCode: Record<GenerateQuotePdfErrorCode, number> = {
  VALIDATION_ERROR: 400,
  FORBIDDEN: 403,
  ESTABLISHMENT_NOT_FOUND: 404,
  QUOTE_NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

describe("generate quote PDF error feedback", () => {
  it("maps exactly every documented GET /quotes/:quoteId/pdf error code", () => {
    expect(Object.keys(GENERATE_QUOTE_PDF_ERROR_FEEDBACK).sort()).toEqual(
      [...documentedCodes].sort(),
    );
  });

  it.each(documentedCodes)("resolves %s through the generate-quote-pdf mapping", (code) => {
    const statusCode = statusByCode[code];

    expect(
      resolveGenerateQuotePdfErrorFeedback(
        new ApiError({ statusCode, payload: { statusCode, code } }),
      ),
    ).toMatchObject({
      id: `generate-quote-pdf-${code}`,
      ...GENERATE_QUOTE_PDF_ERROR_FEEDBACK[code],
      statusCode,
      code,
    });
  });

  it("uses the PDF fallback for undocumented codes", () => {
    expect(
      resolveGenerateQuotePdfErrorFeedback(
        new ApiError({ statusCode: 400, payload: { code: "UNEXPECTED_QUOTE_ERROR" } }),
      ),
    ).toEqual({
      id: "generate-quote-pdf-UNEXPECTED_QUOTE_ERROR",
      title: "Não foi possível gerar o PDF.",
      description: "Tente novamente em alguns instantes.",
      statusCode: 400,
      code: "UNEXPECTED_QUOTE_ERROR",
    });
  });
});
