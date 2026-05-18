import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { fetchPopularServices } from "../api/fetch-popular-services";
import { DashboardPopularServicesFilters } from "../types/dashboard-sections";
import { FIVE_MIN_MS } from "@/shared/constants/times";

export function useFetchPopularServices(filters?: DashboardPopularServicesFilters) {
  return useQuery({
    queryKey: [...QUERY_KEYS.popularServices, filters],
    queryFn: async () => fetchPopularServices(filters),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
