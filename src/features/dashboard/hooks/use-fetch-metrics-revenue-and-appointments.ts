import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { DashboardMetricsRevenueAndAppointmentsFilters } from "../types/dashboard-sections";
import { fetchMetricsRevenueAndAppointments } from "../api/fetch-metrics-revenue-and-appointments";
import { FIVE_MIN_MS } from "@/shared/constants/times";

export function useFetchMetricsRevenueAndAppointment(
  filters?: DashboardMetricsRevenueAndAppointmentsFilters,
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.revenueAndAppointments, filters],
    queryFn: async () => fetchMetricsRevenueAndAppointments(filters),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
