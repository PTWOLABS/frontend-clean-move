/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

const createAppointmentMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("../../api/create-appointment", () => ({
  createAppointment: (...args: unknown[]) => createAppointmentMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

import { useCreateAppointment } from "./use-create-appointment-mutation";

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

describe("useCreateAppointment", () => {
  it("invalidates appointments and dashboard queries after creating an appointment", async () => {
    const client = createQueryClient();
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");
    const body = {
      customerId: "customer-1",
      services: [{ serviceId: "service-1", priceInCents: 9000 }],
      vehicleId: "vehicle-1",
      startsAt: "2026-05-20T09:00:00.000Z",
      endsAt: "2026-05-20T10:00:00.000Z",
      description: "",
      discountInCents: 0,
    };

    createAppointmentMock.mockResolvedValueOnce({
      appointment: {
        id: "appointment-1",
      },
    });

    const { result } = renderHook(() => useCreateAppointment(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate(body);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(createAppointmentMock).toHaveBeenCalledWith(body);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.appointments() });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.metricsOverview });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.metricsAppointment });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.revenueAndAppointments,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.popularServices });
    expect(toastSuccessMock).toHaveBeenCalledWith("Agendamento criado com sucesso.");
  });
});
