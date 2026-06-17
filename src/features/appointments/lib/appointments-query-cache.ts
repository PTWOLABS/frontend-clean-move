import type { QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import type { AppointmentDTO } from "../types/appointments-dto";

function isAppointmentListData(data: unknown): data is AppointmentDTO {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as AppointmentDTO).appointments)
  );
}

export function removeAppointmentFromAppointmentsCache(
  queryClient: QueryClient,
  appointmentId: string,
) {
  const queries = queryClient.getQueriesData<unknown>({
    queryKey: QUERY_KEYS.appointments(),
  });

  for (const [queryKey, data] of queries) {
    if (!isAppointmentListData(data)) continue;

    const hadAppointment = data.appointments.some(
      (appointment) => appointment.id === appointmentId,
    );
    if (!hadAppointment) continue;

    queryClient.setQueryData<AppointmentDTO>(queryKey, {
      ...data,
      appointments: data.appointments.filter((appointment) => appointment.id !== appointmentId),
      ...(typeof data.totalItems === "number"
        ? { totalItems: Math.max(0, data.totalItems - 1) }
        : {}),
    });
  }
}
