/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

const updateAppointmentStatusMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("../../api/update-appointment-status", () => ({
  updateAppointmentStatus: (...args: unknown[]) => updateAppointmentStatusMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

import { useUpdateAppointmentStatus } from "./use-update-appointment-status-mutation";

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

describe("useUpdateAppointmentStatus", () => {
  it("invalidates appointments and dashboard queries after updating the status", async () => {
    const client = createQueryClient();
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");
    updateAppointmentStatusMock.mockResolvedValueOnce({
      appointment: {
        id: "appointment-1",
        status: "DONE",
      },
    });

    const { result } = renderHook(() => useUpdateAppointmentStatus(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate({
      appointmentId: "appointment-1",
      status: "DONE",
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateAppointmentStatusMock).toHaveBeenCalledWith("appointment-1", "DONE");
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.appointments() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.metricsOverview });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.metricsAppointment });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.revenueAndAppointments,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.popularServices });
    expect(toastSuccessMock).toHaveBeenCalledWith("Status do agendamento atualizado com sucesso.");
  });
});
