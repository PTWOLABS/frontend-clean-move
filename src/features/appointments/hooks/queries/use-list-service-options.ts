import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { DEFAULT_OPTIONS_SIZE } from "@/shared/constants/options";
import { FIVE_MIN_MS } from "@/shared/constants/times";
import { useOptionsInfiniteQuery } from "@/shared/hooks/use-options-infinite-query";

import { listServiceOptions } from "../../api/list-service-options";
import type { OptionsFilters } from "../../types/api-filters";

export function useListServiceOptions(filters?: OptionsFilters) {
  const size = filters?.size ?? DEFAULT_OPTIONS_SIZE;
  const search = filters?.search;

  return useOptionsInfiniteQuery({
    queryKey: QUERY_KEYS.serviceOptions({ size, search }),
    queryFn: ({ page, signal }) => listServiceOptions({ page, size, search }, signal),
    getItems: (page) => page.services,
    getTotalItems: (page) => page.totalItems,
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
