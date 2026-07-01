import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { QueryClient } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { setAccessToken } from "@/shared/api/httpClient";

type FinalizeSessionCleanupOptions = {
  queryClient: QueryClient;
  router: AppRouterInstance;
};

export function finalizeSessionCleanup({ queryClient, router }: FinalizeSessionCleanupOptions) {
  setAccessToken(null);
  queryClient.removeQueries({ queryKey: QUERY_KEYS.authSession });
  queryClient.removeQueries({ queryKey: QUERY_KEYS.userMe() });
  router.replace("/login");
}
