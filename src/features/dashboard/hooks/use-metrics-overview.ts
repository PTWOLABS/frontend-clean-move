import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { fetchMetricsOverview } from "../api/fetch-metrics-overview";

const FIVE_MIN_MS = 5 * 60 * 1000;

export function useMetricsOverview() {
  return useQuery({
    queryKey: QUERY_KEYS.metricsOverview(""),
    queryFn: async () => fetchMetricsOverview(),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
