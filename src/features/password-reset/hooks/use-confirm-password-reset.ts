import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { finalizeSessionCleanup } from "@/features/auth/lib/finalize-session-cleanup";
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ token, newPassword }: ConfirmPasswordResetVariables) =>
      confirmPasswordReset({ token, newPassword }),
    mutationKey: QUERY_KEYS.confirmPasswordReset,
    onSuccess: () => {
      toast.success("Senha redefinida com sucesso.");
      finalizeSessionCleanup({ queryClient, router });
    },
  });
}
