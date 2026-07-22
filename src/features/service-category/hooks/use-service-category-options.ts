"use client";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { DEFAULT_OPTIONS_SIZE } from "@/shared/constants/options";
import { FIVE_MIN_MS } from "@/shared/constants/times";
import { useOptionsInfiniteQuery } from "@/shared/hooks/use-options-infinite-query";

import { listServiceCategoryOptions } from "../api/list-service-category-options";
import type { ServiceCategoryOptionsQuery } from "../types";

type UseServiceCategoryOptionsArgs = ServiceCategoryOptionsQuery & {
  enabled?: boolean;
};

export function useServiceCategoryOptions({
  size,
  search,
  enabled = true,
}: UseServiceCategoryOptionsArgs = {}) {
  const resolvedSize = size ?? DEFAULT_OPTIONS_SIZE;

  return useOptionsInfiniteQuery({
    queryKey: QUERY_KEYS.serviceCategoryOptions({ size: resolvedSize, search }),
    queryFn: ({ page, signal }) =>
      listServiceCategoryOptions({ page, size: resolvedSize, search }, signal),
    getItems: (page) => page.categories,
    getTotalItems: (page) => page.totalItems,
    enabled,
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
