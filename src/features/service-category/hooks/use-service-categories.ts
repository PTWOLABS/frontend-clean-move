"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { listServiceCategories } from "../api/list-service-categories";
import type { ListServiceCategoriesQuery } from "../types";

const FIVE_MIN_MS = 5 * 60 * 1000;

type UseServiceCategoriesArgs = ListServiceCategoriesQuery & {
  enabled?: boolean;
};

export function useServiceCategories({
  includeDeleted,
  enabled = true,
}: UseServiceCategoriesArgs = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.serviceCategories({ includeDeleted }),
    queryFn: ({ signal }) => listServiceCategories({ includeDeleted }, signal),
    enabled,
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
