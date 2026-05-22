import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { FIVE_MIN_MS } from "@/shared/constants/times";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { listAppointments } from "../../api/list-appointments";
import { mapAppointmentsToCalendarEvents } from "../../lib/appointments-calendar";

import { AppointmentsCalendarFilters } from "../../types/api-filters";

export function useListAppointments(filters?: AppointmentsCalendarFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.appointments(filters),
    queryFn: async () => listAppointments(filters),
    select: mapAppointmentsToCalendarEvents,
    enabled: Boolean(filters?.startsAt),
    placeholderData: keepPreviousData,
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
