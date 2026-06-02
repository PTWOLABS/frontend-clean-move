import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { FIVE_MIN_MS } from "@/shared/constants/times";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { listAppointments } from "../../api/list-appointments";
import { AppointmentsFilters } from "../../types/api-filters";

export function useListAppointments(filters?: AppointmentsFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.appointments({ filters }),
    queryFn: async () => await listAppointments(filters),
    placeholderData: keepPreviousData,
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
