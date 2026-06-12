import type { QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

export function invalidateServiceCategoryQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceCategories() });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceCategoryOptions() });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services() });
}
