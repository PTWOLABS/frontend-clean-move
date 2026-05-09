import { useMutation } from "@tanstack/react-query";
import { login } from "../api";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ApiError, setAccessToken } from "@/shared/api/httpClient";

export function useLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: login,
    mutationKey: QUERY_KEYS.login,
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
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
