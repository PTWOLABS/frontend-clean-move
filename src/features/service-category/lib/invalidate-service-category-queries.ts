import type { QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { invalidateServiceQueries } from "@/features/service/lib/invalidate-service-queries";

export function invalidateServiceCategoryQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceCategories() });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceCategoryOptions() });
  invalidateServiceQueries(queryClient);
}
