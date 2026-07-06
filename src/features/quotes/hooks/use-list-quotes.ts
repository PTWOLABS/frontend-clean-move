import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { FIVE_MIN_MS } from "@/shared/constants/times";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { QuotesApiFilters } from "../types/api-filters";
import { listQuotes } from "../api/list-quotes";

export function useListQuotes(filters?: QuotesApiFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.quotes({ filters }),
    queryFn: async () => await listQuotes(filters),
    placeholderData: keepPreviousData,
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
