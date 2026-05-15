import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { fetchMetricsOverview } from "../api/fetch-metrics-overview";
import { DashboardMetricsOverviewFilters } from "../types/dashboard-sections";

const FIVE_MIN_MS = 5 * 60 * 1000;

export function useMetricsOverview(filters?: DashboardMetricsOverviewFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.metricsOverview,
    queryFn: async () => fetchMetricsOverview(filters),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
