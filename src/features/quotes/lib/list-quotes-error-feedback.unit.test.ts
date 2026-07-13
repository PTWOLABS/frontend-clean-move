import { describe, expect, it } from "vitest";

import { ApiError } from "@/shared/api/httpClient";

import {
  LIST_QUOTES_ERROR_FEEDBACK,
  resolveListQuotesErrorFeedback,
  type ListQuotesErrorCode,
} from "./list-quotes-error-feedback";

const documentedCodes = [
  "VALIDATION_ERROR",
  "FORBIDDEN",
  "ESTABLISHMENT_NOT_FOUND",
  "INTERNAL_ERROR",
] satisfies ListQuotesErrorCode[];

const statusByCode: Record<ListQuotesErrorCode, number> = {
  VALIDATION_ERROR: 400,
  FORBIDDEN: 403,
  ESTABLISHMENT_NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

describe("list quotes error feedback", () => {
  it("maps exactly every documented GET /quotes error code", () => {
    expect(Object.keys(LIST_QUOTES_ERROR_FEEDBACK).sort()).toEqual([...documentedCodes].sort());
  });

  it.each(documentedCodes)("resolves %s through the list-quotes mapping", (code) => {
    const statusCode = statusByCode[code];

    expect(
      resolveListQuotesErrorFeedback(new ApiError({ statusCode, payload: { statusCode, code } })),
    ).toMatchObject({
      id: `list-quotes-${code}`,
      ...LIST_QUOTES_ERROR_FEEDBACK[code],
      statusCode,
      code,
    });
  });

  it("keeps the shared feedback for transversal errors without a quote code", () => {
    expect(resolveListQuotesErrorFeedback(new ApiError({ statusCode: 429 }))).toEqual({
      id: "list-quotes-429",
      title: "Muitas tentativas.",
      description: "Aguarde alguns instantes antes de tentar novamente.",
      statusCode: 429,
    });
  });

  it("uses the list fallback for undocumented codes", () => {
    expect(
      resolveListQuotesErrorFeedback(
        new ApiError({ statusCode: 400, payload: { code: "UNEXPECTED_QUOTE_ERROR" } }),
      ),
    ).toEqual({
      id: "list-quotes-UNEXPECTED_QUOTE_ERROR",
      title: "Não foi possível carregar os orçamentos.",
      description: "Tente novamente em alguns instantes.",
      statusCode: 400,
      code: "UNEXPECTED_QUOTE_ERROR",
    });
  });
});
