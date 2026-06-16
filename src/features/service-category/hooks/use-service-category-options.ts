"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { listServiceCategoryOptions } from "../api/list-service-category-options";
import type { ServiceCategoryOptionsQuery } from "../types";

const FIVE_MIN_MS = 5 * 60 * 1000;

type UseServiceCategoryOptionsArgs = ServiceCategoryOptionsQuery & {
  enabled?: boolean;
};

export function useServiceCategoryOptions({
  limit,
  search,
  enabled = true,
}: UseServiceCategoryOptionsArgs = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.serviceCategoryOptions({ limit, search }),
    queryFn: ({ signal }) => listServiceCategoryOptions({ limit, search }, signal),
    enabled,
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
