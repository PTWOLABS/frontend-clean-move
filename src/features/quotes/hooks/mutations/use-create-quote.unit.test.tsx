import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/shared/api/httpClient";

import type { CreateQuoteFormValues } from "../../types/create-quote";

const createQuoteMock = vi.fn();
const routerReplaceMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("../../api/create-quote", () => ({
  createQuote: (...args: unknown[]) => createQuoteMock(...args),
}));

vi.mock("@bprogress/next", () => ({
  useRouter: () => ({ replace: routerReplaceMock }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: vi.fn(),
  },
}));

import { useCreateQuote } from "./use-create-quote";

const formValues: CreateQuoteFormValues = {
  stepOne: {
    customerId: "customer-id",
    customer: {
      name: "Cliente",
      cpfCnpj: null,
      phone: null,
      email: null,
    },
    vehicleId: "vehicle-id",
    vehicleLabel: "Veículo",
    vehicle: {
      plate: "ABC1D23",
      brand: "Honda",
      model: "Civic",
      color: null,
      year: 2024,
    },
  },
  stepTwo: {
    services: [
      {
        serviceId: "550e8400-e29b-41d4-a716-446655440000",
        priceInCents: 10000,
      },
    ],
  },
  stepThree: {
    paymentOptions: [
      {
        method: "PIX",
        label: "Pix",
        installments: null,
        interestFree: null,
        discountType: null,
        discountValue: null,
      },
    ],
    expiresAt: null,
    termsAndConditions: null,
  },
};

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

describe("useCreateQuote", () => {
  beforeEach(() => {
    createQuoteMock.mockReset();
    toastErrorMock.mockReset();
  });

  it("shows mapped code feedback without exposing the backend message", async () => {
    const client = createQueryClient();
    createQuoteMock.mockRejectedValueOnce(
      new ApiError({
        statusCode: 404,
        message: "Sensitive backend details",
        payload: {
          statusCode: 404,
          code: "CUSTOMER_NOT_FOUND",
          message: "Sensitive backend details",
        },
      }),
    );

    const { result } = renderHook(() => useCreateQuote(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate(formValues);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastErrorMock).toHaveBeenCalledWith("Cliente não encontrado.", {
      id: "create-quote-CUSTOMER_NOT_FOUND",
      description:
        "O cliente selecionado não existe mais ou não pertence a este estabelecimento. Selecione outro cliente.",
    });
    expect(JSON.stringify(toastErrorMock.mock.calls)).not.toContain("Sensitive backend details");
  });

  it("shows only the first affected validation area in the toast", async () => {
    const client = createQueryClient();
    createQuoteMock.mockRejectedValueOnce(
      new ApiError({
        statusCode: 400,
        payload: {
          code: "VALIDATION_ERROR",
          errors: [
            { field: "serviceItems.0.priceInCents", code: "OUT_OF_RANGE" },
            { field: "paymentOptions.0.method", code: "INVALID_FORMAT" },
          ],
        },
      }),
    );

    const { result } = renderHook(() => useCreateQuote(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate(formValues);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastErrorMock).toHaveBeenCalledWith("Revise os dados do orçamento.", {
      id: "create-quote-VALIDATION_ERROR",
      description: "Revise os serviços do orçamento antes de continuar.",
    });
  });
});
