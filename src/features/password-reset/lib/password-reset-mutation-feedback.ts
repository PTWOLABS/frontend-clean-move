import type { MutationFeedbackErrorOverride } from "@/shared/hooks/use-mutation-feedback-error";
import { getMutationFeedbackError } from "@/shared/hooks/use-mutation-feedback-error";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

const PASSWORD_RESET_RESOURCE_LABEL = "a senha";
const PASSWORD_RESET_RESOURCE_KEY = QUERY_KEYS.confirmPasswordReset[0];

export const PASSWORD_RESET_CONFIRM_ERROR_OVERRIDE: MutationFeedbackErrorOverride = {
  validation: {
    title: "Verifique os dados informados.",
    message: "Revise os dados informados antes de continuar.",
  },
  badRequest: {
    title: "Não foi possível redefinir a senha.",
    message: "Verifique os dados informados.",
  },
  serverError: {
    title: "Não foi possível redefinir a senha.",
    message: "Tente novamente mais tarde.",
  },
  messages: [
    {
      statusCode: 400,
      match: /too_small|>=8 characters/i,
      message: "A senha deve ter pelo menos 8 caracteres.",
      field: "newPassword",
    },
    {
      statusCode: 400,
      match: /too_big|<=72 characters/i,
      message: "A senha deve ter no máximo 72 caracteres.",
      field: "newPassword",
    },
    {
      statusCode: 400,
      match: /invalid_type/i,
      message: "Informe a nova senha.",
      field: "newPassword",
    },
  ],
};

export function getPasswordResetConfirmFeedbackError(error: unknown) {
  return getMutationFeedbackError(
    PASSWORD_RESET_RESOURCE_LABEL,
    PASSWORD_RESET_RESOURCE_KEY,
    error,
    "update",
    PASSWORD_RESET_CONFIRM_ERROR_OVERRIDE,
  );
}
