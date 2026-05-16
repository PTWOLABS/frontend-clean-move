import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { useQuery } from "@tanstack/react-query";
import { fetchPopularServices } from "../api/fetch-popular-services";
import { DashboardPopularServicesFilters } from "../types/dashboard-sections";

const FIVE_MIN_MS = 5 * 60 * 1000;

export function useFetchPopularServices(filters?: DashboardPopularServicesFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.popularServices,
    queryFn: async () => fetchPopularServices(filters),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
