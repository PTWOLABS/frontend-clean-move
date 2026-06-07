"use client";

import { useQuery } from "@tanstack/react-query";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

export function useEstablishmentBannerUrl(establishmentId: string | null | undefined) {
  return useQuery<string | null>({
    queryKey: QUERY_KEYS.establishmentBanner(establishmentId ?? ""),
    queryFn: () => null,
    enabled: !!establishmentId,
    initialData: null,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
