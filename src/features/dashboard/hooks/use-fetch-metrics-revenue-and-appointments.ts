import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { DashboardMetricsRevenueAndAppointmentsFilters } from "../types/dashboard-sections";
import { fetchMetricsRevenueAndAppointments } from "../api/fetch-metrics-revenue-and-appointments";

const FIVE_MIN_MS = 5 * 60 * 1000;

export function useFetchMetricsRevenueAndAppointment(
  filters?: DashboardMetricsRevenueAndAppointmentsFilters,
) {
  return useQuery({
    queryKey: QUERY_KEYS.revenueAndAppointments,
    queryFn: async () => fetchMetricsRevenueAndAppointments(filters),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
