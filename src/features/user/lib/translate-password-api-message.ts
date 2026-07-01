const INVALID_CURRENT_PASSWORD_MESSAGE =
  "A senha atual informada está incorreta. Verifique e tente novamente.";

const SAME_AS_CURRENT_PASSWORD_MESSAGE = "A nova senha deve ser diferente da sua senha atual.";

const INVALID_PASSWORD_CONFIRMATION_CODE_MESSAGE =
  "O código de confirmação é inválido ou expirou. Solicite um novo código e tente novamente.";

const BUSINESS_PASSWORD_MESSAGES: Record<string, string> = {
  "Current password must not be provided when setting the first local password.":
    "Não envie a senha atual ao definir sua primeira senha local.",
  "Current password is required to update an existing local password.":
    "Informe sua senha atual para alterar a senha.",
};

export function translateInvalidCurrentPasswordMessage(): string {
  return INVALID_CURRENT_PASSWORD_MESSAGE;
}

export function translateSameAsCurrentPasswordMessage(): string {
  return SAME_AS_CURRENT_PASSWORD_MESSAGE;
}

export function translateInvalidPasswordConfirmationCodeMessage(): string {
  return INVALID_PASSWORD_CONFIRMATION_CODE_MESSAGE;
}

export function translatePasswordBusinessMessage(message: string): string {
  return BUSINESS_PASSWORD_MESSAGES[message] ?? message;
}
