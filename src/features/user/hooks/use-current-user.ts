import { useQuery } from "@tanstack/react-query";

import { getCurrentUserProfile } from "../api";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["user", "me"],
    queryFn: () => getCurrentUserProfile(),
  });
}

