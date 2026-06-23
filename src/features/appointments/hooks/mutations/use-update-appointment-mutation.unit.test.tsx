/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

const updateAppointmentMock = vi.hoisted(() => vi.fn());
const toastSuccessMock = vi.hoisted(() => vi.fn());
const toastErrorMock = vi.hoisted(() => vi.fn());

vi.mock("../../api/update-appointment", () => ({
  updateAppointment: (...args: unknown[]) => updateAppointmentMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

import { useUpdateAppointment } from "./use-update-appointment-mutation";

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

describe("useUpdateAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("invalidates revenue metrics when the discount changes", async () => {
    const client = createQueryClient();
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");

    updateAppointmentMock.mockResolvedValueOnce({
      appointment: {
        id: "appointment-1",
      },
    });

    const { result } = renderHook(() => useUpdateAppointment(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({
      appointmentId: "appointment-1",
      body: {
        discountInCents: 2000,
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateAppointmentMock).toHaveBeenCalledWith("appointment-1", {
      discountInCents: 2000,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.appointments() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.metricsOverview });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.metricsAppointment });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.revenueAndAppointments,
    });
    expect(toastSuccessMock).toHaveBeenCalledWith("O agendamento foi atualizado com sucesso.");
  });

  it.each([
    [
      "customer",
      "Resource not found: customer.",
      "Cliente não encontrado.",
      "O cliente selecionado pode ter sido removido. Atualize a página e selecione outro cliente.",
    ],
    [
      "service",
      "Resource not found: service.",
      "Serviço não encontrado.",
      "Um dos serviços selecionados pode ter sido removido. Atualize a página e selecione novamente.",
    ],
    [
      "vehicle",
      "Resource not found: vehicle.",
      "Veículo não encontrado.",
      "O veículo selecionado pode ter sido removido. Atualize a página e selecione outro veículo.",
    ],
  ])(
    "shows mapped not found feedback when the %s resource is missing",
    async (_resource, backendMessage, title, description) => {
      const client = createQueryClient();

      updateAppointmentMock.mockRejectedValueOnce(
        new ApiError({ statusCode: 404, message: backendMessage }),
      );

      const { result } = renderHook(() => useUpdateAppointment(), {
        wrapper: createWrapper(client),
      });

      result.current.mutate({
        appointmentId: "appointment-1",
        body: {
          customerId: "customer-1",
        },
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toastErrorMock).toHaveBeenCalledWith(
        title,
        expect.objectContaining({
          id: "atualizar-agendamento-appointments-404",
          description,
        }),
      );
      expect(toastSuccessMock).not.toHaveBeenCalled();
    },
  );

  it("shows appointment resource feedback for unknown update not found errors", async () => {
    const client = createQueryClient();

    updateAppointmentMock.mockRejectedValueOnce(
      new ApiError({ statusCode: 404, message: "Resource not found: establishment." }),
    );

    const { result } = renderHook(() => useUpdateAppointment(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({
      appointmentId: "appointment-1",
      body: {
        startsAt: "2026-05-20T09:00:00.000Z",
      },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Recurso do agendamento não encontrado.",
      expect.objectContaining({
        id: "atualizar-agendamento-appointments-404",
        description: "Atualize a página e revise os dados selecionados.",
      }),
    );
  });
});
