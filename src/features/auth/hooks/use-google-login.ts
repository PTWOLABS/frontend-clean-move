import { useMutation } from "@tanstack/react-query";
import { loginWithGoogle } from "../api";
import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ApiError, setAccessToken } from "@/shared/api/httpClient";

export function useGoogleLogin() {
  const router = useRouter();
  return useMutation({
    mutationFn: loginWithGoogle,
    mutationKey: QUERY_KEYS.googleLogin,
    onSuccess: ({ accessToken }) => {
      setAccessToken(accessToken);
      router.push("/home");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 400) {
          return toast.error("Não foi possível autenticar com Google. Tente novamente.");
        }
        toast.error("Não foi possível fazer login. Tente novamente mais tarde");
      }
    },
  });
}
