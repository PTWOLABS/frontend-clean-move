import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { FIVE_MIN_MS } from "@/shared/constants/times";
import { useQuery } from "@tanstack/react-query";

import { OptionsFilters } from "../../types/api-filters";
import { listCustomerOptions } from "../../api/list-customer-options";

export function useListCustomerOptions(filters?: OptionsFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.customerOptions(filters),
    queryFn: async () => listCustomerOptions(filters),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
