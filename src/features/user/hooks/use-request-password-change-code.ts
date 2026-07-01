import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";

import { requestPasswordChangeCode } from "../api";

export function useRequestPasswordChangeCode() {
  return useMutation({
    mutationFn: requestPasswordChangeCode,
    mutationKey: QUERY_KEYS.requestPasswordChangeCode,
    onSuccess: () => {
      toast.success("Enviamos um código de confirmação para o seu e-mail.");
    },
  });
}
