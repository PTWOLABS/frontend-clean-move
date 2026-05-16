import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { DashboardMetricsAppointmentsFilters } from "../types/dashboard-sections";
import { fetchMetricsAppointment } from "../api/fetch-metrics-appointment";

const FIVE_MIN_MS = 5 * 60 * 1000;

export function useFetchMetricsAppointment(filters?: DashboardMetricsAppointmentsFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.metricsAppointment,
    queryFn: async () => fetchMetricsAppointment(filters),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
