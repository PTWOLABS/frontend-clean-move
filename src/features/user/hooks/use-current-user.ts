"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";
import { ApiError, setAccessToken } from "@/shared/api/httpClient";

import { getCurrentUserProfile } from "../api";

export function useCurrentUser() {
  const { isSuccess: isSessionReady } = useAuthSession();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => getCurrentUserProfile(),
    enabled: isSessionReady,
  });

  useEffect(() => {
    const err = query.error;
    if (!(err instanceof ApiError && err.statusCode === 404)) return;
    setAccessToken(null);
    router.replace("/login");
  }, [query.error, router]);

  return query;
}
