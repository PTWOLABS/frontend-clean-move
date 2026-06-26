import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { ApiError } from "@/shared/api/httpClient";

import { requestPasswordReset } from "../api";

export { PASSWORD_RESET_REQUEST_SUCCESS_MESSAGE } from "../lib/constants";

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: requestPasswordReset,
    mutationKey: QUERY_KEYS.requestPasswordReset,
    onError: (error) => {
      if (error instanceof ApiError) {
        if (error.statusCode === 429) {
          return toast.error("Muitas tentativas. Aguarde cerca de 1 hora e tente novamente.");
        }
        toast.error("Não foi possível enviar o link de recuperação. Tente novamente mais tarde.");
      }
    },
  });
}
