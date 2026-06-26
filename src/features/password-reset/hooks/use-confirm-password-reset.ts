import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { ApiError } from "@/shared/api/httpClient";

import { confirmPasswordReset } from "../api";
import { INVALID_PASSWORD_RESET_TOKEN_MESSAGE } from "../lib/constants";
import type { ResetPasswordFormValues } from "../schemas/reset-password-schema";

export { INVALID_PASSWORD_RESET_TOKEN_MESSAGE } from "../lib/constants";

export function isInvalidPasswordResetTokenError(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    error.statusCode === 400 &&
    error.message === INVALID_PASSWORD_RESET_TOKEN_MESSAGE
  );
}

type ConfirmPasswordResetVariables = ResetPasswordFormValues & {
  token: string;
};

export function useConfirmPasswordReset() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({ token, newPassword }: ConfirmPasswordResetVariables) =>
      confirmPasswordReset({ token, newPassword }),
    mutationKey: QUERY_KEYS.confirmPasswordReset,
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso.");
      router.push("/login");
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        if (isInvalidPasswordResetTokenError(error)) {
          return;
        }
        if (error.statusCode === 429) {
          return toast.error("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
        }
        if (error.statusCode === 400) {
          return toast.error(
            error.message || "Não foi possível redefinir a senha. Verifique os dados informados.",
          );
        }
        toast.error("Não foi possível redefinir a senha. Tente novamente mais tarde.");
      }
    },
  });
}
