import { describe, expect, it } from "vitest";

import { ApiError } from "@/shared/api/httpClient";

import { getDashboardQueryErrorFeedback } from "./use-dashboard-query-error-feedback";

describe("getDashboardQueryErrorFeedback", () => {
  it("maps 400 errors to filter guidance", () => {
    const feedback = getDashboardQueryErrorFeedback(
      "a visão geral",
      new ApiError({ message: "Invalid query parameters.", statusCode: 400 }),
    );

    expect(feedback).toEqual({
      title: "Não foi possível carregar a visão geral.",
      description:
        "Os filtros enviados são inválidos. Revise o período selecionado e tente novamente.",
      statusCode: 400,
    });
  });

  it("returns generic feedback for unknown errors", () => {
    const feedback = getDashboardQueryErrorFeedback("serviços populares", new Error("boom"));

    expect(feedback).toEqual({
      title: "Não foi possível carregar serviços populares.",
      description: "Tente novamente em alguns instantes.",
    });
  });
});
