/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

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
});
