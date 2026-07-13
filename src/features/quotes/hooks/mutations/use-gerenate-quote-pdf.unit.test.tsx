import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/shared/api/httpClient";

const generateQuotePdfMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("../../api/generate-quote-pdf", () => ({
  generateQuotePdf: (...args: unknown[]) => generateQuotePdfMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: vi.fn(),
  },
}));

import { useGenerateQuotePdf } from "./use-gerenate-quote-pdf";

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useGenerateQuotePdf", () => {
  beforeEach(() => {
    generateQuotePdfMock.mockReset();
    toastErrorMock.mockReset();
  });

  it("shows mapped PDF feedback once without exposing the backend message", async () => {
    generateQuotePdfMock.mockRejectedValueOnce(
      new ApiError({
        statusCode: 404,
        message: "Sensitive backend details",
        payload: { code: "QUOTE_NOT_FOUND" },
      }),
    );
    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const { result } = renderHook(() => useGenerateQuotePdf(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate("550e8400-e29b-41d4-a716-446655440000");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastErrorMock).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith("Orçamento não encontrado.", {
      id: "generate-quote-pdf-QUOTE_NOT_FOUND",
      description: "Ele não existe mais ou não pertence a este estabelecimento.",
    });
    expect(JSON.stringify(toastErrorMock.mock.calls)).not.toContain("Sensitive backend details");
  });
});
