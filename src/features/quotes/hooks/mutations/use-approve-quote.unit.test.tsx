/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import type { ApproveQuoteBody } from "../../types/quote-approval";

const approveQuoteMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("../../api/approve-quote", () => ({
  approveQuote: (...args: unknown[]) => approveQuoteMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

import { useApproveQuote } from "./use-approve-quote";

const approveBody = {
  startsAt: "2026-08-01T10:00:00.000Z",
  endsAt: null,
  customerResolution: {
    action: "CREATE_NEW",
    email: "cliente@example.com",
    phone: "11999999999",
  },
  vehicleResolution: {
    action: "CREATE_FROM_SNAPSHOT",
  },
  serviceResolutions: [
    {
      quoteServiceId: "3df8bd2a-4689-4e54-91fb-55d88dc178d1",
      action: "ASSOCIATE_EXISTING",
      serviceId: "2c0c7644-81d8-4e01-aec4-49cc7c0a4dd3",
    },
  ],
} satisfies ApproveQuoteBody;

function createWrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

describe("useApproveQuote", () => {
  beforeEach(() => {
    approveQuoteMock.mockReset();
    toastSuccessMock.mockReset();
    toastErrorMock.mockReset();
  });

  it("approves a quote and invalidates affected queries", async () => {
    const client = createQueryClient();
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");

    approveQuoteMock.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useApproveQuote(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({
      quoteId: "550e8400-e29b-41d4-a716-446655440000",
      ...approveBody,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(approveQuoteMock).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440000",
      approveBody,
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.quotes() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.appointments() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.metricsOverview });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.metricsAppointment });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.revenueAndAppointments,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.popularServices });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.topCustomers() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.customers() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.customerOptions() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.vehiclesAll() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.vehicleOptions() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.services() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.serviceOptions() });
    expect(toastSuccessMock).toHaveBeenCalledWith("Orçamento aprovado com sucesso.");
  });

  it("shows mapped approval feedback without exposing the backend message", async () => {
    const client = createQueryClient();

    approveQuoteMock.mockRejectedValueOnce(
      new ApiError({
        statusCode: 409,
        message: "Sensitive backend details",
        payload: {
          statusCode: 409,
          code: "QUOTE_APPROVAL_CONFLICTS_CHANGED",
          message: "Sensitive backend details",
        },
      }),
    );

    const { result } = renderHook(() => useApproveQuote(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({
      quoteId: "550e8400-e29b-41d4-a716-446655440000",
      startsAt: "2026-08-01T10:00:00.000Z",
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastErrorMock).toHaveBeenCalledWith("Os conflitos mudaram.", {
      id: "approve-quote-QUOTE_APPROVAL_CONFLICTS_CHANGED",
      description: "Refaça a análise de aprovação e envie as resoluções atualizadas.",
    });
    expect(JSON.stringify(toastErrorMock.mock.calls)).not.toContain("Sensitive backend details");
  });
});
