import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { ApiError, setAccessToken } from "@/shared/api/httpClient";

import { login } from "../api";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    mutationKey: QUERY_KEYS.login,
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.authSession });
      router.push("/home");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          return toast.error("Credenciais inválidas");
        }
        toast.error("Não foi possível fazer login. Tente novamente mais tarde");
      }
    },
  });
}
