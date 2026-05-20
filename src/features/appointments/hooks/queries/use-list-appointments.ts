import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { AppointmentsFilters } from "../../types/api-filters";
import { useQuery } from "@tanstack/react-query";
import { listAppointments } from "../../api/list-appointments";
import { FIVE_MIN_MS } from "@/shared/constants/times";

export function useListAppointments(filters?: AppointmentsFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.appointments(filters),
    queryFn: async () => listAppointments(filters),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
