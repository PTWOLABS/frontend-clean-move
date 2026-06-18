import type { QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

export function invalidateServiceQueries(queryClient: QueryClient) {
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.services() });
  void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.serviceOptions() });
}
