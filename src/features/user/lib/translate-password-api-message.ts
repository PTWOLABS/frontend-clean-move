const INVALID_CURRENT_PASSWORD_MESSAGE =
  "A senha atual informada está incorreta. Verifique e tente novamente.";

const BUSINESS_PASSWORD_MESSAGES: Record<string, string> = {
  "Current password must not be provided when setting the first local password.":
    "Não envie a senha atual ao definir sua primeira senha local.",
  "Current password is required to update an existing local password.":
    "Informe sua senha atual para alterar a senha.",
};

export function translateInvalidCurrentPasswordMessage(): string {
  return INVALID_CURRENT_PASSWORD_MESSAGE;
}

export function translatePasswordBusinessMessage(message: string): string {
  return BUSINESS_PASSWORD_MESSAGES[message] ?? message;
}
