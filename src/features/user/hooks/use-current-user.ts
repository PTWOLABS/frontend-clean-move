import { useQuery } from "@tanstack/react-query";

import { useAuthSession } from "@/features/auth/hooks/use-auth-session";

import { getCurrentUserProfile } from "../api";

export function useCurrentUser() {
  const { isSuccess: isSessionReady } = useAuthSession();

  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => getCurrentUserProfile(),
    enabled: isSessionReady,
  });
}
