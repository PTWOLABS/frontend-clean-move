import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { DEFAULT_OPTIONS_SIZE } from "@/shared/constants/options";
import { FIVE_MIN_MS } from "@/shared/constants/times";
import { useOptionsInfiniteQuery } from "@/shared/hooks/use-options-infinite-query";

import { listCustomerOptions } from "../../api/list-customer-options";
import type { OptionsFilters } from "../../types/api-filters";

export function useListCustomerOptions(filters?: OptionsFilters) {
  const size = filters?.size ?? DEFAULT_OPTIONS_SIZE;
  const search = filters?.search;

  return useOptionsInfiniteQuery({
    queryKey: QUERY_KEYS.customerOptions({ size, search }),
    queryFn: ({ page, signal }) => listCustomerOptions({ page, size, search }, signal),
    getItems: (page) => page.customers,
    getTotalItems: (page) => page.totalItems,
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
