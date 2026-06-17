/** @vitest-environment jsdom */

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/shared/api/httpClient";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import type { AppointmentDTO } from "../../types/appointments-dto";

const deleteAppointmentMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("../../api/delete-appointment", () => ({
  deleteAppointment: (...args: unknown[]) => deleteAppointmentMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

import { useDeleteAppointment } from "./use-delete-appointment-mutation";

type Appointment = AppointmentDTO["appointments"][number];

const appointmentA: Appointment = {
  id: "appointment-a",
  establishmentId: "establishment-1",
  customerId: "customer-1",
  customer: { fullName: "Ana Souza" },
  vehicleId: "vehicle-1",
  services: [
    {
      id: "service-1",
      name: "Lavagem",
      category: null,
      durationInMinutes: 60,
      priceInCents: 9000,
    },
  ],
  vehicle: {
    plate: "ABC1234",
    brand: "Honda",
    model: "Fit",
    color: "Prata",
    year: 2020,
  },
  startsAt: "2026-05-20T09:00:00.000Z",
  endsAt: "2026-05-20T10:00:00.000Z",
  description: null,
  discountInCents: null,
  status: "SCHEDULED",
  createdAt: "2026-05-01T09:00:00.000Z",
  updatedAt: "2026-05-01T09:00:00.000Z",
  doneAt: null,
  cancelledAt: null,
};

const appointmentB: Appointment = {
  ...appointmentA,
  id: "appointment-b",
  customerId: "customer-2",
  customer: { fullName: "Bia Lima" },
  startsAt: "2026-05-20T11:00:00.000Z",
  endsAt: "2026-05-20T12:00:00.000Z",
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

describe("useDeleteAppointment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("removes appointment from appointments cache and invalidates only metrics queries after success", async () => {
    const client = createQueryClient();
    const invalidateQueriesSpy = vi.spyOn(client, "invalidateQueries");
    const listKey = QUERY_KEYS.appointments({ filters: { page: 1, size: 10 } });
    const calendarKey = QUERY_KEYS.appointments({
      filters: {
        startsAt: "2026-05-01T00:00:00.000Z",
        endsAt: "2026-06-01T00:00:00.000Z",
      },
    });
    const detailKey = QUERY_KEYS.appointments({ appointmentId: "appointment-a" });
    const listData: AppointmentDTO = { appointments: [appointmentA, appointmentB], totalItems: 2 };
    const calendarData: AppointmentDTO = { appointments: [appointmentA, appointmentB] };
    const detailData = { appointment: appointmentA };

    client.setQueryData(listKey, listData);
    client.setQueryData(calendarKey, calendarData);
    client.setQueryData(detailKey, detailData);
    deleteAppointmentMock.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDeleteAppointment(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate("appointment-a");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(deleteAppointmentMock).toHaveBeenCalledWith("appointment-a");
    expect(client.getQueryData<AppointmentDTO>(listKey)).toEqual({
      appointments: [appointmentB],
      totalItems: 1,
    });
    expect(client.getQueryData<AppointmentDTO>(calendarKey)).toEqual({
      appointments: [appointmentB],
    });
    expect(client.getQueryData(detailKey)).toEqual(detailData);
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.appointments(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.metricsOverview });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.metricsAppointment });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: QUERY_KEYS.revenueAndAppointments,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: QUERY_KEYS.popularServices });
    expect(toastSuccessMock).toHaveBeenCalledWith("Agendamento apagado com sucesso.");
  });

  it("keeps appointments cache and shows overridden feedback when delete fails", async () => {
    const client = createQueryClient();
    const key = QUERY_KEYS.appointments({ filters: { page: 1, size: 10 } });
    const data: AppointmentDTO = { appointments: [appointmentA, appointmentB], totalItems: 2 };

    client.setQueryData(key, data);
    deleteAppointmentMock.mockRejectedValueOnce(
      new ApiError({ statusCode: 400, message: "Invalid appointment id." }),
    );

    const { result } = renderHook(() => useDeleteAppointment(), {
      wrapper: createWrapper(client),
    });

    result.current.mutate("appointment-a");

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(client.getQueryData(key)).toEqual(data);
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Agendamento inválido.",
      expect.objectContaining({
        description: "Verifique o agendamento selecionado e tente novamente.",
      }),
    );
  });
});
