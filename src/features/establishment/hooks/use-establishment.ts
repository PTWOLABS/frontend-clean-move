"use client";

import { useQuery } from "@tanstack/react-query";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { getEstablishment } from "../api";

export function useEstablishment(establishmentId: string | null | undefined) {
  const { isSuccess: isSessionReady } = useAuthSession();

  return useQuery({
    queryKey: QUERY_KEYS.establishment(establishmentId ?? ""),
    queryFn: () => getEstablishment(establishmentId!),
    enabled: isSessionReady && !!establishmentId,
  });
}
