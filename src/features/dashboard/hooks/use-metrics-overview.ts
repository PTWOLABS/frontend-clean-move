import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { fetchMetricsOverview } from "../api/fetch-metrics-overview";
import { DashboardMetricsOverviewFilters } from "../types/dashboard-sections";
import { FIVE_MIN_MS } from "@/shared/constants/times";

export function useMetricsOverview(filters?: DashboardMetricsOverviewFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.metricsOverview, filters],
    queryFn: async () => fetchMetricsOverview(filters),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
