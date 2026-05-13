import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { fetchAuthSession } from "../lib/fetch-auth-session";

const FIVE_MIN_MS = 5 * 60 * 1000;

export function useAuthSession() {
  return useQuery({
    queryKey: QUERY_KEYS.authSession,
    queryFn: fetchAuthSession,
    staleTime: FIVE_MIN_MS,
    retry: false,
  });
}
