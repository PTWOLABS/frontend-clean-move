import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { ApiError, setAccessToken } from "@/shared/api/httpClient";

import { signOut } from "../api";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  function finalizeLogout() {
    setAccessToken(null);
    queryClient.removeQueries({ queryKey: QUERY_KEYS.authSession });
    queryClient.removeQueries({ queryKey: QUERY_KEYS.userMe() });
    router.replace("/login");
  }

  return useMutation({
    mutationFn: signOut,
    mutationKey: QUERY_KEYS.logout,
    onSuccess: finalizeLogout,
    onError: (error) => {
      if (error instanceof ApiError && error.statusCode === 401) {
        finalizeLogout();
        return;
      }
      if (error instanceof ApiError) {
        toast.error(error.message || "Não foi possível terminar a sessão.");
        return;
      }
      toast.error("Não foi possível terminar a sessão.");
    },
  });
}
