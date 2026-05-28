import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { FIVE_MIN_MS } from "@/shared/constants/times";
import { useQuery } from "@tanstack/react-query";

import { OptionsFilters } from "../../types/api-filters";
import { listServiceOptions } from "../../api/list-service-options";

export function useListServiceOptions(filters?: OptionsFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.serviceOptions(filters),
    queryFn: async () => listServiceOptions(filters),
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
