import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { ApiError, setAccessToken } from "@/shared/api/httpClient";

import { signOut } from "../api";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    mutationKey: QUERY_KEYS.logout,
    onSuccess: () => {
      setAccessToken(null);
      queryClient.removeQueries({ queryKey: QUERY_KEYS.authSession });
      queryClient.removeQueries({ queryKey: ["user", "me"] });
      router.replace("/login");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        toast.error(error.message || "Não foi possível terminar a sessão.");
        return;
      }
      toast.error("Não foi possível terminar a sessão.");
    },
  });
}
