import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { FIVE_MIN_MS } from "@/shared/constants/times";
import { DashboardTopCustomersFilters } from "../types/dashboard-sections";
import { listTopCustomers } from "../api/list-top-customers";

export function useListTopCustomers(filters?: DashboardTopCustomersFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.topCustomers(filters),
    queryFn: async () => listTopCustomers(filters),
    placeholderData: keepPreviousData,
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
